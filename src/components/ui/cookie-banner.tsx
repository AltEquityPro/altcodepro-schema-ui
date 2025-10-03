'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { UIProject } from '@/types';
import { ElementResolver } from '../../schema/ElementResolver';
import { useRuntime } from '@/hooks/useRuntime';
import { useAppState } from '@/schema/StateContext';

interface CookieBannerProps {
    project: UIProject;
    runtime: ReturnType<typeof useRuntime>;
}

export function CookieBanner({ project, runtime }: CookieBannerProps) {
    const { t } = useAppState();
    const banner = project.cookie_banner;
    if (!banner) return null;

    const persistKey = banner.persistKey ?? 'cookieConsent';
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consented = Cookies.get(persistKey);
        setVisible(!consented);
    }, [persistKey]);

    const accept = useCallback(() => {
        Cookies.set(persistKey, 'true', { expires: 365, sameSite: 'Lax' });
        setVisible(false);
    }, [persistKey]);

    if (!visible) return null;

    // Build wrapper element, inject accept button
    const wrapperEl = {
        ...banner,
        type: 'container',
        id: banner.id,
        children: [
            ...(banner.children ?? []),
            {
                type: 'button',
                id: `${banner.id}-accept`,
                text: t('cookieBanner.accept') || 'Accept',
                variant: 'primary',
                onClick: {
                    action: 'run_script',
                    params: { name: 'acceptCookie' }, // consistent semantic name
                },
            } as any,
        ],
    };

    const handleClick = (e: React.MouseEvent) => {
        const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
            `#${banner.id}-accept`
        );
        if (btn) accept();
    };

    return (
        <div
            className={banner.styles?.className}
            style={{
                position: 'fixed',
                top: banner.position === 'top' ? 0 : 'auto',
                bottom: banner.position === 'bottom' ? 0 : 'auto',
                left: 0,
                right: 0,
                zIndex: 9999,
            }}
            onClick={handleClick}
        >
            <ElementResolver element={wrapperEl as any} runtime={runtime} />
        </div>
    );
}
