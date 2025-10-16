"use client";

import * as React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { WSClient } from "../../lib/webrtc/signaling";
import { resolveBinding, classesFromStyleProps, cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
    CameraIcon, CameraOffIcon, MicIcon, MicOffIcon, MonitorUpIcon,
    PhoneOffIcon, Settings2Icon, UsersIcon, SignalHighIcon, MaximizeIcon, Volume2Icon
} from "lucide-react";
import { CallElement, UIElement } from "../../types";

type PeerId = string;

type MeshPeerInfo = {
    id: PeerId;
    pc: RTCPeerConnection;
    stream?: MediaStream;
    videoRef: React.RefObject<HTMLVideoElement>;
};
type DeviceChoice = {
    camId?: string;
    micId?: string;
    spkId?: string;
};

type RemoteTrack = { id: string; stream: MediaStream };


const DEFAULT_ICE: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478?transport=udp" },
];

// -------------------------------
// Adapters: Mesh & SFU
// -------------------------------

interface BaseAdapter {
    start(): Promise<void>;
    stop(): void;
    publishLocal(stream: MediaStream | null): Promise<void>;
    handleSignal(msg: any): Promise<void>;
    onRemoteTrack?: (track: RemoteTrack) => void;
    onPeerJoin?: (peerId: string) => void;
    onPeerLeave?: (peerId: string) => void;
}

/** MeshAdapter – your current mesh logic wrapped as an adapter */
class MeshAdapter implements BaseAdapter {
    private ws: WSClient;
    private me: string;
    private roomId: string;
    private iceServers: RTCIceServer[];
    private peers: Record<PeerId, MeshPeerInfo> = {};
    private local: MediaStream | null = null;

    onRemoteTrack?: (track: RemoteTrack) => void;
    onPeerJoin?: (peerId: string) => void;
    onPeerLeave?: (peerId: string) => void;

    constructor(ws: WSClient, me: string, roomId: string, iceServers: RTCIceServer[]) {
        this.ws = ws;
        this.me = me;
        this.roomId = roomId;
        this.iceServers = iceServers;
    }

    async start() {
        this.ws.send({ type: "join", roomId: this.roomId, from: this.me });
    }

    stop() {
        Object.values(this.peers).forEach(p => { try { p.pc.close(); } catch { } });
        this.peers = {};
    }

    async publishLocal(stream: MediaStream | null) {
        this.local = stream;
        // replace tracks on each peer
        Object.values(this.peers).forEach(p => {
            const senders = p.pc.getSenders();
            const v = stream?.getVideoTracks()[0];
            const a = stream?.getAudioTracks()[0];
            if (v) {
                const s = senders.find(s => s.track?.kind === "video");
                if (s) s.replaceTrack(v); else p.pc.addTrack(v, stream!);
            }
            if (a) {
                const s = senders.find(s => s.track?.kind === "audio");
                if (s) s.replaceTrack(a); else p.pc.addTrack(a, stream!);
            }
        });
    }

    private createPeer(peerId: PeerId) {
        const pc = new RTCPeerConnection({ iceServers: this.iceServers });
        const info: MeshPeerInfo = { id: peerId, pc, videoRef: React.createRef<HTMLVideoElement>() as any };

        pc.onicecandidate = (e) => {
            if (e.candidate) this.ws.send({ type: "candidate", roomId: this.roomId, from: this.me, to: peerId, candidate: e.candidate.toJSON() });
        };
        pc.ontrack = (ev) => {
            const [stream] = ev.streams;
            info.stream = stream;
            this.peers[peerId] = info;
            this.onRemoteTrack?.({ id: peerId, stream });
        };
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
                try { pc.close(); } catch { }
                delete this.peers[peerId];
                this.onPeerLeave?.(peerId);
            }
        };

        this.local?.getTracks().forEach(tr => pc.addTrack(tr, this.local!));
        this.peers[peerId] = info;
        return info;
    }

    async handleSignal(msg: any) {
        if (!msg || msg.roomId !== this.roomId || msg.from === this.me) return;

        switch (msg.type) {
            case "join": {
                this.onPeerJoin?.(msg.from);
                const p = this.createPeer(msg.from);
                const offer = await p.pc.createOffer();
                await p.pc.setLocalDescription(offer);
                this.ws.send({ type: "offer", roomId: this.roomId, from: this.me, to: msg.from, sdp: offer });
                break;
            }
            case "offer": {
                const p = this.peers[msg.from]?.pc ? this.peers[msg.from] : this.createPeer(msg.from);
                await p.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                const answer = await p.pc.createAnswer();
                await p.pc.setLocalDescription(answer);
                this.ws.send({ type: "answer", roomId: this.roomId, from: this.me, to: msg.from, sdp: answer });
                break;
            }
            case "answer": {
                const p = this.peers[msg.from];
                if (p) await p.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                break;
            }
            case "candidate": {
                const p = this.peers[msg.from];
                if (p && msg.candidate) {
                    try { await p.pc.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch { }
                }
                break;
            }
            case "leave": {
                const peerId = msg.from;
                const p = this.peers[peerId];
                try { p?.pc?.close(); } catch { }
                delete this.peers[peerId];
                this.onPeerLeave?.(peerId);
                break;
            }
        }
    }
}

