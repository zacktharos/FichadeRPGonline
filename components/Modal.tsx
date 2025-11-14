import React, { useState } from 'react';

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, className = '', contentClassName = '' }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Animation duration
    };
    
    const componentBgStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 ${isClosing ? 'modal-exit' : 'modal-enter'} ${className}`}>
            <div className={`bg-stone-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-stone-600 ${isClosing ? 'modal-content-exit' : 'modal-content-enter'} ${contentClassName}`} style={componentBgStyle}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-medieval">{title}</h2>
                    <button onClick={handleClose} className="text-2xl hover:opacity-75 transition-opacity" style={{ color: 'var(--text-color)' }}>&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};