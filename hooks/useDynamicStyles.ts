import { useEffect } from 'react';
import type { Ficha } from '../types';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

export const useDynamicStyles = (ficha: Ficha | null) => {
    useEffect(() => {
        if (!ficha) return;

        const root = document.documentElement as HTMLElement;

        if (ficha.darkMode) {
            // Aplicar estilos do modo escuro, sobrepondo qualquer customização
            document.body.style.fontFamily = "'Inter', sans-serif";
            document.body.style.backgroundColor = '#121212';
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundAttachment = 'fixed';

            root.style.setProperty('--sheet-bg-color', 'rgba(20, 20, 20, 0.95)');
            root.style.setProperty('--section-bg-color', 'rgba(30, 30, 30, 0.9)');
            root.style.setProperty('--component-bg-color', '#2d2d2d');
            root.style.setProperty('--border-color', '#555');
            root.style.setProperty('--border-style', 'solid');
            root.style.setProperty('--border-width', `2px`);
            root.style.setProperty('--sheet-shadow', 'inset 0 0 10px 2px #000000');
            root.style.setProperty('--text-color', '#f1f1f1');
            root.style.setProperty('--accent-color', '#f59e0b');
        } else {
            // Aplicar o tema customizado pelo usuário (ou o padrão)
            document.body.style.fontFamily = ficha.fontFamily || "'Inter', sans-serif";
            document.body.style.backgroundColor = ficha.backgroundColor || '#f0e6d2';
            if (ficha.backgroundImage) {
                document.body.style.backgroundImage = `url(${ficha.backgroundImage})`;
                document.body.style.backgroundSize = ficha.backgroundSize || 'cover';
                document.body.style.backgroundAttachment = ficha.backgroundSize === 'cover' ? 'fixed' : 'scroll';
            } else {
                document.body.style.backgroundImage = 'none';
            }

            const sheetBgColor = ficha.sheetBackgroundColor || '#f0e6d2';
            const sectionBgColor = ficha.sheetBackgroundColor || '#f0e6d2';
            
            const sheetRgb = hexToRgb(sheetBgColor);
            const sectionRgb = hexToRgb(sectionBgColor);
            const opacity = ficha.sheetOpacity / 100;
            
            if (sheetRgb) {
                root.style.setProperty('--sheet-bg-color', `rgba(${sheetRgb.r}, ${sheetRgb.g}, ${sheetRgb.b}, ${opacity})`);
            }
            if (sectionRgb) {
                 root.style.setProperty('--section-bg-color', `rgba(${sectionRgb.r}, ${sectionRgb.g}, ${sectionRgb.b}, ${opacity})`);
            }
            
            root.style.setProperty('--border-color', ficha.borderColor);
            root.style.setProperty('--border-style', ficha.borderStyle);
            root.style.setProperty('--border-width', `${ficha.borderWidth}px`);

            if (ficha.shadowIntensity > 0) {
                const blur = ficha.shadowIntensity * 0.5;
                const spread = ficha.shadowIntensity * 0.2;
                root.style.setProperty('--sheet-shadow', `inset 0 0 ${blur}px ${spread}px ${ficha.shadowColor}`);
            } else {
                root.style.setProperty('--sheet-shadow', 'transparent 0 0 0 0 inset');
            }
            
            root.style.setProperty('--component-bg-color', ficha.componentBackgroundColor || '');
            root.style.setProperty('--text-color', ficha.textColor || '');
            root.style.setProperty('--accent-color', ficha.accentColor || '');
        }

    }, [ficha]);
};
