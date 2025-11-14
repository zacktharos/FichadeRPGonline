
import React, { useState, useEffect, useRef } from 'react';
import type { Ficha } from '../types';
import { FICHA_MATRIZ_ID } from '../constants';

interface HeaderProps {
    fichas: Record<string, Ficha>;
    currentFicha: Ficha;
    currentFichaId: string;
    switchFicha: (id: string) => void;
    nomePersonagem: string;
    nomeFicha: string;
    nivel: number;
    levelUpEffect: boolean;
    handleUpdate: <K extends keyof Ficha>(key: K, value: Ficha[K]) => void;
    onNewFicha: () => void;
    isGmMode: boolean;
    onToggleGmMode: () => void;
    onImport: () => void;
    onExport: () => void;
    onOpenNpcGenerator: () => void;
    onToggleAllSections: () => void;
    areAllSectionsExpanded: boolean;
    onLockClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ fichas, currentFicha, currentFichaId, switchFicha, nomePersonagem, nomeFicha, nivel, levelUpEffect, handleUpdate, onNewFicha, isGmMode, onToggleGmMode, onImport, onExport, onOpenNpcGenerator, onToggleAllSections, areAllSectionsExpanded, onLockClick }) => {
    const componentStyle = { backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)' };
    const [isIoMenuOpen, setIsIoMenuOpen] = useState(false);
    const ioMenuRef = useRef<HTMLDivElement>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newNomeFicha, setNewNomeFicha] = useState(nomeFicha);

     useEffect(() => {
        if (!isEditingName) {
            setNewNomeFicha(nomeFicha);
        }
    }, [nomeFicha, isEditingName]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ioMenuRef.current && !ioMenuRef.current.contains(event.target as Node)) {
                setIsIoMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSaveName = () => {
        if (newNomeFicha.trim() && newNomeFicha.trim() !== nomeFicha) {
            handleUpdate('nomeFicha', newNomeFicha.trim());
        }
        setIsEditingName(false);
    };

    return (
        <header className="p-4 border-b border-stone-700 flex flex-col gap-2" style={{backgroundColor: 'black', borderColor: 'var(--border-color)'}}>
            <div className="flex justify-between items-start gap-2">
                {isEditingName ? (
                     <div className="flex-grow flex items-center gap-2 min-w-0">
                        <input
                            type="text"
                            value={newNomeFicha}
                            onChange={(e) => setNewNomeFicha(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                            onBlur={handleSaveName}
                            className="flex-grow min-w-0 border border-stone-600 rounded-md p-2"
                            style={componentStyle}
                            autoFocus
                        />
                        <button onClick={handleSaveName} className="btn-interactive p-2 rounded-md bg-green-700 hover:bg-green-600 text-white">Salvar</button>
                        <button onClick={() => setIsEditingName(false)} className="btn-interactive p-2 rounded-md bg-stone-600 hover:bg-stone-500 text-white">X</button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-start min-w-0">
                        <div className="flex items-center gap-2 w-full">
                            <select
                                value={currentFichaId}
                                onChange={(e) => switchFicha(e.target.value)}
                                className="flex-1 min-w-0 border border-stone-600 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none truncate"
                                style={componentStyle}
                            >
                                {Object.values(fichas).sort((a: Ficha, b: Ficha) => {
                                    if (a.id === FICHA_MATRIZ_ID) return -1;
                                    if (b.id === FICHA_MATRIZ_ID) return 1;
                                    return a.nomeFicha.localeCompare(b.nomeFicha);
                                })
                                .map((f: Ficha) => (
                                    <option key={f.id} value={f.id}>{f.nomeFicha}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setIsEditingName(true)}
                                disabled={currentFichaId === FICHA_MATRIZ_ID}
                                title="Editar Nome da Ficha"
                                className="btn-interactive p-2 rounded-md bg-stone-700 hover:bg-stone-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ✏️
                            </button>
                        </div>
                        <span className={`christ-text sm:hidden ${levelUpEffect ? 'golden-glow-animation' : ''}`}>
                            Cristo Vive!
                        </span>
                    </div>
                )}
                
                <div className="flex items-start gap-2">
                     <button
                        onClick={onToggleAllSections}
                        className="hidden sm:flex btn-interactive bg-transparent text-blue-400 w-10 h-10 items-center justify-center expand-all-btn-glow"
                        title={areAllSectionsExpanded ? "Recolher Tudo" : "Expandir Tudo"}
                    >
                        <span className={`text-3xl transform transition-transform duration-300 ${areAllSectionsExpanded ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>
                     <button
                        onClick={onNewFicha}
                        className="btn-interactive bg-transparent text-white w-10 h-10 flex items-center justify-center"
                        title="Criar Nova Ficha"
                    >
                        <span className="fire-plus-button">+</span>
                    </button>
                    <div className="relative" ref={ioMenuRef}>
                        <button
                            onClick={() => setIsIoMenuOpen(v => !v)}
                            className="btn-interactive p-2 rounded-md bg-stone-700 hover:bg-stone-600 text-white"
                            title="Importar/Exportar Ficha"
                        >
                            <span className="text-xl">🔃</span>
                        </button>
                        {isIoMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 border border-stone-600 rounded-md shadow-lg z-10" style={{ backgroundColor: 'var(--component-bg-color)'}}>
                                <ul className="py-1">
                                    <li>
                                        <button onClick={() => { onImport(); setIsIoMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-stone-700" style={{ color: 'var(--text-color)' }}>
                                            Importar Ficha
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={() => { onExport(); setIsIoMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-stone-700" style={{ color: 'var(--text-color)' }}>
                                            Exportar Ficha
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onOpenNpcGenerator}
                        className="btn-interactive p-2 rounded-md bg-stone-700 hover:bg-stone-600 text-white flex items-center justify-center"
                        title="Gerador de personagem aleatório"
                    >
                        <span className="text-xl">🧙</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <button
                            onClick={onToggleGmMode}
                            className={`btn-interactive font-bold p-2 rounded-md text-2xl ${isGmMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-stone-700 hover:bg-stone-600'}`}
                            title={isGmMode ? "Desativar Modo Mestre" : "Ativar Modo Mestre"}
                        >
                            👑
                        </button>
                        <button
                            onClick={onLockClick}
                            disabled={currentFicha.id === FICHA_MATRIZ_ID}
                            className={`btn-interactive mt-1 p-0 rounded-md text-xl disabled:opacity-30 disabled:cursor-not-allowed ${currentFicha.isLocked ? 'text-yellow-400' : 'text-stone-400'}`}
                            title={currentFicha.isLocked ? "Ficha Trancada" : "Trancar Ficha"}
                        >
                            {currentFicha.isLocked ? '🔒' : '🔓'}
                        </button>
                    </div>
                </div>
            </div>
             <div className="text-center -mb-4">
                <span 
                    className={`level-display font-medieval text-7xl ${levelUpEffect ? 'level-up-flash' : 'level-pulse-glow'}`}
                    style={{ color: 'var(--accent-color)' }}
                >
                    {nivel}
                </span>
            </div>
             <input
                type="text"
                id="nome-personagem"
                placeholder="Nome do Personagem"
                value={nomePersonagem}
                onChange={(e) => handleUpdate('nomePersonagem', e.target.value)}
                className="w-full text-2xl sm:text-3xl font-medieval bg-transparent text-center focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-md px-2 py-1"
                style={{ color: 'var(--accent-color)' }}
            />
        </header>
    );
};
