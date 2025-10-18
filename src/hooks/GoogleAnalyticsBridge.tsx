import { useEffect } from 'react';
import { useAnalytics } from './AnalyticsContext';

export function GoogleAnalyticsBridge({ measurementId }: { measurementId: string }) {
    const { setAdapter } = useAnalytics();

    useEffect(() => {
        setAdapter({
            track: (evt) => {
                (window as any).gtag?.('event', evt.name, evt.metadata);
            },
            page: (path) => {
                (window as any).gtag?.('event', 'page_view', { page_path: path });
            },
        });
    }, [setAdapter]);

    return null;
}
