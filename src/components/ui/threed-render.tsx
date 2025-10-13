"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { cn, resolveBinding, classesFromStyleProps } from "../../lib/utils";
import { ThreeDModelElement } from "../../types";
import { CallRenderer } from "./call-renderer";
import { VoiceRenderer } from "./voice-renderer";

export function ThreeDRenderer({
    threeElement,
    state,
    t,
    runEventHandler,
}: {
    threeElement: ThreeDModelElement & { stereo?: boolean };
    state: Record<string, any>;
    t: (k: string) => string;
    runEventHandler?: (h?: any, d?: any) => Promise<void>;
}) {
    const sceneRef = useRef<HTMLElement | null>(null);
    const assetsRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const element = threeElement;

    // UI State for Video Controls
    const [isPlaying, setIsPlaying] = useState(element.autoplay ?? false);
    const [isMuted, setIsMuted] = useState(element.autoplay ?? true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Resolve schema bindings
    const srcResolved = element.src ? String(resolveBinding(element.src, state, t)) : undefined;
    const skySrc = element.environment?.sky
        ? String(resolveBinding(element.environment.sky, state, t))
        : undefined;

    const callVideoId =
        element.inSceneVideo?.enabled ? element.inSceneVideo.videoId || "remote-video-tex" : undefined;

    const is360Video = element.mode === "360_video";
    const isVR = element.mode === "vr";
    const isAR = element.mode === "ar" || element.mode === "ar_marker";

    const videoSphereSource = useMemo(() => {
        if (!is360Video) return undefined;
        return srcResolved;
    }, [is360Video, srcResolved]);

    // Load A-Frame once
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!(window as any).AFRAME) {
            const s = document.createElement("script");
            s.src = "https://aframe.io/releases/1.7.0/aframe.min.js";
            s.async = true;
            document.body.appendChild(s);
        }
    }, []);

    // Initialize Video for 360 Mode
    useEffect(() => {
        const video = videoRef.current;
        if (!is360Video || !video || !videoSphereSource) return;
        setIsLoading(true);
        setError(null);

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        const useHls = element.streaming === "hls" && !video.canPlayType("application/vnd.apple.mpegurl");
        if (useHls && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hlsRef.current = hls;
            hls.loadSource(videoSphereSource);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setDuration(video.duration || 0);
                setIsLoading(false);
                attemptPlay(video);
            });
            hls.on(Hls.Events.ERROR, (_, data) => {
                setError(`HLS Error: ${data.details} (Fatal: ${data.fatal})`);
                setIsLoading(false);
                if (data.fatal && hls) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
            });
        } else {
            video.src = videoSphereSource;
            video.onloadedmetadata = () => {
                setDuration(video.duration || 0);
                setIsLoading(false);
                attemptPlay(video);
            };
            video.onerror = (e) => {
                setIsLoading(false);
                setError(`Video error: ${e}`);
            };
        }

        const onTime = () => setCurrentTime(video.currentTime || 0);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        video.addEventListener("timeupdate", onTime);
        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);

        return () => {
            video.removeEventListener("timeupdate", onTime);
            video.removeEventListener("play", onPlay);
            video.removeEventListener("pause", onPause);
            if (hlsRef.current) hlsRef.current.destroy();
        };
    }, [is360Video, videoSphereSource, element.streaming]);

    // Attempt to play with muted fallback
    const attemptPlay = (video: HTMLVideoElement) => {
        video.play().catch((err) => {
            console.warn("Autoplay blocked, attempting with muted:", err);
            video.muted = true;
            setIsMuted(true);
            video.play().catch((e) => {
                setError(`Playback failed: ${e.message}`);
                console.error("Playback error:", e);
            });
        });
    };

    // Ensure video asset exists for inSceneVideo
    useEffect(() => {
        if (!element.inSceneVideo?.enabled || !callVideoId) return;
        const assets = assetsRef.current;
        if (!assets) return;
        let v = assets.querySelector<HTMLVideoElement>(`#${CSS.escape(callVideoId)}`);
        if (!v) {
            v = document.createElement("video");
            v.id = callVideoId;
            v.setAttribute("playsinline", "");
            v.setAttribute("crossorigin", "anonymous");
            v.muted = true;
            assets.appendChild(v);
        }
    }, [element.inSceneVideo?.enabled, callVideoId]);

    const peerRefs = useRef<Record<string, { videoEl: HTMLVideoElement; entityEl?: HTMLElement }>>({});

    // Remote stream → A-Frame
    useEffect(() => {
        const onRemote = async ({ peerId, stream }: { peerId: string; stream: MediaStream }) => {
            const assets = assetsRef.current;
            const scene = sceneRef.current;
            if (!assets || !scene) return;

            // Single video mode
            if (element.inSceneVideo?.enabled && callVideoId) {
                const target = assets.querySelector<HTMLVideoElement>(`#${CSS.escape(callVideoId)}`);
                if (target) {
                    target.srcObject = stream;
                    try {
                        await target.play();
                    } catch { }
                }
            }

            // Multi-peer mode
            if (element.multiPeerSpawn?.enabled) {
                const vidId = `peer-${peerId}`;
                let v = assets.querySelector<HTMLVideoElement>(`#${CSS.escape(vidId)}`);
                if (!v) {
                    v = document.createElement("video");
                    v.id = vidId;
                    v.setAttribute("playsinline", "");
                    v.setAttribute("crossorigin", "anonymous");
                    v.muted = true;
                    assets.appendChild(v);
                }
                v.srcObject = stream;
                try {
                    await v.play();
                } catch { }

                let ent = scene.querySelector<HTMLElement>(`[data-peer-id="${peerId}"]`);
                if (!ent) {
                    ent = document.createElement("a-entity");
                    ent.setAttribute("data-peer-id", peerId);

                    if (element.multiPeerSpawn.shape === "plane" || !element.multiPeerSpawn.shape) {
                        ent.setAttribute(
                            "geometry",
                            `primitive: plane; width: ${element.multiPeerSpawn.size?.[0] ?? 1.2}; height: ${element.multiPeerSpawn.size?.[1] ?? 0.675}`
                        );
                        ent.setAttribute(
                            "material",
                            `src: #${vidId}; transparent: ${element.multiPeerSpawn.transparent ? "true" : "false"}`
                        );
                    } else if (element.multiPeerSpawn.shape === "sphere") {
                        ent.setAttribute("geometry", `primitive: sphere; radius: ${element.multiPeerSpawn.radius ?? 0.6}`);
                        ent.setAttribute(
                            "material",
                            `src: #${vidId}; transparent: ${element.multiPeerSpawn.transparent ? "true" : "false"}`
                        );
                    } else if (element.multiPeerSpawn.shape === "avatar") {
                        if (element.multiPeerSpawn.avatarModel) {
                            ent.setAttribute("gltf-model", element.multiPeerSpawn.avatarModel);
                            ent.setAttribute("scale", "1 1 1");
                        }
                        const face = document.createElement("a-entity");
                        face.setAttribute(
                            "geometry",
                            `primitive: plane; width: ${element.multiPeerSpawn.size?.[0] ?? 0.6}; height: ${element.multiPeerSpawn.size?.[1] ?? 0.6}`
                        );
                        face.setAttribute(
                            "material",
                            `src: #${vidId}; transparent: ${element.multiPeerSpawn.transparent ? "true" : "false"}`
                        );
                        const [fx, fy, fz] = element.multiPeerSpawn.faceAttachment ?? [0, 1.6, 0.15];
                        face.setAttribute("position", `${fx} ${fy} ${fz}`);
                        ent.appendChild(face);
                    }

                    // Position around user (circle layout default)
                    const count = Object.keys(peerRefs.current).length + 1;
                    const angleRad = ((count - 1) * (360 / Math.max(count, 2))) * (Math.PI / 180);
                    const dist = element.multiPeerSpawn.distance ?? 2.2;
                    const y = element.multiPeerSpawn.height ?? 1.6;
                    const x = Math.cos(angleRad) * dist;
                    const z = -Math.sin(angleRad) * dist;
                    ent.setAttribute("position", `${x} ${y} ${z}`);
                    ent.setAttribute("look-at", "[camera]");

                    scene.appendChild(ent);
                }

                peerRefs.current[peerId] = { videoEl: v, entityEl: ent };
            }
        };

        const onPeerLeave = ({ peerId }: { peerId: string }) => {
            const assets = assetsRef.current;
            const scene = sceneRef.current;
            const ref = peerRefs.current[peerId];
            if (ref) {
                if (ref.entityEl && scene?.contains(ref.entityEl)) scene.removeChild(ref.entityEl);
                if (assets?.contains(ref.videoEl)) {
                    ref.videoEl.srcObject = null;
                    assets.removeChild(ref.videoEl);
                }
                delete peerRefs.current[peerId];
            }
        };

        (state as any).__onRemoteStream = onRemote;
        (state as any).__onPeerLeave = onPeerLeave;

        return () => {
            const assets = assetsRef.current;
            const scene = sceneRef.current;
            Object.values(peerRefs.current).forEach(({ videoEl, entityEl }) => {
                if (entityEl && scene?.contains(entityEl)) scene.removeChild(entityEl);
                if (assets?.contains(videoEl)) {
                    videoEl.srcObject = null;
                    assets.removeChild(videoEl);
                }
            });
            peerRefs.current = {};
            delete (state as any).__onRemoteStream;
            delete (state as any).__onPeerLeave;
        };
    }, [element.inSceneVideo?.enabled, callVideoId, element.multiPeerSpawn?.enabled, state]);

    // Video Control Handlers
    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) {
            v.play().catch((err) => setError(`Play failed: ${err.message}`));
        } else {
            v.pause();
        }
    };

    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
        setIsMuted(v.muted);
    };

    const seekTo = (t: number) => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = Math.max(0, Math.min(duration, t));
        setCurrentTime(v.currentTime);
    };

    const formatTime = (s: number) => {
        if (!Number.isFinite(s)) return "0:00";
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60).toString().padStart(2, "0");
        return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${sec}` : `${m}:${sec}`;
    };

    // Handle seek bar click in 3D
    const handleSeekClick = (event: any) => {
        const v = videoRef.current;
        if (!v || !duration) return;
        const rect = event.target.getBoundingClientRect();
        const clickX = event.detail.intersection.point.x;
        const width = 2; // Seek bar width in 3D space (meters)
        const percent = (clickX + width / 2) / width; // Normalize to [0,1]
        const t = duration * percent;
        seekTo(t);
    };

    return (
        <div className={cn("relative w-full h-full", classesFromStyleProps(element.styles))}>
            <a-scene
                ref={sceneRef as any}
                vr-mode-ui={`enabled: ${isVR ? "true" : "false"}`}
                embedded
                style={{ width: "100%", height: "100%" }}
                renderer="antialias: true"
                xrmode={isAR ? "ar" : undefined}
                device-orientation-permission-ui="enabled: true"
            >
                <a-assets ref={assetsRef as any}>
                    {is360Video && videoSphereSource && (
                        <video
                            ref={videoRef}
                            id="video360"
                            playsInline
                            crossOrigin="anonymous"
                            loop={element.loop ?? true}
                            autoPlay={element.autoplay ?? true}
                            muted={element.autoplay ?? true}
                        />
                    )}
                    {element.inSceneVideo?.enabled && callVideoId && (
                        <video id={callVideoId} playsInline crossOrigin="anonymous" muted />
                    )}
                </a-assets>

                {skySrc && !is360Video && <a-sky src={skySrc} />}
                {element.environment?.ground && (
                    <a-entity
                        geometry="primitive: plane; width: 100; height: 100"
                        rotation="-90 0 0"
                        material={`color: ${element.environment.groundColor || "#7BC8A4"}`}
                        position="0 0 0"
                    />
                )}

                {is360Video ? (
                    element.stereo ? (
                        <a-entity
                            stereo={`src: #video360; mode: ${isVR ? "top-bottom" : "left-right"}`}
                            rotation={(element.rotation || [0, 180, 0]).join(" ")}
                        />
                    ) : (
                        <a-videosphere
                            src="#video360"
                            rotation={(element.rotation || [0, 180, 0]).join(" ")}
                        />
                    )
                ) : (
                    srcResolved && (
                        <a-entity
                            gltf-model={srcResolved}
                            position={(element.position || [0, 1.6, -2]).join(" ")}
                            rotation={(element.rotation || [0, 0, 0]).join(" ")}
                            scale={(element.scale || [1, 1, 1]).join(" ")}
                        />
                    )
                )}

                {(element.portals || []).map((p, i) => (
                    <a-entity
                        key={i}
                        geometry="primitive: ring; radiusInner: 0.85; radiusOuter: 1"
                        material={`color: ${p.color}; opacity: ${p.opacity}`}
                        position={p.position.join(" ")}
                        class="clickable"
                        onclick={() => p.onEvent && runEventHandler(p.onEvent)}
                    />
                ))}

                {element.inSceneVideo?.enabled && callVideoId && (
                    <a-entity
                        geometry={`primitive: plane; width: ${element.inSceneVideo.size?.[0] ?? 1.6}; height: ${element.inSceneVideo.size?.[1] ?? 0.9}`}
                        material={`src: #${callVideoId}; transparent: ${element.inSceneVideo.transparent ? "true" : "false"}`}
                        position={(element.inSceneVideo.position || [0, 1.6, -2]).join(" ")}
                        rotation={(element.inSceneVideo.rotation || [0, 0, 0]).join(" ")}
                        scale={(element.inSceneVideo.scale || [1, 1, 1]).join(" ")}
                    />
                )}

                {/* 3D Controls for 360 Video */}
                {is360Video && (
                    <a-entity position="0 0 0" id="controls" look-at="[camera]">
                        {/* Loading/Error Display */}
                        {(isLoading || error) && (
                            <a-text
                                value={error || "Loading Video..."}
                                color="white"
                                align="center"
                                width="2"
                                position="0 -0.5 -2"
                                material="color: black; opacity: 0.8"
                            />
                        )}

                        {/* Control Bar Background */}
                        <a-plane
                            position="0 -0.7 -2"
                            width="2.5"
                            height="0.4"
                            material="color: black; opacity: 0.8"
                        />

                        {/* Play/Pause Button */}
                        <a-plane
                            position="-0.9 -0.7 -2"
                            width="0.2"
                            height="0.2"
                            material={`color: white; opacity: 0.9; src: #${isPlaying ? "pause-icon" : "play-icon"}`}
                            class="clickable"
                            cursor="rayOrigin: mouse"
                            onclick={togglePlay}
                        />

                        {/* Mute/Unmute Button */}
                        <a-plane
                            position="-0.6 -0.7 -2"
                            width="0.2"
                            height="0.2"
                            material={`color: white; opacity: 0.9; src: #${isMuted ? "mute-icon" : "volume-icon"}`}
                            class="clickable"
                            cursor="rayOrigin: mouse"
                            onclick={toggleMute}
                        />

                        {/* Seek Bar */}
                        <a-entity position="-0.2 -0.7 -2">
                            <a-plane
                                width="1.5"
                                height="0.1"
                                material="color: gray; opacity: 0.6"
                                class="clickable"
                                cursor="rayOrigin: mouse"
                                onclick={handleSeekClick}
                            />
                            <a-plane
                                width={(currentTime / Math.max(duration, 1)) * 1.5}
                                height="0.1"
                                position={`${((currentTime / Math.max(duration, 1)) * 1.5) / 2 - 0.75} 0 0.001`}
                                material="color: red; opacity: 0.8"
                            />
                        </a-entity>

                        {/* Time Display */}
                        <a-text
                            value={`${formatTime(currentTime)} / ${formatTime(duration)}`}
                            color="white"
                            align="center"
                            width="1"
                            position="1.1 -0.7 -2"
                        />

                        {/* Fullscreen Button */}
                        <a-plane
                            position="0.8 -0.7 -2"
                            width="0.2"
                            height="0.2"
                            material="color: white; opacity: 0.9; src: #fullscreen-icon"
                            class="clickable"
                            cursor="rayOrigin: mouse"
                            onclick={() => sceneRef.current?.requestFullscreen()}
                        />
                    </a-entity>
                )}

                <a-camera look-controls="enabled: true">
                    <a-cursor />
                </a-camera>
            </a-scene>

            {/* Asset Icons for Controls */}
            {is360Video && (
                <a-assets>
                    <img id="play-icon" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E" />
                    <img id="pause-icon" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/%3E%3C/svg%3E" />
                    <img id="volume-icon" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z'/%3E%3C/svg%3E" />
                    <img id="mute-icon" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z'/%3E%3C/svg%3E" />
                    <img id="fullscreen-icon" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'/%3E%3C/svg%3E" />
                </a-assets>
            )}

            {element.hud?.voice && (
                <div className="absolute left-4 bottom-4">
                    <VoiceRenderer element={element.hud.voice} state={state} t={t} runEventHandler={runEventHandler} />
                </div>
            )}
            {element.hud?.call && (
                <div className="absolute right-4 bottom-4">
                    <CallRenderer element={element.hud.call} state={state} t={t} runEventHandler={runEventHandler} />
                </div>
            )}
        </div>
    );
}