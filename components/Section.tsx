import React from 'react';

interface SectionProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}

export const Section: React.FC<SectionProps> = ({ title, children, isOpen, onToggle }) => {
    return (
        <div 
            className="rounded-lg transition-colors duration-300"
            style={{
                backgroundColor: 'var(--section-bg-color)',
                borderWidth: `var(--border-width)`,
                borderStyle: `var(--border-style)`,
                borderColor: `var(--border-color)`,
            }}
        >
            <h2
                className="text-lg sm:text-xl font-medieval p-3 cursor-pointer flex justify-between items-center"
                onClick={onToggle}
            >
                {title}
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </h2>
            <div className={`section-content-wrapper ${isOpen ? 'open' : ''}`}>
                <div>
                     <div className="p-3 pt-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
