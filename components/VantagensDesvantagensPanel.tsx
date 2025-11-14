import React, { useState, useEffect } from 'react';
import type { Ficha } from '../types';
import { vantagensData, desvantagensData } from '../constants';

interface VantagensDesvantagensPanelProps {
    ficha: Ficha;
    pontosVantagemDisponiveis: number;
    onBulkUpdate: (updates: Partial<Ficha>) => void;
    onClose: () => void;
}

export const VantagensDesvantagensPanel: React.FC<VantagensDesvantagensPanelProps> = ({ ficha, pontosVantagemDisponiveis, onBulkUpdate, onClose }) => {
    const [tempVantagens, setTempVantagens] = useState([...ficha.vantagens]);
    const [tempDesvantagens, setTempDesvantagens] = useState([...ficha.desvantagens]);
    const [showSavedMessage, setShowSavedMessage] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    useEffect(() => {
        setTempVantagens([...ficha.vantagens]);
        setTempDesvantagens([...ficha.desvantagens]);
    }, [ficha.vantagens, ficha.desvantagens]);

    const calcularPHRestante = () => {
        let ph = pontosVantagemDisponiveis;
        
        ficha.vantagens.forEach(v => ph += (vantagensData.find(vd => vd.nome === v)?.custo || 0));
        ficha.desvantagens.forEach(d => ph -= (desvantagensData.find(dd => dd.nome === d)?.ganho || 0));

        tempVantagens.forEach(v => ph -= (vantagensData.find(vd => vd.nome === v)?.custo || 0));
        tempDesvantagens.forEach(d => ph += (desvantagensData.find(dd => dd.nome === d)?.ganho || 0));

        return ph;
    };
    
    const phRestante = calcularPHRestante();

    const toggleVantagem = (nome: string, custo: number) => {
        const isAlreadySaved = ficha.vantagens.includes(nome);
        if (isAlreadySaved) {
            return;
        }

        const vantagem = vantagensData.find(v => v.nome === nome);
        
        if (vantagem?.restricao === 'inicio' && ficha.nivel > 0 && !tempVantagens.includes(nome)) {
            alert("Esta vantagem só pode ser comprada no nível 0.");
            return;
        }

        if (tempVantagens.includes(nome)) {
            setTempVantagens(tempVantagens.filter(v => v !== nome));
        } else if (phRestante >= custo) {
            setTempVantagens([...tempVantagens, nome]);
        } else {
            alert("Pontos de Vantagem insuficientes!");
        }
    };
    
    const toggleDesvantagem = (nome: string) => {
         const isAlreadySaved = ficha.desvantagens.includes(nome);
        if (isAlreadySaved) {
            return;
        }

        if (tempDesvantagens.includes(nome)) {
            setTempDesvantagens(tempDesvantagens.filter(d => d !== nome));
        } else {
             if (ficha.nivel > 0) {
                alert("Desvantagens só podem ser adquiridas no nível 0.");
                return;
            }
            if(tempDesvantagens.length >= 3) {
                alert("Você pode ter no máximo 3 desvantagens!");
                return;
            }
            setTempDesvantagens([...tempDesvantagens, nome]);
        }
    };
    
    const handleSave = () => {
        onBulkUpdate({
            vantagens: tempVantagens,
            desvantagens: tempDesvantagens,
        });
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
    };
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    const arraysAreEqual = (a: string[], b: string[]) => {
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((value, index) => value === sortedB[index]);
    };

    const hasChanges = !arraysAreEqual(tempVantagens, ficha.vantagens) || !arraysAreEqual(tempDesvantagens, ficha.desvantagens);

    return (
        <div className={`fixed inset-0 bg-black/80 z-40 flex flex-col p-4 ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
            <div className="bg-stone-900 rounded-lg p-4 flex-grow flex flex-col border border-stone-700 relative min-h-0">
                <button onClick={handleClose} className="absolute top-4 right-4 text-3xl font-bold text-yellow-500 hover:text-yellow-400 z-10">&times;</button>
                <div className="text-center mb-4 flex-shrink-0">
                    <h2 className="text-3xl font-medieval">Vantagens e Desvantagens</h2>
                    <p>Pontos Restantes: <span className={`font-bold text-lg ${phRestante < 0 ? 'text-red-500' : 'text-green-400'}`}>{phRestante}</span></p>
                    <div className="mt-2 flex justify-center items-center gap-4">
                        <button onClick={handleSave} className="btn-interactive py-2 px-6 bg-amber-700 hover:bg-amber-600 rounded-md text-white disabled:bg-stone-600 disabled:cursor-not-allowed" disabled={!hasChanges}>
                            Salvar
                        </button>
                        {showSavedMessage && <span className="text-green-400 text-sm">Salvo!</span>}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 flex-grow min-h-0">
                    {/* Vantagens Column */}
                    <div className="flex flex-col space-y-2 flex-1 min-h-0">
                        <h3 className="text-xl font-medieval text-center flex-shrink-0">Vantagens</h3>
                        <div className="overflow-y-auto pr-2 space-y-1 p-2 rounded-md border border-stone-700" style={componentStyle}>
                            {vantagensData.map(v => {
                                const isSelected = tempVantagens.includes(v.nome);
                                const isSaved = ficha.vantagens.includes(v.nome);
                                return (
                                <div 
                                    key={v.nome} 
                                    onClick={() => toggleVantagem(v.nome, v.custo)} 
                                    className={`p-2 rounded transition-colors text-sm ${
                                        isSaved 
                                        ? 'bg-amber-900/70 cursor-not-allowed' 
                                        : isSelected 
                                            ? 'bg-green-800/50 cursor-pointer' 
                                            : 'hover:bg-stone-700/50 cursor-pointer'
                                    }`}
                                >
                                    <strong>{v.nome}</strong> ({v.custo} PH) <p className="text-xs opacity-70">{v.descricao}</p>
                                </div>
                            )})}
                        </div>
                    </div>
                    
                    {/* Desvantagens Column */}
                    <div className="flex flex-col space-y-2 flex-1 min-h-0">
                        <h3 className="text-xl font-medieval text-red-500 text-center flex-shrink-0">Desvantagens</h3>
                        <div className="overflow-y-auto pr-2 space-y-1 p-2 rounded-md border border-stone-700" style={componentStyle}>
                            {desvantagensData.map(d => {
                                const isSelected = tempDesvantagens.includes(d.nome);
                                const isSaved = ficha.desvantagens.includes(d.nome);
                                return (
                                <div 
                                    key={d.nome} 
                                    onClick={() => toggleDesvantagem(d.nome)} 
                                    className={`p-2 rounded transition-colors text-sm ${
                                        isSaved 
                                        ? 'bg-amber-900/70 cursor-not-allowed' 
                                        : isSelected 
                                            ? 'bg-red-800/50 cursor-pointer' 
                                            : 'hover:bg-stone-700/50 cursor-pointer'
                                    }`}
                                >
                                    <strong>{d.nome}</strong> (+{d.ganho} PH) <p className="text-xs opacity-70">{d.descricao}</p>
                                </div>
                            )})}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
