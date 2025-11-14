import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (password?: string) => void;
    onVerify: (password: string) => boolean;
    title?: string;
    description?: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSuccess, onVerify, title = "Confirmação Necessária", description }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (onVerify(password)) {
            onSuccess(password);
        } else {
            setError('Senha incorreta. Tente novamente.');
            setPassword('');
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleConfirm();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Modal title={title} onClose={onClose}>
            <p className="mb-2">{description || "Por favor, insira a senha para continuar."}</p>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-2 border rounded bg-stone-700 border-stone-600 focus:ring-amber-500 focus:border-amber-500"
                style={{ color: 'var(--text-color)' }}
                autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
                <button onClick={onClose} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Cancelar</button>
                <button onClick={handleConfirm} className="btn-interactive px-4 py-2 bg-amber-700 rounded text-white">Confirmar</button>
            </div>
        </Modal>
    );
};
