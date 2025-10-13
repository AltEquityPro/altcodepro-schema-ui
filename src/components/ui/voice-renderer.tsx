"use client";

import { useEffect, useRef, useState } from "react";
import { cn, resolveBinding, classesFromStyleProps } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { VoiceElement } from "../../types";

declare global {
    interface Window {
        SpeechSDK: any;
        avatarSynthesizer: any;
        peerConnection: RTCPeerConnection | null;
    }
}

export function VoiceRenderer({
    element,
    state,
    t,
    runEventHandler,
}: {
    element: VoiceElement;
    state: Record<string, any>;
    t: (k: string) => string;
    runEventHandler?: (h?: any, d?: any) => Promise<void>;
}) {
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [recognizedText, setRecognizedText] = useState<string | null>(null);
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [aiResponse, setAIResponse] = useState<string | null>(null);

    const videoRef = useRef<HTMLDivElement>(null);
    const outputText = resolveBinding(element.outputText, state, t);

    // --- Speech recognition ---
    const startListening = () => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech Recognition not supported");
            return;
        }
        const recog = new SpeechRecognition();
        recog.lang = element.language || "en-US";
        recog.interimResults = false;
        recog.onresult = async (e: any) => {
            const transcript = e.results[0][0].transcript;
            setRecognizedText(transcript);

            if (element.onRecognize) await runEventHandler?.(element.onRecognize, { transcript });

            let textForAI = transcript;

            if (element.targetLanguage && element.targetLanguage !== element.language) {
                if (element.onTranslate) {
                    await runEventHandler?.(element.onTranslate, {
                        from: element.language,
                        to: element.targetLanguage,
                        text: transcript,
                    });
                }
                textForAI = transcript; // assume backend handles translation
                setTranslatedText(textForAI);
            }

            if (element.onAIResponse) {
                const ai: any = await runEventHandler?.(element.onAIResponse, { text: textForAI });
                setAIResponse(ai?.text ?? textForAI);
            } else {
                setAIResponse(textForAI);
            }

            setListening(false);
        };
        recog.onerror = () => setListening(false);
        recog.start();
        setListening(true);
    };

    const stopListening = () => setListening(false);

    // --- Browser TTS ---
    const speakBrowser = async (text: string) => {
        if (!text) return;
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = element.targetLanguage || element.language || "en-US";
        utter.onend = async () => {
            setSpeaking(false);
            if (element.onSpeak) await runEventHandler?.(element.onSpeak, { text });
        };
        setSpeaking(true);
        window.speechSynthesis.speak(utter);
    };

    // --- Azure Avatar (optional) ---
    useEffect(() => {
        if (element.apiMode !== "azure" || !element.avatar?.enabled) return;

        const avatar = element.avatar;
        const subKey = resolveBinding(avatar.subscriptionKey, state, t);

        const script = document.createElement("script");
        script.src = "https://aka.ms/csspeech/jsbrowserpackageraw";
        script.async = true;
        script.onload = () => {
            const SpeechSDK = (window as any).SpeechSDK;
            if (!SpeechSDK) return;

            const speechSynthesisConfig = SpeechSDK.SpeechConfig.fromSubscription(
                subKey,
                avatar.region
            );

            const videoFormat = new SpeechSDK.AvatarVideoFormat();
            const avatarConfig = new SpeechSDK.AvatarConfig(
                avatar.character,
                avatar.style || "casual",
                videoFormat
            );
            avatarConfig.backgroundColor = avatar.transparentBackground
                ? "#00FF00FF"
                : "#FFFFFFFF";

            window.avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(
                speechSynthesisConfig,
                avatarConfig
            );

            window.peerConnection = new RTCPeerConnection();
            window.peerConnection.ontrack = (event) => {
                if (!videoRef.current) return;
                const mediaEl = document.createElement(event.track.kind);
                (mediaEl as any).srcObject = event.streams[0];
                (mediaEl as any).autoplay = true;
                (mediaEl as any).playsInline = true;
                videoRef.current.innerHTML = "";
                videoRef.current.appendChild(mediaEl);
            };
            window.peerConnection.addTransceiver("video", { direction: "sendrecv" });
            window.peerConnection.addTransceiver("audio", { direction: "sendrecv" });

            window.avatarSynthesizer.startAvatarAsync(window.peerConnection);
        };
        document.body.appendChild(script);

        return () => {
            if (window.avatarSynthesizer) {
                try {
                    window.avatarSynthesizer.close();
                } catch { }
            }
            window.peerConnection?.close();
            window.peerConnection = null;
        };
    }, [element.apiMode, element.avatar, state, t]);

    const speakAzure = async (text: string) => {
        if (!text || !window.avatarSynthesizer) return;
        const ssml = `<speak version='1.0' xml:lang='${element.targetLanguage || element.language}'>
            <voice name='${element.avatar?.voice || element.voiceModel || "en-US-JennyNeural"}'>
                ${text}
            </voice>
        </speak>`;
        setSpeaking(true);
        window.avatarSynthesizer.speakSsmlAsync(ssml).finally(() => setSpeaking(false));
    };

    // --- Speak AI response ---
    useEffect(() => {
        if (!aiResponse) return;
        if (element.apiMode === "azure" && element.avatar?.enabled) {
            speakAzure(aiResponse);
        } else {
            speakBrowser(aiResponse);
        }
    }, [aiResponse]);

    return (
        <div className={cn(classesFromStyleProps(element.styles))}>
            {element.mode !== "output" && (
                <Button
                    variant={listening ? "destructive" : "secondary"}
                    onClick={listening ? stopListening : startListening}
                >
                    {listening ? t("Stop Listening") : t("Start Listening")}
                </Button>
            )}

            {element.mode !== "input" && (
                <>
                    <div className={cn(classesFromStyleProps(element.styles))}>
                        {recognizedText && <div>{t("🎤")} {recognizedText}</div>}
                        {translatedText && <div>{t("🌐")} {translatedText}</div>}
                        {aiResponse && <div>{t("🤖")} {aiResponse}</div>}
                    </div>
                    {element.apiMode === "azure" && element.avatar?.enabled && (
                        <div ref={videoRef} className={cn(classesFromStyleProps(element.styles))} />
                    )}
                </>
            )}
        </div>
    );
}