/** SFUAdapter – single PC to the SFU, generic signaling.
 *  Server responsibilities:
 *   - Accept 'sfu_join' (roomId, token)
 *   - Reply with 'sfu_offer' OR expect client-offer flow (we handle both).
 *   - Forward ICE candidates 'sfu_candidate'
 *   - Send remote streams via transceivers (ontrack)
 */
class SFUAdapter implements BaseAdapter {
    private ws: WSClient;
    private me: string;
    private roomId: string;
    private iceServers: RTCIceServer[];
    private pc: RTCPeerConnection;
    private local: MediaStream | null = null;
    private autoSubscribe: boolean;

    onRemoteTrack?: (track: RemoteTrack) => void;
    onPeerJoin?: (peerId: string) => void;
    onPeerLeave?: (peerId: string) => void;

    constructor(ws: WSClient, me: string, roomId: string, iceServers: RTCIceServer[], autoSubscribe = true) {
        this.ws = ws;
        this.me = me;
        this.roomId = roomId;
        this.iceServers = iceServers;
        this.pc = new RTCPeerConnection({ iceServers });
        this.autoSubscribe = autoSubscribe;

        this.pc.onicecandidate = (e) => {
            if (e.candidate) this.ws.send({ type: "candidate", roomId: this.roomId, from: this.me, candidate: e.candidate.toJSON() });
        };
        this.pc.ontrack = (ev) => {
            const [stream] = ev.streams;
            if (stream) this.onRemoteTrack?.({ id: stream.id, stream });
        };
    }

    async start() {
        // Tell SFU we joined
        this.ws.send({ type: "join", roomId: this.roomId, from: this.me });
        // In case SFU expects client-offer:
        const offer = await this.pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await this.pc.setLocalDescription(offer);
        this.ws.send({ type: "offer", roomId: this.roomId, from: this.me, sdp: offer });
    }

    stop() {
        try { this.pc.close(); } catch { }
    }

    async publishLocal(stream: MediaStream | null) {
        this.local = stream;
        // Publish tracks to SFU
        if (stream) {
            const v = stream.getVideoTracks()[0];
            const a = stream.getAudioTracks()[0];
            if (v) this.pc.addTrack(v, stream);
            if (a) this.pc.addTrack(a, stream);
            // renegotiate
            const offer = await this.pc.createOffer();
            await this.pc.setLocalDescription(offer);
            this.ws.send({ type: "offer", roomId: this.roomId, from: this.me, sdp: offer });
        }
    }

    async handleSignal(msg: any) {
        if (!msg || msg.roomId !== this.roomId) return;

        switch (msg.type) {
            case "sfu_offer": {
                // Server-initiated renegotiation
                await this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                const answer = await this.pc.createAnswer();
                await this.pc.setLocalDescription(answer);
                this.ws.send({ type: "answer", roomId: this.roomId, from: this.me, sdp: answer });
                break;
            }
            case "sfu_answer": {
                await this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                break;
            }
            case "sfu_candidate": {
                if (msg.candidate) {
                    try { await this.pc.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch { }
                }
                break;
            }
            case "sfu_peer_join": {
                this.onPeerJoin?.(msg.peerId);
                // Auto-subscribe pattern is SFU-specific; many SFUs auto-subscribe by default.
                // If needed, send 'sfu_subscribe' here with desired tracks.
                break;
            }
            case "sfu_peer_leave": {
                this.onPeerLeave?.(msg.peerId);
                break;
            }
        }
    }
}

// -------------------------------
// Component
// -------------------------------

export function CallRenderer({
    element,
    state,
    t,
    runEventHandler,
}: {
    element: CallElement;
    state: Record<string, any>;
    t: (k: string) => string;
    runEventHandler?: (h?: any, d?: any) => Promise<void>;
}) {
    const roomId = String(resolveBinding(element.peerId, state, t));
    const baseWsUrl = String(resolveBinding(element.signalingServer, state, t));
    const sfuWsUrl = element.sfu?.url ? String(resolveBinding(element.sfu.url, state, t)) : baseWsUrl;

    const [me] = useState(() => crypto.randomUUID());
    const [joined, setJoined] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remotes, setRemotes] = useState<Record<string, MediaStream>>({});
    const [muted, setMuted] = useState(false);
    const [videoOn, setVideoOn] = useState(element.callType === "video");
    const [sharing, setSharing] = useState(false);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [choice, setChoice] = useState<DeviceChoice>({});
    const [fullscreen, setFullscreen] = useState(false);

