// lib/webrtc/signaling.ts
export type SignalMessage =
    | { type: "join"; roomId: string; from: string }
    | { type: "offer"; roomId: string; from: string; to?: string; sdp: RTCSessionDescriptionInit }
    | { type: "answer"; roomId: string; from: string; to?: string; sdp: RTCSessionDescriptionInit }
    | { type: "candidate"; roomId: string; from: string; to?: string; candidate: RTCIceCandidateInit }
    | { type: "leave"; roomId: string; from: string };

export type SignalHandler = (msg: any) => void;

export class WSClient {
    private ws?: WebSocket;
    private url: string;
    private handler: SignalHandler;

    constructor(url: string, handler: SignalHandler) {
        this.url = url;
        this.handler = handler;
    }
    connect() {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {/* noop */ };
        this.ws.onmessage = (ev) => {
            try { this.handler(JSON.parse(ev.data)); } catch { /* ignore */ }
        };
        this.ws.onerror = () => {/* noop */ };
        this.ws.onclose = () => {/* noop */ };
    }
    send(msg: SignalMessage) {
        this.ws?.send(JSON.stringify(msg));
    }
    close() {
        try { this.ws?.close(); } catch { /* ignore */ }
    }
}
