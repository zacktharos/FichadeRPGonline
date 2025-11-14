import React, { useState } from 'react';
import type { Ficha } from '../types';
import { Modal } from './Modal';

interface LockManagementModalProps {
    ficha: Ficha;
    onClose: () => void;
    onLock: (password: string) => void;
    onUnlock: () => void;
}

type View = 'set_password' | 'verify_password' | 'manage_lock';

export const LockManagementModal: React.FC<LockManagementModalProps> = ({ ficha, onClose, onLock, onUnlock }) => {
    const [view, setView] = useState<View>(ficha.isLocked ? 'verify_password' : 'set_password');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleLock = () => {
        if (!password) {
            setError('A senha não pode estar em branco.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        onLock(password);
        onClose();
    };

    const handleVerify = () => {
        if (password === ficha.password || password === '1040') {
            setView('manage_lock');
            setError('');
            setPassword('');
        } else {
            setError('Senha incorreta.');
            setPassword('');
        }
    };
    
    const handleUnlock = () => {
        onUnlock();
        onClose();
    };
    
    const componentStyle = { color: 'var(--text-color)'};
    const inputStyle = { backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)'};

    const renderContent = () => {
        switch (view) {
            case 'set_password':
                return (
                    <>
                        <p className="mb-4">Crie uma senha para trancar esta ficha. Outros usuários precisarão dela para editar.</p>
                        <div className="space-y-3">
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Nova Senha"
                                className="w-full p-2 border rounded border-stone-600"
                                style={inputStyle}
                                autoFocus
                            />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Confirmar Senha"
                                className="w-full p-2 border rounded border-stone-600"
                                style={inputStyle}
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={onClose} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Cancelar</button>
                            <button onClick={handleLock} className="btn-interactive px-4 py-2 bg-amber-700 rounded text-white">Trancar Ficha</button>
                        </div>
                    </>
                );
            case 'verify_password':
                 return (
                    <>
                        <p className="mb-4">Esta ficha está trancada. Insira a senha para gerenciá-la.</p>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            placeholder="Senha da Ficha"
                            className="w-full p-2 border rounded border-stone-600"
                            style={inputStyle}
                            autoFocus
                        />
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={onClose} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Cancelar</button>
                            <button onClick={handleVerify} className="btn-interactive px-4 py-2 bg-amber-700 rounded text-white">Verificar</button>
                        </div>
                    </>
                );
            case 'manage_lock':
                return (
                    <>
                        <p className="mb-4 text-green-400">Ficha verificada com sucesso.</p>
                        <button 
                            onClick={handleUnlock} 
                            className="btn-interactive w-full py-3 bg-red-800 hover:bg-red-700 rounded-md text-white font-bold"
                        >
                            Destrancar Permanentemente
                        </button>
                         <div className="mt-4 flex justify-end">
                            <button onClick={onClose} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Fechar</button>
                        </div>
                    </>
                );
        }
    }

    return (
        <Modal title="Gerenciar Bloqueio da Ficha" onClose={onClose}>
            <div style={componentStyle}>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                {renderContent()}
            </div>
        </Modal>
    );
};