    const iceServers = element.iceServers ?? DEFAULT_ICE;

    const wsRef = useRef<WSClient | null>(null);
    const sfuWsRef = useRef<WSClient | null>(null);
    const adapterRef = useRef<BaseAdapter | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    // ---- analytics heartbeat (unchanged) ----
    useEffect(() => {
        if (!element.tracking?.heartbeatInterval) return;
        const id = setInterval(async () => {
            const statsPerRemote: any[] = [];
            // No standard remote getStats via MediaStream – adapters expose stats if needed.
            // Here we only emit local basic info.
            if (localStream) {
                statsPerRemote.push({
                    local: true,
                    audio: localStream.getAudioTracks().length > 0,
                    video: localStream.getVideoTracks().length > 0,
                });
            }
            if (element.onStats) runEventHandler?.(element.onStats, { roomId, statsPerRemote });
        }, element.tracking.heartbeatInterval * 1000);
        return () => clearInterval(id);
    }, [element.tracking?.heartbeatInterval, localStream, runEventHandler, element.onStats, roomId]);

    const emit = useCallback((event: string, extra: any = {}) => {
        if (!element.tracking) return;
        const payload = { event, roomId, me, ...extra };
        if (element.tracking.dataSourceId) {
            runEventHandler?.({
                action: "api_call",
                dataSourceId: element.tracking.dataSourceId,
                responseType: "none",
                params: { method: "POST", body: payload }
            }, payload);
        } else {
            runEventHandler?.(undefined, payload);
        }
    }, [element.tracking, roomId, me, runEventHandler]);

    // ---- WS setup & adapter selection ----
    useEffect(() => {
        // WS for mesh & signaling
        const ws = new WSClient(baseWsUrl, async (msg) => adapterRef.current?.handleSignal(msg));
        wsRef.current = ws;
        ws.connect();

        // Optional dedicated SFU WS (default to same if not provided)
        const sfuWs = new WSClient(sfuWsUrl, async (msg) => adapterRef.current?.handleSignal(msg));
        sfuWsRef.current = sfuWs;
        if (element.mode === "sfu") sfuWs.connect();

        // Create adapter
        if (element.mode === "sfu") {
            adapterRef.current = new SFUAdapter(
                sfuWsRef.current!,
                me,
                roomId,
                iceServers,
                element.sfu?.autoSubscribe !== false
            );
        } else {
            adapterRef.current = new MeshAdapter(wsRef.current!, me, roomId, iceServers);
        }

        // Remote track hook
        adapterRef.current.onRemoteTrack = ({ id, stream }) => {
            setRemotes(prev => ({ ...prev, [id]: stream }));
        };
        adapterRef.current.onPeerJoin = (pid) => emit("peer_join", { peerId: pid });
        adapterRef.current.onPeerLeave = (pid) => {
            setRemotes(prev => {
                const copy = { ...prev };
                delete copy[pid];
                return copy;
            });
            emit("peer_leave", { peerId: pid });
        };

        // Start
        adapterRef.current.start().then(() => {
            setJoined(true);
            emit("join");
            if (element.onConnect) runEventHandler?.(element.onConnect, { roomId });
        });

        return () => {
            try { adapterRef.current?.stop(); } catch { }
            try { wsRef.current?.send({ type: "leave", roomId, from: me }); } catch { }
            wsRef.current?.close();
            if (element.mode === "sfu") sfuWsRef.current?.close();
            adapterRef.current = null;
            wsRef.current = null;
            sfuWsRef.current = null;
            setJoined(false);
            emit("leave");
            if (element.onDisconnect) runEventHandler?.(element.onDisconnect, { roomId });
        };
    }, [baseWsUrl, sfuWsUrl, element.mode, iceServers, me, roomId, runEventHandler, element.onConnect, element.onDisconnect, emit]);

