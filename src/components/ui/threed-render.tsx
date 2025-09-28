"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn, resolveBinding, classesFromStyleProps } from "../../lib/utils";
import { ThreeDModelElement } from "../../types";
import { CallRenderer } from "./call-renderer";
import { VoiceRenderer } from "./voice-renderer";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}

export function ThreeDRenderer({
    threeElement,
    state,
    t,
    runEventHandler,
}: {
    threeElement: ThreeDModelElement;
    state: Record<string, any>;
    t: (k: string) => string;
    runEventHandler: (h?: any, d?: any) => Promise<void>;
}) {
    const sceneRef = useRef<HTMLElement | null>(null);
    const assetsRef = useRef<HTMLDivElement | null>(null);
    const element = threeElement;

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

    // Ensure video asset exists
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
                            `primitive: plane; width: ${element.multiPeerSpawn.size?.[0] ?? 1.2}; height: ${element.multiPeerSpawn.size?.[1] ?? 0.675
                            }`
                        );
                        ent.setAttribute(
                            "material",
                            `src: #${vidId}; transparent: ${element.multiPeerSpawn.transparent ? "true" : "false"
                            }`
                        );
                    } else if (element.multiPeerSpawn.shape === "sphere") {
                        ent.setAttribute("geometry", `primitive: sphere; radius: ${element.multiPeerSpawn.radius ?? 0.6}`);
                        ent.setAttribute(
                            "material",
                            `src: #${vidId}; transparent: ${element.multiPeerSpawn.transparent ? "true" : "false"
                            }`
                        );
                    } else if (element.multiPeerSpawn.shape === "avatar") {
                        if (element.multiPeerSpawn.avatarModel) {
                            ent.setAttribute("gltf-model", element.multiPeerSpawn.avatarModel);
                            ent.setAttribute("scale", "1 1 1");
                        }
                        const face = document.createElement("a-entity");
                        face.setAttribute(
                            "geometry",
                            `primitive: plane; width: ${element.multiPeerSpawn.size?.[0] ?? 0.6}; height: ${element.multiPeerSpawn.size?.[1] ?? 0.6
                            }`
                        );
                        face.setAttribute(
                            "material",
                            `src: #${vidId}; transparent: ${element.multiPeerSpawn.transparent ? "true" : "false"
                            }`
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

    return (
        <div className={cn("relative w-full h-full", classesFromStyleProps(element.styles))}>
            <a-scene
                ref={sceneRef as any}
                vr-mode-ui={`enabled: ${isVR ? "true" : "false"}`}
                embedded
                style={{ width: "100%", height: "100%" }}
                renderer="antialias: true"
                xrmode={isAR ? "ar" : undefined}
            >
                <a-assets ref={assetsRef as any}>
                    {is360Video && videoSphereSource && (
                        <video
                            id="video360"
                            src={videoSphereSource}
                            playsInline
                            crossOrigin="anonymous"
                            loop={element.loop ?? true}
                            autoPlay={element.autoplay ?? true}
                            muted
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
                    <a-videosphere src="#video360" rotation={(element.rotation || [0, 180, 0]).join(" ")} />
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
                        geometry={`primitive: plane; width: ${element.inSceneVideo.size?.[0] ?? 1.6}; height: ${element.inSceneVideo.size?.[1] ?? 0.9
                            }`}
                        material={`src: #${callVideoId}; transparent: ${element.inSceneVideo.transparent ? "true" : "false"
                            }`}
                        position={(element.inSceneVideo.position || [0, 1.6, -2]).join(" ")}
                        rotation={(element.inSceneVideo.rotation || [0, 0, 0]).join(" ")}
                        scale={(element.inSceneVideo.scale || [1, 1, 1]).join(" ")}
                    />
                )}
            </a-scene>

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
