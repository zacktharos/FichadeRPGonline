import React, { useState } from 'react';
import type { Ficha } from '../types';
import { useCountUp } from '../hooks/useCountUp';
import { EditableStat } from './EditableStat';
import { nivelData } from '../constants';

interface VitalsProps {
    ficha: Ficha;
    onBulkUpdate: (updates: Partial<Ficha>) => void;
    pontosVantagemDisponiveis: number;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
    levelUpEffect: boolean;
}

export const Vitals: React.FC<VitalsProps> = ({ ficha, onBulkUpdate, pontosVantagemDisponiveis, isGmMode, onGmUpdate, levelUpEffect }) => {
    const [isAddingExp, setIsAddingExp] = useState(false);
    const [expToAdd, setExpToAdd] = useState('');

    const pdAnimated = useCountUp(ficha.pontosHabilidadeDisponiveis);
    const pvAnimated = useCountUp(pontosVantagemDisponiveis);

    const handleAddExp = () => {
        const toAdd = parseInt(expToAdd, 10);
        if (toAdd > 0) {
            const newExp = ficha.experiencia + toAdd;
            const newLockedExp = Math.max(ficha.lockedExperiencia, newExp);
            onBulkUpdate({ experiencia: newExp, lockedExperiencia: newLockedExp });
        }
        setIsAddingExp(false);
        setExpToAdd('');
    };

    const handleGmUpdateExp = (newExp: number) => {
        onBulkUpdate({ experiencia: newExp, lockedExperiencia: newExp });
    };

    const handleGmUpdatePd = (newAvailablePd: number) => {
        const spentPd = ficha.pontosHabilidadeTotais - ficha.pontosHabilidadeDisponiveis;
        const newTotalPd = spentPd + newAvailablePd;
        const levelBasedPd = nivelData.find(n => n.nivel === ficha.nivel)?.pd ?? nivelData[0].pd;
        const adjustment = newTotalPd - levelBasedPd;
        onGmUpdate('pontosHabilidadeTotais', adjustment);
    };

    const handleGmUpdatePv = (newAvailablePv: number) => {
        const spentPv = ficha.pontosVantagemTotais - pontosVantagemDisponiveis;
        const newTotalPv = spentPv + newAvailablePv;
        const levelBasedPv = nivelData.find(n => n.nivel === ficha.nivel)?.ph ?? nivelData[0].ph;
        const adjustment = newTotalPv - levelBasedPv;
        onGmUpdate('pontosVantagemTotais', adjustment);
    };

    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    const inputStyle = { backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)'};

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg" style={componentStyle}>
                <label className="text-sm opacity-70 block">Nível</label>
                <span className={`text-2xl sm:text-3xl font-bold ${levelUpEffect ? 'level-up-number-pop-animation' : ''}`} style={{ color: 'var(--accent-color)' }}>{ficha.nivel}</span>
            </div>
            <div className="p-3 rounded-lg flex flex-col justify-center" style={componentStyle}>
                <label className="text-sm opacity-70 block">Experiência</label>
                {isAddingExp ? (
                    <>
                        <input
                            type="number"
                            value={expToAdd}
                            onChange={e => setExpToAdd(e.target.value)}
                            placeholder="Adicionar EXP"
                            className="w-full text-xl font-bold text-center rounded-md p-1 appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            style={inputStyle}
                            autoFocus
                        />
                        <div className="flex gap-2 justify-center mt-2">
                            <button onClick={() => { setIsAddingExp(false); setExpToAdd(''); }} className="btn-interactive px-3 py-1 bg-stone-600 hover:bg-stone-500 text-xs rounded text-white">Cancelar</button>
                            <button onClick={handleAddExp} className="btn-interactive px-3 py-1 bg-green-700 hover:bg-green-600 text-xs rounded text-white">Salvar</button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                         <EditableStat
                            value={ficha.experiencia}
                            isGmMode={isGmMode}
                            onUpdate={handleGmUpdateExp}
                            displayClass="text-2xl sm:text-3xl font-bold"
                            inputClass="w-full bg-transparent text-2xl sm:text-3xl font-bold text-center appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        {!isGmMode && (
                             <button onClick={() => setIsAddingExp(true)} title="Adicionar Experiência" className="btn-interactive text-xl bg-green-800 hover:bg-green-700 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-white">+</button>
                        )}
                    </div>
                )}
            </div>
            <div className="p-3 rounded-lg" style={componentStyle}>
                <label className="text-sm opacity-70 block">PD Disponíveis</label>
                <EditableStat
                    value={pdAnimated}
                    isGmMode={isGmMode}
                    onUpdate={handleGmUpdatePd}
                    displayClass={`text-2xl sm:text-3xl font-bold ${ficha.pontosHabilidadeDisponiveis < 0 ? 'text-red-500' : ''}`}
                    inputClass="w-full bg-transparent text-2xl sm:text-3xl font-bold text-center appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
            </div>
            <div className="p-3 rounded-lg" style={componentStyle}>
                <label className="text-sm opacity-70 block">PV Disponíveis</label>
                <EditableStat
                    value={pvAnimated}
                    isGmMode={isGmMode}
                    onUpdate={handleGmUpdatePv}
                    displayClass={`text-2xl sm:text-3xl font-bold ${pontosVantagemDisponiveis < 0 ? 'text-red-500' : ''}`}
                    inputClass="w-full bg-transparent text-2xl sm:text-3xl font-bold text-center appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
            </div>
        </div>
    );
};