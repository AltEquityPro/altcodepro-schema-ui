"use client";

import * as React from "react";
import Hls, { Level } from "hls.js";
import { cn, resolveBinding } from "@/src/lib/utils";
import { Button } from "./button";
import wrapWithMotion from "./wrapWithMotion";
import {
    MaximizeIcon,
    PictureInPicture2Icon,
    CaptionsIcon,
    SkipForwardIcon,
    PlayIcon,
    PauseIcon,
    Volume2Icon,
    VolumeXIcon,
} from "lucide-react";
import { VideoElement } from "@/src/types";

export function VideoRenderer({
    element,
    state,
    t,
    runEventHandler,
}: {
    element: VideoElement;
    state: Record<string, any>;
    t: (key: string) => string;
    runEventHandler: (h?: any, d?: any) => Promise<void>;
}) {
    // Refs
    const mainRef = React.useRef<HTMLVideoElement>(null);
    const adRef = React.useRef<HTMLVideoElement>(null);
    const hlsRef = React.useRef<Hls | null>(null);

    // UI State
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(false);
    const [playbackRate, setPlaybackRate] = React.useState<number>(1);
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [hoverTime, setHoverTime] = React.useState<number | null>(null);
    const [levels, setLevels] = React.useState<Level[]>([]);
    const [levelIndex, setLevelIndex] = React.useState<number>(-1); // -1 = auto
    const [textTracks, setTextTracks] = React.useState<TextTrackList | null>(null);
    const [activeCaption, setActiveCaption] = React.useState<number | null>(null);
    const [pipSupported, setPipSupported] = React.useState<boolean>(false);

    // Ads State
    const [showAd, setShowAd] = React.useState(false);
    const [adQueue, setAdQueue] = React.useState<string[]>([]);
    const [skipCountdown, setSkipCountdown] = React.useState<number | null>(null);
    const [adQuartilesFired, setAdQuartilesFired] = React.useState({ q25: false, q50: false, q75: false });

    // Derived
    const src = resolveBinding(element.src, state, t) as string;
    const resumeKey = element.resumePosition ? `video:${src}:pos` : null;

    // ============ Helpers ==========
    const emit = React.useCallback(
        (type: string, extra: Record<string, any> = {}) => {
            if (!element.analytics) return;
            const payload = {
                event: type,
                src,
                currentTime: mainRef.current?.currentTime ?? 0,
                duration: mainRef.current?.duration ?? 0,
                ...extra,
            };
            if (element.tracking?.dataSourceId) {
                runEventHandler?.(
                    {
                        action: "api_call",
                        dataSourceId: element.tracking.dataSourceId,
                        responseType: "none",
                        params: { method: "POST", body: payload },
                    },
                    payload
                );
            } else {
                runEventHandler?.(undefined, payload); // still expose payload to any chained actions
            }
        },
        [element.analytics, element.tracking?.dataSourceId, runEventHandler, src]
    );

    const formatTime = (s: number) => {
        if (!Number.isFinite(s)) return "0:00";
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60).toString().padStart(2, "0");
        return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${sec}` : `${m}:${sec}`;
    };

    // ============ Init Main Video (HLS/native) ==========
    React.useEffect(() => {
        const video = mainRef.current;
        if (!video || !src) return;

        // Cleanup old instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        const useHls = element.streaming === "hls" && !video.canPlayType("application/vnd.apple.mpegurl");

        if (useHls && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                setLevels(data.levels);
                setLevelIndex(-1); // auto
            });
            hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => setLevelIndex(data.level));
            hls.on(Hls.Events.ERROR, (_, data) => {
                emit("error", { type: data.type, details: data.details, fatal: data.fatal });
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
            video.src = src;
        }

        // Basic listeners
        const onLoaded = () => setDuration(video.duration || 0);
        const onTime = () => setCurrentTime(video.currentTime || 0);
        const onPlay = () => {
            setIsPlaying(true);
            emit("play");
        };
        const onPause = () => {
            setIsPlaying(false);
            emit("pause");
        };
        const onEnd = () => emit("ended");
        video.addEventListener("loadedmetadata", onLoaded);
        video.addEventListener("timeupdate", onTime);
        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);
        video.addEventListener("ended", onEnd);

        return () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            video.removeEventListener("timeupdate", onTime);
            video.removeEventListener("play", onPlay);
            video.removeEventListener("pause", onPause);
            video.removeEventListener("ended", onEnd);
        };
    }, [src, element.streaming, emit]);

    // Resume position
    React.useEffect(() => {
        const video = mainRef.current;
        if (!video || !resumeKey) return;
        const saved = localStorage.getItem(resumeKey);
        if (saved) video.currentTime = parseFloat(saved);
        const handler = () => localStorage.setItem(resumeKey, String(video.currentTime || 0));
        video.addEventListener("timeupdate", handler);
        return () => video.removeEventListener("timeupdate", handler);
    }, [resumeKey]);

    // Captions injection & control
    React.useEffect(() => {
        const video = mainRef.current;
        if (!video || !element.captions) return;
        // Remove prior tracks we added (idempotency)
        [...video.querySelectorAll("track[data-managed=\"true\"]")].forEach((n) => n.remove());
        element.captions.forEach((c) => {
            const track = document.createElement("track");
            track.kind = "subtitles";
            track.src = resolveBinding(c.src, state, t);
            track.srclang = c.srclang;
            track.label = c.label;
            if (c.default) track.default = true;
            track.setAttribute("data-managed", "true");
            video.appendChild(track);
        });
        setTextTracks(video.textTracks);
    }, [element.captions, state, t]);

    const setCaptionIndex = (idx: number | null) => {
        if (!textTracks) return;
        for (let i = 0; i < textTracks.length; i++) {
            textTracks[i].mode = idx === i ? "showing" : "disabled";
        }
        setActiveCaption(idx);
    };

    // Chapters: optional quick markers (click to seek)
    const seekTo = (tSec: number) => {
        if (mainRef.current) mainRef.current.currentTime = Math.max(0, Math.min(duration, tSec));
    };

    // Hotkeys like YouTube
    React.useEffect(() => {
        if (!element.hotkeys) return;
        const onKey = (e: KeyboardEvent) => {
            const v = mainRef.current;
            if (!v) return;
            switch (e.key.toLowerCase()) {
                case "k":
                case " ":
                    e.preventDefault();
                    v.paused ? v.play() : v.pause();
                    break;
                case "arrowright":
                    v.currentTime += 5;
                    break;
                case "arrowleft":
                    v.currentTime -= 5;
                    break;
                case ".": // faster
                    v.playbackRate = Math.min(2, (v.playbackRate || 1) + 0.25);
                    setPlaybackRate(v.playbackRate);
                    emit("ratechange", { rate: v.playbackRate });
                    break;
                case ",": // slower
                    v.playbackRate = Math.max(0.5, (v.playbackRate || 1) - 0.25);
                    setPlaybackRate(v.playbackRate);
                    emit("ratechange", { rate: v.playbackRate });
                    break;
                case "f":
                    v.requestFullscreen?.();
                    emit("fullscreen", { on: true });
                    break;
                case "m":
                    v.muted = !v.muted;
                    setIsMuted(v.muted);
                    emit("volumechange", { muted: v.muted, volume: v.volume });
                    break;
                case "c":
                    if (textTracks) setCaptionIndex(activeCaption == null ? 0 : null);
                    break;
                case "i": // Skip Intro convenience
                    if (element.showSkipIntro) v.currentTime += 85;
                    break;
                case "n": // Next episode
                    if (element.showNextEpisode && element.onNextEpisode) runEventHandler?.(element.onNextEpisode);
                    break;
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [element.hotkeys, element.showSkipIntro, element.showNextEpisode, element.onNextEpisode, activeCaption, textTracks, emit, runEventHandler]);

    // Picture-in-Picture support flag
    React.useEffect(() => {
        setPipSupported(!!document.pictureInPictureEnabled);
    }, []);

    // Thumbnails hover preview helpers
    const onTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mainRef.current || !element.thumbnails) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const t = (mainRef.current.duration || 0) * percent;
        setHoverTime(t);
    };
    const thumbStyle = React.useMemo(() => {
        if (!element.thumbnails || hoverTime == null) return {} as React.CSSProperties;
        const { spriteUrl, width, height, interval, sheetWidth = 1000 } = element.thumbnails;
        const frame = Math.floor(hoverTime / interval);
        const cols = Math.max(1, Math.floor(sheetWidth / width));
        const x = -(frame % cols) * width;
        const y = -Math.floor(frame / cols) * height;
        return {
            backgroundImage: `url(${spriteUrl})`,
            backgroundPosition: `${x}px ${y}px`,
            width,
            height,
            backgroundSize: `${sheetWidth}px auto`,
        } as React.CSSProperties;
    }, [element.thumbnails, hoverTime]);

    // ======= Ads Handling =======
    // Queue setup from schema
    React.useEffect(() => {
        if (!element.ads) return;
        const pre = (element.ads.preRoll || []).map((b) => resolveBinding(b, state, t) as string);
        setAdQueue(pre);
    }, [element.ads, state, t]);

    // mid-roll triggers & post-roll on main end
    React.useEffect(() => {
        const v = mainRef.current;
        if (!v || !element.ads) return;
        const { midRoll, postRoll } = element.ads;

        const onTime = () => {
            if (!midRoll || showAd) return;
            const now = Math.floor(v.currentTime);
            for (const ad of midRoll) {
                if (now === Math.floor(ad.time)) {
                    setAdQueue((q) => [...q, resolveBinding(ad.src, state, t) as string]);
                    v.pause();
                }
            }
        };
        const onEnded = () => {
            if (!postRoll || showAd) return;
            const list = postRoll.map((b) => resolveBinding(b, state, t) as string);
            if (list.length) setAdQueue((q) => [...q, ...list]);
        };

        v.addEventListener("timeupdate", onTime);
        v.addEventListener("ended", onEnded);
        return () => {
            v.removeEventListener("timeupdate", onTime);
            v.removeEventListener("ended", onEnded);
        };
    }, [element.ads, showAd, state, t]);

    // play next ad if queued
    React.useEffect(() => {
        const adV = adRef.current;
        const mainV = mainRef.current;
        if (!adV || !mainV) return;
        if (adQueue.length === 0) return;

        // show ad
        setShowAd(true);
        const next = adQueue[0];
        adV.src = next;
        setAdQuartilesFired({ q25: false, q50: false, q75: false });

        const onPlay = () => emit("ad_impression", { src: next });
        const onTime = () => {
            const d = adV.duration || 0;
            const tNow = adV.currentTime || 0;
            if (!d) return;
            if (!adQuartilesFired.q25 && tNow >= d * 0.25) {
                setAdQuartilesFired((p) => ({ ...p, q25: true }));
                emit("ad_quartile", { quartile: 25 });
            }
            if (!adQuartilesFired.q50 && tNow >= d * 0.5) {
                setAdQuartilesFired((p) => ({ ...p, q50: true }));
                emit("ad_quartile", { quartile: 50 });
            }
            if (!adQuartilesFired.q75 && tNow >= d * 0.75) {
                setAdQuartilesFired((p) => ({ ...p, q75: true }));
                emit("ad_quartile", { quartile: 75 });
            }
        };
        const onEnded = () => {
            emit("ad_complete", { src: next });
            finishAd();
        };

        adV.addEventListener("play", onPlay);
        adV.addEventListener("timeupdate", onTime);
        adV.addEventListener("ended", onEnded);

        // Auto play
        adV.play().catch(() => { });

        // Skip countdown
        if (element.ads?.skippableAfter != null) setSkipCountdown(element.ads.skippableAfter);

        return () => {
            adV.removeEventListener("play", onPlay);
            adV.removeEventListener("timeupdate", onTime);
            adV.removeEventListener("ended", onEnded);
        };
    }, [adQueue]);

    // Skip countdown timer
    React.useEffect(() => {
        if (skipCountdown == null) return;
        if (skipCountdown <= 0) return;
        const id = setInterval(() => setSkipCountdown((n) => (n == null ? n : n - 1)), 1000);
        return () => clearInterval(id);
    }, [skipCountdown]);

    const finishAd = () => {
        setAdQueue((q) => q.slice(1));
        setShowAd(false);
        setSkipCountdown(null);
        mainRef.current?.play();
    };
    const skipAd = () => {
        emit("ad_skip");
        adRef.current?.pause();
        finishAd();
    };

    // ============ UI handlers ==========
    const togglePlay = () => {
        const v = mainRef.current;
        if (!v) return;
        v.paused ? v.play() : v.pause();
    };
    const toggleMute = () => {
        const v = mainRef.current;
        if (!v) return;
        v.muted = !v.muted;
        setIsMuted(v.muted);
        emit("volumechange", { muted: v.muted, volume: v.volume });
    };
    const changeRate = (r: number) => {
        const v = mainRef.current;
        if (!v) return;
        v.playbackRate = r;
        setPlaybackRate(r);
        emit("ratechange", { rate: r });
    };
    const requestFs = () => {
        mainRef.current?.requestFullscreen?.();
        emit("fullscreen", { on: true });
    };
    const requestPiP = async () => {
        if (!pipSupported || !mainRef.current) return;
        if (!document.pictureInPictureElement) {
            await mainRef.current.requestPictureInPicture();
            emit("pip", { on: true });
        } else {
            await document.exitPictureInPicture();
            emit("pip", { on: false });
        }
    };
    const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = mainRef.current;
        if (!v) return;
        const t = Number(e.target.value);
        v.currentTime = t;
        setCurrentTime(t);
    };
    const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = mainRef.current;
        if (!v) return;
        v.volume = Number(e.target.value);
        v.muted = v.volume === 0;
        setIsMuted(v.muted);
        emit("volumechange", { muted: v.muted, volume: v.volume });
    };
    const onHoverLeave = () => setHoverTime(null);

    const switchLevel = (idx: number) => {
        if (!hlsRef.current) return;
        hlsRef.current.currentLevel = idx; // -1 auto
        setLevelIndex(idx);
    };

    // ============ Render ==========
    return wrapWithMotion(
        element,
        <div className="relative w-full bg-black rounded-2xl overflow-hidden shadow">
            {/* MAIN VIDEO */}
            <video
                ref={mainRef}
                className={cn("w-full", showAd && "opacity-0 pointer-events-none")}
                autoPlay={element.autoPlay}
                loop={element.loop}
                controls={element.controls}
                playsInline
                preload={element.caching ? "auto" : "metadata"}
                width={element.width}
                height={element.height}
                onLoadedMetadata={(e) => setDuration((e.currentTarget as HTMLVideoElement).duration || 0)}
            />

            {/* AD OVERLAY */}
            {showAd && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                    <video ref={adRef} className="w-full" controls={false} playsInline />
                    {element.ads?.skippableAfter != null && (
                        <div className="absolute bottom-4 right-4">
                            {skipCountdown != null && skipCountdown > 0 ? (
                                <span className="text-white text-sm bg-black/70 px-2 py-1 rounded">{`Skip in ${skipCountdown}s`}</span>
                            ) : (
                                <Button size="sm" variant="default" onClick={skipAd} className="flex items-center gap-1">
                                    <SkipForwardIcon className="size-4" /> Skip Ad
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* CUSTOM CONTROL BAR */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Timeline */}
                <div className="relative w-full mb-2" onMouseMove={onTimelineHover} onMouseLeave={onHoverLeave}>
                    {element.showThumbnails && element.thumbnails && hoverTime != null && (
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 border border-white/10 rounded shadow" style={thumbStyle} />
                    )}
                    <input
                        type="range"
                        min={0}
                        max={Math.max(0, duration)}
                        step={0.1}
                        value={Math.min(currentTime, duration)}
                        onChange={onSeek}
                        className="w-full accent-white"
                    />
                    {element.chapters && element.chapters.length > 0 && (
                        <div className="absolute inset-x-0 -bottom-1 h-1 pointer-events-none">
                            {element.chapters.map((c, i) => (
                                <div
                                    key={i}
                                    title={c.title}
                                    className="absolute top-0 h-1 w-0.5 bg-white/60 pointer-events-auto"
                                    style={{ left: `${(c.start / Math.max(1, duration)) * 100}%` }}
                                    onClick={() => seekTo(c.start)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between gap-3 text-white">
                    <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={togglePlay}>
                            {isPlaying ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={toggleMute}>
                            {isMuted ? <VolumeXIcon className="size-5" /> : <Volume2Icon className="size-5" />}
                        </Button>
                        <input type="range" min={0} max={1} step={0.05} onChange={onVolume} className="w-24 accent-white" />
                        <span className="text-xs tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
                        {element.showSkipIntro && (
                            <Button size="sm" variant="outline" className="ml-2" onClick={() => (mainRef.current ? (mainRef.current.currentTime += 85) : null)}>
                                Skip Intro
                            </Button>
                        )}
                        {element.showNextEpisode && (
                            <Button size="sm" variant="default" onClick={() => runEventHandler?.(element.onNextEpisode)}>Next Episode</Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {element.qualitySelector && levels.length > 0 && (
                            <select
                                className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs"
                                value={levelIndex}
                                onChange={(e) => switchLevel(parseInt(e.target.value, 10))}
                                title="Quality"
                            >
                                <option value={-1}>Auto</option>
                                {levels.map((lv, i) => (
                                    <option key={i} value={i}>{`${lv.height || lv.width || ""}${lv.bitrate ? ` (${Math.round(lv.bitrate / 1000)}kbps)` : ""}`}</option>
                                ))}
                            </select>
                        )}

                        {element.showPlaybackRate && (
                            <select
                                className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs"
                                value={playbackRate}
                                onChange={(e) => changeRate(parseFloat(e.target.value))}
                                title="Playback speed"
                            >
                                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
                                    <option key={r} value={r}>{r}x</option>
                                ))}
                            </select>
                        )}

                        {element.showCaptions && textTracks && (
                            <select
                                className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs"
                                value={activeCaption ?? -1}
                                onChange={(e) => setCaptionIndex(parseInt(e.target.value, 10) === -1 ? null : parseInt(e.target.value, 10))}
                                title="Subtitles"
                            >
                                <option value={-1}>Captions off</option>
                                {Array.from({ length: textTracks.length }).map((_, i) => (
                                    <option key={i} value={i}>{textTracks[i].label || textTracks[i].language || `Track ${i + 1}`}</option>
                                ))}
                            </select>
                        )}

                        {(element.showMiniPlayer || element.pictureInPicture) && (
                            <Button size="icon" variant="ghost" onClick={requestPiP} disabled={!pipSupported} title="Mini Player">
                                <PictureInPicture2Icon className="size-5" />
                            </Button>
                        )}

                        {element.showFullscreen && (
                            <Button size="icon" variant="ghost" onClick={requestFs} title="Fullscreen">
                                <MaximizeIcon className="size-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
