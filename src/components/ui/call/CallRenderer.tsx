"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { WSClient, SignalMessage } from "@/src/lib/webrtc/signaling";
import { resolveBinding, classesFromStyleProps, cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
    CameraIcon, CameraOffIcon, MicIcon, MicOffIcon, MonitorUpIcon,
    PhoneOffIcon, Settings2Icon, UsersIcon, SignalHighIcon, MaximizeIcon, Volume2Icon
} from "lucide-react";
import { CallElement, UIElement } from "@/src/types";

type PeerId = string;

type PeerInfo = {
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

const DEFAULT_ICE: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478?transport=udp" },
];

export function CallRenderer({
    element,
    state,
    t,
    runEventHandler,
}: {
    element: CallElement;
    state: Record<string, any>;
    t: (k: string) => string;
    runEventHandler: (h?: any, d?: any) => Promise<void>;
}) {
    const roomId = String(resolveBinding(element.peerId, state, t));
    const wsUrl = String(resolveBinding(element.signalingServer, state, t));
    const [me] = useState(() => crypto.randomUUID());
    const [joined, setJoined] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [peers, setPeers] = useState<Record<PeerId, PeerInfo>>({});
    const [muted, setMuted] = useState(false);
    const [videoOn, setVideoOn] = useState(element.callType === "video");
    const [sharing, setSharing] = useState(false);
    const [showDevices, setShowDevices] = useState(false);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [choice, setChoice] = useState<DeviceChoice>({});
    const [fullscreen, setFullscreen] = useState(false);

    const wsRef = useRef<WSClient | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const iceServers = element.iceServers ?? DEFAULT_ICE;
    useEffect(() => {
        if (!element.tracking?.heartbeatInterval) return;
        const id = setInterval(async () => {
            const statsPerPeer: any[] = [];
            await Promise.all(Object.values(peers).map(async p => {
                const r = await p.pc.getStats();
                const agg: any = { peerId: p.id };
                r.forEach((s) => {
                    if (s.type === "outbound-rtp" && s.kind === "video") {
                        agg.outVideo = { framesSent: s.framesSent, bitrate: s.bitrateMean ?? s.bytesSent };
                    }
                    if (s.type === "inbound-rtp" && s.kind === "video") {
                        agg.inVideo = { framesDecoded: s.framesDecoded, jitter: s.jitter, packetsLost: s.packetsLost };
                    }
                });
                statsPerPeer.push(agg);
            }));
            if (element.onStats) runEventHandler(element.onStats, { roomId, statsPerPeer });
        }, element.tracking.heartbeatInterval * 1000);
        return () => clearInterval(id);
    }, [element.tracking?.heartbeatInterval, peers, runEventHandler, element.onStats, roomId]);

    const emit = useCallback((event: string, extra: any = {}) => {
        if (!element.tracking) return;
        const payload = { event, roomId, me, ...extra };
        if (element.tracking.dataSourceId) {
            runEventHandler({
                action: "api_call",
                dataSourceId: element.tracking.dataSourceId,
                responseType: "none",
                params: { method: "POST", body: payload }
            }, payload);
        } else {
            runEventHandler(undefined, payload);
        }
    }, [element.tracking, roomId, me, runEventHandler]);

    const createPeer = useCallback((peerId: PeerId) => {
        const pc = new RTCPeerConnection({ iceServers });
        const info: PeerInfo = { id: peerId, pc, videoRef: React.createRef<HTMLVideoElement>() as any };

        pc.onicecandidate = (e) => {
            if (e.candidate) send({ type: "candidate", roomId, from: me, to: peerId, candidate: e.candidate.toJSON() });
        };
        pc.ontrack = (ev) => {
            const [stream] = ev.streams;
            info.stream = stream;
            setPeers(prev => ({ ...prev, [peerId]: info }));
        };
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
                setPeers(prev => {
                    const copy = { ...prev };
                    delete copy[peerId];
                    return copy;
                });
                emit("peer_disconnected", { peerId });
            }
        };

        // add local tracks
        localStream?.getTracks().forEach(track => pc.addTrack(track, localStream));

        setPeers(prev => ({ ...prev, [peerId]: info }));
        return info;
    }, [iceServers, localStream, roomId, me, emit]);

    const send = (msg: SignalMessage) => wsRef.current?.send(msg);

    const handleSignal = useCallback(async (msg: any) => {
        if (!msg || msg.roomId !== roomId || msg.from === me) return;

        switch (msg.type) {
            case "join": {
                // someone joined; we (existing) create offer to them
                const p = createPeer(msg.from);
                const offer = await p.pc.createOffer();
                await p.pc.setLocalDescription(offer);
                send({ type: "offer", roomId, from: me, to: msg.from, sdp: offer });
                break;
            }
            case "offer": {
                const p = peers[msg.from]?.pc ? peers[msg.from] : createPeer(msg.from);
                await p.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                const answer = await p.pc.createAnswer();
                await p.pc.setLocalDescription(answer);
                send({ type: "answer", roomId, from: me, to: msg.from, sdp: answer });
                break;
            }
            case "answer": {
                const p = peers[msg.from];
                if (p) await p.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                break;
            }
            case "candidate": {
                const p = peers[msg.from];
                if (p && msg.candidate) {
                    try { await p.pc.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch {/* ignore */ }
                }
                break;
            }
            case "leave": {
                setPeers(prev => {
                    const copy = { ...prev };
                    const peer = copy[msg.from];
                    try { peer?.pc?.close(); } catch { }
                    delete copy[msg.from];
                    return copy;
                });
                emit("peer_leave", { peerId: msg.from });
                break;
            }
        }
    }, [roomId, me, peers, createPeer, send, emit]);

    // Init WS + join
    useEffect(() => {
        const client = new WSClient(wsUrl, handleSignal);
        wsRef.current = client;
        client.connect();
        const grace = setTimeout(() => {
            client.send({ type: "join", roomId, from: me });
            setJoined(true);
            emit("join");
            if (element.onConnect) runEventHandler(element.onConnect, { roomId });
        }, 200);
        return () => {
            clearTimeout(grace);
            try {
                client.send({ type: "leave", roomId, from: me });
            } catch { }
            client.close();
            wsRef.current = null;
            setJoined(false);
            emit("leave");
            if (element.onDisconnect) runEventHandler(element.onDisconnect, { roomId });
        };
    }, [wsUrl, roomId, me, handleSignal, runEventHandler, element.onConnect, element.onDisconnect, emit]);

    // Enumerate devices
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(setDevices).catch(() => { });
    }, []);

    // Acquire local media
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
                // screen share
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

            // Replace tracks in active PCs
            Object.values(peers).forEach(p => {
                const senders = p.pc.getSenders();
                const vTrack = stream.getVideoTracks()[0];
                const aTrack = stream.getAudioTracks()[0];
                if (vTrack) {
                    const s = senders.find(s => s.track?.kind === "video");
                    if (s) s.replaceTrack(vTrack); else p.pc.addTrack(vTrack, stream);
                }
                if (aTrack) {
                    const s = senders.find(s => s.track?.kind === "audio");
                    if (s) s.replaceTrack(aTrack); else p.pc.addTrack(aTrack, stream);
                }
            });
        } catch (e) {
            emit("error", { message: String((e as Error).message || e) });
            if (element.onError) runEventHandler(element.onError, { message: String(e) });
        }
    }, [element.callType, element.audioConstraints, element.videoConstraints, peers, emit, runEventHandler, element.onError]);

    // Auto start
    useEffect(() => {
        if (element.autoplay !== false) startMedia();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Mute/unmute & video on/off
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

    // Screen share
    const toggleShare = async () => {
        if (!sharing) {
            await startMedia({ display: true, video: true, audio: true });
        } else {
            await startMedia({ video: true, audio: true, display: false });
            setSharing(false);
            emit("screenshare_off");
        }
    };

    // Device change (camera/mic)
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
            Object.values(peers).forEach(p => {
                const senders = p.pc.getSenders();
                const vTrack = stream.getVideoTracks()[0];
                const aTrack = stream.getAudioTracks()[0];
                if (vTrack) {
                    const s = senders.find(s => s.track?.kind === "video");
                    if (s) s.replaceTrack(vTrack); else p.pc.addTrack(vTrack, stream);
                }
                if (aTrack) {
                    const s = senders.find(s => s.track?.kind === "audio");
                    if (s) s.replaceTrack(aTrack); else p.pc.addTrack(aTrack, stream);
                }
            });
            setChoice(c);
            emit("device_change", { camId: c.camId, micId: c.micId });
        } catch (e) {
            emit("error", { message: String(e) });
        }
    };

    // Attach local stream to a hidden self video (for mirror preview)
    const localVideoRef: any = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.muted = true;
            localVideoRef.current.play().catch(() => { });
        }
    }, [localStream]);

    // Attach remote streams to tiles
    useEffect(() => {
        Object.values(peers).forEach(p => {
            if (p.videoRef.current && p.stream) {
                if (p.videoRef.current.srcObject !== p.stream) {
                    p.videoRef.current.srcObject = p.stream;
                    p.videoRef.current.play().catch(() => { });
                }
            }
        });
    }, [peers]);

    // Fullscreen
    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            await containerRef.current.requestFullscreen();
            setFullscreen(true);
        } else {
            await document.exitFullscreen();
            setFullscreen(false);
        }
    };

    // Layout: simple responsive grid (up to maxPeers)
    const peerList = Object.values(peers).slice(0, element.maxPeers ?? 9);
    const gridCols = Math.min(3, Math.ceil(Math.sqrt(Math.max(1, peerList.length + 1))));
    const gridClass = `grid grid-cols-${gridCols} gap-2`;

    return (
        <div ref={containerRef} className={cn(
            "w-full relative overflow-hidden",       // structural classes only
            classesFromStyleProps(element.styles)    // schema-driven styles
        )}>
            {/* Top bar */}
            <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
                <Badge
                    variant="secondary"
                    className={cn(
                        "backdrop-blur",
                        classesFromStyleProps(element.styles || { className: '"bg-white/10 text-white ' })   // colors, font, etc. from schema
                    )}
                >
                    <UsersIcon className="mr-1 h-3 w-3" /> {peerList.length + 1}
                </Badge>

                {joined ? <Badge className="bg-emerald-600">LIVE</Badge> : <Badge className="bg-slate-600">Connecting…</Badge>}
            </div>

            {/* Video Grid */}
            <div className={cn("p-2 pt-10 md:pt-12", gridClass)}>
                {/* Local tile */}
                <Tile
                    element={element}
                    name="You"
                    streamRef={localVideoRef}
                    mirrored={element.mirrorLocal !== false}
                    muted
                    showName={element.showGridNames !== false}
                />

                {/* Remote tiles */}
                <AnimatePresence>
                    {peerList.map((p) => (
                        <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Tile
                                element={element}
                                name={p.id.slice(0, 6)}
                                streamRef={p.videoRef}
                                showName={element.showGridNames !== false}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center justify-center gap-2">
                    {/* Mic */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant={muted ? "destructive" : "secondary"} onClick={toggleMute}>
                                {muted ? <MicOffIcon className="h-5 w-5" /> : <MicIcon className="h-5 w-5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{muted ? t("Unmute") : t("Mute")}</TooltipContent>
                    </Tooltip>

                    {/* Cam */}
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

                    {/* Screen share */}
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

                    {/* Spacer */}
                    <Separator orientation="vertical" className="mx-2 h-6 bg-white/20" />

                    {/* Devices */}
                    {element.devicesMenu !== false && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost"><Settings2Icon className="h-5 w-5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="min-w-[280px]">
                                <DropdownMenuLabel>Microphone</DropdownMenuLabel>
                                {devices.filter(d => d.kind === "audioinput").map(d => (
                                    <DropdownMenuItem
                                        key={d.deviceId}
                                        onSelect={() => applyDevices({ ...choice, micId: d.deviceId })}
                                    >
                                        <Volume2Icon className="mr-2 h-4 w-4" /> {d.label || d.deviceId}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Camera</DropdownMenuLabel>
                                {devices.filter(d => d.kind === "videoinput").map(d => (
                                    <DropdownMenuItem
                                        key={d.deviceId}
                                        onSelect={() => applyDevices({ ...choice, camId: d.deviceId })}
                                    >
                                        <CameraIcon className="mr-2 h-4 w-4" /> {d.label || d.deviceId}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Fullscreen */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={toggleFullscreen}>
                                <MaximizeIcon className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{fullscreen ? t("Exit Fullscreen") : t("Fullscreen")}</TooltipContent>
                    </Tooltip>

                    {/* Leave */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="destructive" onClick={() => wsRef.current?.send({ type: "leave", roomId, from: me })}>
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

/** Video tile with name overlay */
function Tile({
    element,
    name,
    streamRef,
    mirrored,
    muted,
    showName = true,
}: {
    element: UIElement,
    name: string;
    streamRef: React.RefObject<HTMLVideoElement>;
    mirrored?: boolean;
    muted?: boolean;
    showName?: boolean;
}) {
    return (
        <div className="relative rounded-lg overflow-hidden bg-zinc-900 aspect-video">
            <video
                ref={streamRef}
                className={cn("h-full w-full object-cover", mirrored && "scale-x-[-1]")}
                playsInline
                autoPlay
                muted={muted}
            />
            {showName && (
                <div
                    className={cn(
                        "absolute left-2 bottom-2 text-xs px-2 py-1 rounded",
                        classesFromStyleProps(element.styles || { className: 'text-white bg-black/50 ' })
                    )}
                >
                    <SignalHighIcon className="inline mr-1 h-3 w-3" />
                    {name}
                </div>
            )}
        </div>
    );
}