    // Devices
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(setDevices).catch(() => { });
    }, []);

    // Acquire/replace local media
    const startMedia = useCallback(async (override?: { video?: boolean; audio?: boolean; display?: boolean }) => {
        try {
            const wantVideo = element.callType === "video" && (override?.video ?? true) && !override?.display;
            const wantAudio = override?.audio ?? true;

            const constraints: MediaStreamConstraints = {
                audio: wantAudio ? element.audioConstraints ?? { echoCancellation: true, noiseSuppression: true } : false,
                video: wantVideo ? (element.videoConstraints ?? { width: { ideal: 1280 }, height: { ideal: 720 } }) : false,
            };

            let stream: MediaStream;
            if (override?.display) {
                // @ts-ignore
                stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                setSharing(true);
                emit("screenshare_on");
            } else {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            }

            setLocalStream(prev => {
                prev?.getTracks().forEach(t => t.stop());
                return stream;
            });
            await adapterRef.current?.publishLocal(stream);
        } catch (e) {
            emit("error", { message: String((e as Error).message || e) });
            if (element.onError) runEventHandler?.(element.onError, { message: String(e) });
        }
    }, [element.callType, element.audioConstraints, element.videoConstraints, emit, runEventHandler, element.onError]);

    // Autoplay local media
    useEffect(() => {
        if (element.autoplay !== false) startMedia();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Attach local preview
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.muted = true;
            localVideoRef.current.play().catch(() => { });
        }
    }, [localStream]);

    // Basic controls
    const toggleMute = () => {
        const next = !muted;
        setMuted(next);
        localStream?.getAudioTracks().forEach(t => t.enabled = !next);
        emit(next ? "mute" : "unmute");
    };
    const toggleVideo = () => {
        const next = !videoOn;
        setVideoOn(next);
        localStream?.getVideoTracks().forEach(t => t.enabled = next);
        emit(next ? "camera_on" : "camera_off");
    };
    const toggleShare = async () => {
        if (!sharing) {
            await startMedia({ display: true, video: true, audio: true });
        } else {
            await startMedia({ video: true, audio: true, display: false });
            setSharing(false);
            emit("screenshare_off");
        }
    };
    const applyDevices = async (c: DeviceChoice) => {
        try {
            const constraints: MediaStreamConstraints = {
                audio: c.micId ? { deviceId: { exact: c.micId } } : element.audioConstraints ?? true,
                video: element.callType === "video"
                    ? (c.camId ? { deviceId: { exact: c.camId } } : element.videoConstraints ?? true)
                    : false,
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(prev => {
                prev?.getTracks().forEach(t => t.stop());
                return stream;
            });
            await adapterRef.current?.publishLocal(stream);
            setChoice(c);
            emit("device_change", { camId: c.camId, micId: c.micId });
        } catch (e) {
            emit("error", { message: String(e) });
        }
    };
    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            await containerRef.current.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
        setFullscreen(!!document.fullscreenElement);
    };

    // Layout: auto grid up to 3x3
    const remoteEntries = Object.entries(remotes);
    const gridCols = Math.min(3, Math.ceil(Math.sqrt(remoteEntries.length + 1)));
    const gridClass = `grid grid-cols-${gridCols} gap-2`;
    const showNames = element.showGridNames !== false;

    return (
        <div
            ref={containerRef}
            className={cn("w-full relative overflow-hidden", classesFromStyleProps(element.styles))}
        >
            {/* Top bar – schema-styled */}
            <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
                <Badge className={classesFromStyleProps(element.styles)}>
                    <UsersIcon className="mr-1 h-3 w-3" /> {remoteEntries.length + 1}
                </Badge>
                <Badge className={classesFromStyleProps(element.styles)}>
                    {joined ? t("LIVE") : t("Connecting…")}
                </Badge>
            </div>

            {/* Grid */}
            <div className={cn("p-2 pt-10 md:pt-12", gridClass)}>
                {/* Local */}
                <Tile
                    element={element}
                    name={t("You")}
                    streamRef={localVideoRef as any}
                    mirrored={element.mirrorLocal !== false}
                    muted
                    showName={showNames}
                />
                {remoteEntries.map(([id, stream]) => (
                    <div key={id}>
                        <RemoteTile element={element} name={id.slice(0, 6)} stream={stream} showName={showNames} />
                    </div>
                ))}
            </div>

            {/* Controls – structural classes only; style via element.styles */}
            <div className={cn("absolute bottom-0 left-0 right-0 p-3")}>
                <div className="flex items-center justify-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant={muted ? "destructive" : "secondary"} onClick={toggleMute}>
                                {muted ? <MicOffIcon className="h-5 w-5" /> : <MicIcon className="h-5 w-5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{muted ? t("Unmute") : t("Mute")}</TooltipContent>
                    </Tooltip>

                    {element.callType === "video" && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant={videoOn ? "secondary" : "destructive"} onClick={toggleVideo}>
                                    {videoOn ? <CameraIcon className="h-5 w-5" /> : <CameraOffIcon className="h-5 w-5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{videoOn ? t("Turn camera off") : t("Turn camera on")}</TooltipContent>
                        </Tooltip>
                    )}

                    {element.screenShare !== false && element.callType === "video" && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant={sharing ? "secondary" : "outline"} onClick={toggleShare}>
                                    <MonitorUpIcon className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{sharing ? t("Stop sharing") : t("Share screen")}</TooltipContent>
                        </Tooltip>
                    )}

                    <Separator className={cn("mx-2 h-6", classesFromStyleProps(element.styles))} />

                    {element.devicesMenu !== false && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost"><Settings2Icon className="h-5 w-5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="min-w-[280px]">
                                <DropdownMenuLabel>{t("Microphone")}</DropdownMenuLabel>
                                {devices.filter(d => d.kind === "audioinput").map(d => (
                                    <DropdownMenuItem key={d.deviceId} onSelect={() => applyDevices({ ...choice, micId: d.deviceId })}>
                                        <Volume2Icon className="mr-2 h-4 w-4" /> {d.label || d.deviceId}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>{t("Camera")}</DropdownMenuLabel>
                                {devices.filter(d => d.kind === "videoinput").map(d => (
                                    <DropdownMenuItem key={d.deviceId} onSelect={() => applyDevices({ ...choice, camId: d.deviceId })}>
                                        <CameraIcon className="mr-2 h-4 w-4" /> {d.label || d.deviceId}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={toggleFullscreen}>
                                <MaximizeIcon className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{fullscreen ? t("Exit Fullscreen") : t("Fullscreen")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => {
                                    // Tell adapter/WS we're leaving
                                    try { wsRef.current?.send({ type: "leave", roomId, from: me }); } catch { }
                                }}
                            >
                                <PhoneOffIcon className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("Leave")}</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

/** Local video tile */
function Tile({
    element, name, streamRef, mirrored, muted, showName = true,
}: {
    element: UIElement;
    name: string;
    streamRef: React.RefObject<HTMLVideoElement>;
    mirrored?: boolean;
    muted?: boolean;
    showName?: boolean;
}) {
    return (
        <div className={cn("relative aspect-video overflow-hidden", classesFromStyleProps(element.styles))}>
            <video
                ref={streamRef}
                className={cn("h-full w-full object-cover", mirrored && "scale-x-[-1]")}
                playsInline
                autoPlay
                muted={muted}
            />
            {showName && (
                <div className={cn("absolute left-2 bottom-2 text-xs px-2 py-1 rounded", classesFromStyleProps(element.styles))}>
                    <SignalHighIcon className="inline mr-1 h-3 w-3" />
                    {name}
                </div>
            )}
        </div>
    );
}

/** Remote video tile */
function RemoteTile({
    element, name, stream, showName = true,
}: {
    element: UIElement;
    name: string;
    stream: MediaStream;
    showName?: boolean;
}) {
    const ref = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
            ref.current.play().catch(() => { });
        }
    }, [stream]);
    return (
        <div className={cn("relative aspect-video overflow-hidden", classesFromStyleProps(element.styles))}>
            <video ref={ref} className="h-full w-full object-cover" playsInline autoPlay />
            {showName && (
                <div className={cn("absolute left-2 bottom-2 text-xs px-2 py-1 rounded", classesFromStyleProps(element.styles))}>
                    <SignalHighIcon className="inline mr-1 h-3 w-3" />
                    {name}
                </div>
            )}
        </div>
    );
}
