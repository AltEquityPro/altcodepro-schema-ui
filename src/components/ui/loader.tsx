import React from 'react'
import { Loader2 } from 'lucide-react';
export default function Loader({ text }: { text?: string }) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> {text && <span className="ml-2 text-muted-foreground">{text}</span>}
        </div>
    );
}
