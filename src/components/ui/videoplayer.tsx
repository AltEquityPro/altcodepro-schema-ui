"use client";

import * as React from "react";
import Hls, { Level } from "hls.js";
import { cn, resolveBinding } from "../../lib/utils";
import { Button } from "./button";
import {
    MaximizeIcon,
    PictureInPicture2Icon,
    SkipForwardIcon,
    PlayIcon,
    PauseIcon,
    Volume2Icon,
    VolumeXIcon,
} from "lucide-react";
import { VideoElement } from "../../types";

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
    const containerRef = React.useRef<HTMLDivElement>(null);

    // UI State
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(element.autoPlay ?? false);
    const [playbackRate, setPlaybackRate] = React.useState<number>(1);
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [hoverTime, setHoverTime] = React.useState<number | null>(null);
    const [levels, setLevels] = React.useState<Level[]>([]);
    const [levelIndex, setLevelIndex] = React.useState<number>(-1);
    const [textTracks, setTextTracks] = React.useState<TextTrackList | null>(null);
    const [activeCaption, setActiveCaption] = React.useState<number | null>(null);
    const [pipSupported, setPipSupported] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Ads State
    const [showAd, setShowAd] = React.useState(false);
    const [adQueue, setAdQueue] = React.useState<string[]>([]);
    const [skipCountdown, setSkipCountdown] = React.useState<number | null>(null);
    const [adQuartilesFired, setAdQuartilesFired] = React.useState({ q25: false, q50: false, q75: false });

    // Derived
    const src = resolveBinding(element.src, state, t) as string;
    const resumeKey = element.resumePosition ? `video:${src}:pos` : null;

    // Helpers
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
                        dataSourceId: element.tracking?.dataSourceId,
                        responseType: "none",
                        params: { method: "POST", body: payload },
                    },
                    payload
                );
            } else {
                runEventHandler?.(undefined, payload);
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

    // Initialize Video
    React.useEffect(() => {
        const video = mainRef.current;
        if (!video || !src) {
            setIsLoading(true);
            setError("No valid video source provided.");
            return;
        }
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
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                setLevels(data.levels);
                setLevelIndex(-1);
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
            video.src = src;
            video.onloadedmetadata = () => {
                setDuration(video.duration || 0);
                setLevels([]);
                setIsLoading(false);
                attemptPlay(video);
            };
            video.onerror = (e) => {
                setIsLoading(false);
            };
        }

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
            if (hlsRef.current) hlsRef.current.destroy();
        };
    }, [src, element.streaming, emit]);

    // Attempt to play with muted fallback for autoplay
    const attemptPlay = (video: HTMLVideoElement) => {
        video.play().catch((err) => {
            console.warn("Autoplay blocked, attempting with muted:", err);
            video.muted = true;
            video.play().catch((e) => {
                setError(`Playback failed: ${e.message}`);
                console.error("Playback error:", e);
            });
        });
    };

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
                    v.paused ? v.play().catch((err) => setError(`Play error: ${err.message}`)) : v.pause();
                    break;
                case "arrowright":
                    v.currentTime += 5;
                    break;
                case "arrowleft":
                    v.currentTime -= 5;
                    break;
                case ".":
                    v.playbackRate = Math.min(2, (v.playbackRate || 1) + 0.25);
                    setPlaybackRate(v.playbackRate);
                    emit("ratechange", { rate: v.playbackRate });
                    break;
                case ",":
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
                case "i":
                    if (element.showSkipIntro) v.currentTime += 85;
                    break;
                case "n":
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

    // Ads Handling
    React.useEffect(() => {
        if (!element.ads) return;
        const pre = (element.ads.preRoll || []).map((b) => resolveBinding(b, state, t) as string);
        setAdQueue(pre);
    }, [element.ads, state, t]);

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

    React.useEffect(() => {
        const adV = adRef.current;
        const mainV = mainRef.current;
        if (!adV || !mainV) return;
        if (adQueue.length === 0) return;

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

        adV.play().catch((err) => {
            setError(`Ad playback failed: ${err.message}`);
            finishAd();
        });
        if (element.ads?.skippableAfter != null) setSkipCountdown(element.ads.skippableAfter);

        return () => {
            adV.removeEventListener("play", onPlay);
            adV.removeEventListener("timeupdate", onTime);
            adV.removeEventListener("ended", onEnded);
        };
    }, [adQueue]);

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
        const mainVideo = mainRef.current;
        if (mainVideo) {
            mainVideo.play().catch((err) => {
                setError(`Resume playback failed: ${err.message}`);
                console.error("Resume error:", err);
            });
        }
    };

    const skipAd = () => {
        emit("ad_skip");
        adRef.current?.pause();
        finishAd();
    };

    // UI Handlers
    const togglePlay = () => {
        const v = mainRef.current;
        if (!v) return;
        if (v.paused) {
            v.play().catch((err) => setError(`Play failed: ${err.message}`));
        } else {
            v.pause();
        }
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
        hlsRef.current.currentLevel = idx;
        setLevelIndex(idx);
    };

    // Render
    const aspectRatio = 16 / 9;
    const defaultWidth = element.width || "100%";
    const defaultHeight = element.height || `min(720px, calc(${defaultWidth} / ${aspectRatio}))`;
    const minHeight = element.height ? `${element.height}px` : "360px";

    return (
        <div
            ref={containerRef}
            className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg group"
            style={{ aspectRatio: "16/9", width: defaultWidth, height: defaultHeight, minHeight }}
        >
            {/* Loading/Error Banner */}
            {(isLoading || error) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white text-lg font-semibold z-10">
                    {error || "Loading Video..."}
                </div>
            )}

            {/* MAIN VIDEO */}
            <video
                ref={mainRef}
                className={cn("w-full h-full object-cover", showAd && "opacity-0 pointer-events-none")}
                autoPlay={element.autoPlay}
                muted={element.autoPlay ?? false}
                loop={element.loop}
                playsInline
                preload={element.caching ? "auto" : "metadata"}
                onLoadedMetadata={(e) => setDuration((e.currentTarget as HTMLVideoElement).duration || 0)}
            />

            {/* AD OVERLAY */}
            {showAd && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20">
                    <video ref={adRef} className="w-full h-full object-cover" controls={false} playsInline />
                    {element.ads?.skippableAfter != null && (
                        <div className="absolute bottom-6 right-6">
                            {skipCountdown != null && skipCountdown > 0 ? (
                                <span className="text-white text-base bg-black/80 px-3 py-2 rounded-lg">{`Skip in ${skipCountdown}s`}</span>
                            ) : (
                                <Button size="sm" variant="default" onClick={skipAd} className="flex items-center gap-2 bg-white/90 text-black hover:bg-white">
                                    <SkipForwardIcon className="size-5" /> Skip Ad
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* CUSTOM CONTROL BAR (only if not using native controls) */}
            {!element.controls && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                    {/* Timeline */}
                    <div className="relative w-full mb-4" onMouseMove={onTimelineHover} onMouseLeave={onHoverLeave}>
                        {element.showThumbnails && element.thumbnails && hoverTime != null && (
                            <div className="absolute -top-28 left-1/2 -translate-x-1/2 border border-white/20 rounded-lg shadow-lg" style={thumbStyle} />
                        )}
                        <input
                            type="range"
                            min={0}
                            max={Math.max(0, duration)}
                            step={0.1}
                            value={Math.min(currentTime, duration)}
                            onChange={onSeek}
                            className="w-full h-2 bg-gray-700/60 rounded-full cursor-pointer accent-red-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:rounded-full"
                        />
                        {element.chapters && element.chapters.length > 0 && (
                            <div className="absolute inset-x-0 -bottom-1 h-1 pointer-events-none">
                                {element.chapters.map((c, i) => (
                                    <div
                                        key={i}
                                        title={c.title}
                                        className="absolute top-0 h-1 w-1 bg-white/80 pointer-events-auto"
                                        style={{ left: `${(c.start / Math.max(1, duration)) * 100}%` }}
                                        onClick={() => seekTo(c.start)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between gap-4 text-white">
                        <div className="flex items-center gap-3">
                            <Button size="icon" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/20 rounded-full w-10 h-10">
                                {isPlaying ? <PauseIcon className="size-6" /> : <PlayIcon className="size-6" />}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20 rounded-full w-10 h-10">
                                {isMuted ? <VolumeXIcon className="size-6" /> : <Volume2Icon className="size-6" />}
                            </Button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                onChange={onVolume}
                                className="w-28 h-2 bg-gray-700/60 rounded-full cursor-pointer accent-red-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:rounded-full"
                            />
                            <span className="text-sm tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
                            {element.showSkipIntro && (
                                <Button size="sm" variant="outline" className="ml-3 bg-transparent text-white border-white/30 hover:bg-white/10">
                                    Skip Intro
                                </Button>
                            )}
                            {element.showNextEpisode && (
                                <Button size="sm" variant="default" className="ml-3 bg-red-600 hover:bg-red-700 text-white" onClick={() => runEventHandler?.(element.onNextEpisode)}>
                                    Next Episode
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {element.qualitySelector && levels.length > 0 && (
                                <select
                                    className="bg-black/80 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
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
                                    className="bg-black/80 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
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
                                    className="bg-black/80 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
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
                                <Button size="icon" variant="ghost" onClick={requestPiP} disabled={!pipSupported} title="Mini Player" className="text-white hover:bg-white/20 rounded-full w-10 h-10">
                                    <PictureInPicture2Icon className="size-6" />
                                </Button>
                            )}
                            {element.showFullscreen && (
                                <Button size="icon" variant="ghost" onClick={requestFs} title="Fullscreen" className="text-white hover:bg-white/20 rounded-full w-10 h-10">
                                    <MaximizeIcon className="size-6" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}