import React, { useState } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <>
            <span
                onClick={() => setIsVisible(true)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsVisible(true); }}
                role="button"
                tabIndex={0}
                className="cursor-help"
            >
                {children}
            </span>
            {isVisible && (
                <div 
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsVisible(false)}
                >
                    <div 
                        className="relative w-full max-w-md p-6 bg-stone-800 border border-stone-600 rounded-lg shadow-lg text-center"
                        onClick={(e) => e.stopPropagation()} 
                        style={{backgroundColor: 'var(--component-bg-color)'}}
                    >
                        <button 
                            onClick={() => setIsVisible(false)} 
                            className="absolute top-2 right-3 text-3xl font-bold leading-none hover:opacity-75" 
                            style={{color: 'var(--accent-color)'}}
                            aria-label="Fechar"
                        >
                            &times;
                        </button>
                        <p className="whitespace-pre-wrap text-left" style={{ color: 'var(--text-color)' }}>{text}</p>
                    </div>
                </div>
            )}
        </>
    );
};
