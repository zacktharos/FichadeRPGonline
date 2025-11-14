import React, { useState, useEffect, useMemo } from 'react';
import type { Ficha, Raca, SubRaca } from '../types';
import { racasData, vantagensData, desvantagensData, classesData } from '../constants';
import { Modal } from './Modal';


interface RacasPanelProps {
    ficha: Ficha;
    pontosVantagemDisponiveis: number;
    onUpdate: (updates: Partial<Ficha>) => void;
    onClose: () => void;
}

export const RacasPanel: React.FC<RacasPanelProps> = ({ ficha, pontosVantagemDisponiveis, onUpdate, onClose }) => {
    const [tempRaca, setTempRaca] = useState<string | null>(ficha.racaSelecionada);
    const [tempSubRaca, setTempSubRaca] = useState<string | null>(ficha.subRacaSelecionada);
    const [showSavedMessage, setShowSavedMessage] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [subRaceModalData, setSubRaceModalData] = useState<Raca | null>(null);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    useEffect(() => {
        setTempRaca(ficha.racaSelecionada);
        setTempSubRaca(ficha.subRacaSelecionada);
    }, [ficha.racaSelecionada, ficha.subRacaSelecionada]);
    
    const calcularPHRestante = (selectedRaca: string | null, selectedSubRaca: string | null) => {
        let ph = ficha.pontosVantagemTotais;
    
        // Recalculate base spent points
        ficha.vantagens.forEach(v => ph -= (vantagensData.find(vd => vd.nome === v)?.custo || 0));
        ficha.desvantagens.forEach(d => ph += (desvantagensData.find(dd => dd.nome === d)?.ganho || 0));
        if (ficha.classeSelecionada) {
            ph -= classesData.find(c => c.nome === ficha.classeSelecionada)?.custo || 0;
        }

        // Add back the cost of the currently saved race/sub-race
        if (ficha.racaSelecionada) {
            const savedRacaData = racasData.find(r => r.nome === ficha.racaSelecionada);
            if (savedRacaData) {
                ph += savedRacaData.custo;
                if (ficha.subRacaSelecionada) {
                    const savedSubRacaData = savedRacaData.subRacas?.find(sr => sr.nome === ficha.subRacaSelecionada);
                    if (savedSubRacaData) {
                        ph += savedSubRacaData.custoAdicional;
                    }
                }
            }
        }
    
        // Subtract the cost of the newly selected race/sub-race
        if (selectedRaca) {
            const newRacaData = racasData.find(r => r.nome === selectedRaca);
            if (newRacaData) {
                ph -= newRacaData.custo;
                if (selectedSubRaca) {
                    const newSubRacaData = newRacaData.subRacas?.find(sr => sr.nome === selectedSubRaca);
                    if (newSubRacaData) {
                        ph -= newSubRacaData.custoAdicional;
                    }
                }
            }
        }
    
        return ph;
    };
    
    const phRestante = useMemo(() => calcularPHRestante(tempRaca, tempSubRaca), [tempRaca, tempSubRaca, ficha]);

    const handleSelectRaca = (raca: Raca) => {
        if (ficha.racaSelecionada) {
            alert("Uma raça já foi selecionada. Para alterar, use a opção 'Excluir...' na ficha.");
            return;
        }

        if (raca.subRacas && raca.subRacas.length > 0) {
            setSubRaceModalData(raca);
        } else {
            if (tempRaca === raca.nome) {
                setTempRaca(null);
                setTempSubRaca(null);
            } else if (calcularPHRestante(raca.nome, null) >= 0) {
                setTempRaca(raca.nome);
                setTempSubRaca(null);
            } else {
                alert("Pontos de Vantagem insuficientes para selecionar esta raça!");
            }
        }
    };
    
    const handleSelectSubRaca = (subRaca: SubRaca) => {
        if (!subRaceModalData) return;
        
        if (calcularPHRestante(subRaceModalData.nome, subRaca.nome) >= 0) {
            setTempRaca(subRaceModalData.nome);
            setTempSubRaca(subRaca.nome);
            setSubRaceModalData(null); // Close modal
        } else {
             alert("Pontos de Vantagem insuficientes para selecionar esta sub-raça!");
        }
    }
    
    const handleSave = () => {
        const updates: Partial<Ficha> = {
            racaSelecionada: tempRaca,
            subRacaSelecionada: tempSubRaca,
        };
        
        // Apply automatic effects for primary stats
        if (tempRaca && tempSubRaca) {
            const racaData = racasData.find(r => r.nome === tempRaca);
            const subRacaData = racaData?.subRacas?.find(sr => sr.nome === tempSubRaca);
            if (subRacaData?.efeito) {
                const applyEffect = (eff: { atributo: keyof Ficha; valor: number }) => {
                    const primaryAttributes: (keyof Ficha)[] = ['forca', 'destreza', 'agilidade', 'constituicao', 'inteligencia'];
                    if (primaryAttributes.includes(eff.atributo)) {
                        (updates as any)[eff.atributo] = (ficha as any)[eff.atributo] + eff.valor;
                    }
                };

                if (Array.isArray(subRacaData.efeito)) {
                    subRacaData.efeito.forEach(applyEffect);
                } else {
                    applyEffect(subRacaData.efeito);
                }
            }
        }
        
        onUpdate(updates);
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
    };
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    const isRaceLocked = !!ficha.racaSelecionada;

    return (
        <>
            <div className={`fixed inset-0 bg-black/80 z-40 flex flex-col p-4 ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
                <div className="bg-stone-900 rounded-lg p-4 flex-grow flex flex-col border border-stone-700 relative min-h-0">
                    <button onClick={handleClose} className="absolute top-4 right-4 text-3xl font-bold text-yellow-500 hover:text-yellow-400 z-10">&times;</button>
                    <div className="text-center mb-4">
                        <h2 className="text-3xl font-medieval">Raças</h2>
                        <p>Pontos Restantes Após Seleção: <span className={`font-bold text-lg ${phRestante < 0 ? 'text-red-500' : 'text-green-400'}`}>{phRestante}</span></p>
                        <div className="mt-2 flex justify-center items-center gap-4">
                             <button 
                                onClick={handleSave} 
                                className="btn-interactive py-2 px-6 bg-amber-700 hover:bg-amber-600 rounded-md text-white disabled:bg-stone-600 disabled:cursor-not-allowed" 
                                disabled={isRaceLocked || (tempRaca === ficha.racaSelecionada && tempSubRaca === ficha.subRacaSelecionada)}
                             >
                                Salvar
                            </button>
                            {showSavedMessage && <span className="text-green-400 text-sm">Salvo!</span>}
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-3 pr-2 min-h-0">
                        {racasData.map(raca => {
                            const isSelected = tempRaca === raca.nome;
                            const isSavedAndLocked = isRaceLocked && ficha.racaSelecionada === raca.nome;
                            const isDisabled = isRaceLocked && !isSavedAndLocked;

                            let containerClasses = 'p-3 rounded transition-all border-2 ';
                            if (isSavedAndLocked) {
                                containerClasses += 'border-amber-700 bg-amber-900/70 cursor-default';
                            } else if (isDisabled) {
                                containerClasses += 'border-transparent bg-stone-800 opacity-50 cursor-not-allowed';
                            } else if (isSelected) {
                                containerClasses += 'border-amber-500 bg-amber-900/50 cursor-pointer';
                            } else {
                                containerClasses += 'border-transparent bg-stone-800 hover:bg-stone-700 cursor-pointer';
                            }
                            
                            return (
                             <div 
                                key={raca.nome} 
                                onClick={() => handleSelectRaca(raca)} 
                                className={containerClasses}
                                style={isSavedAndLocked || isSelected ? {} : componentStyle}
                             >
                                <h3 className="font-medieval text-lg" style={{ color: 'var(--accent-color)' }}>
                                    {raca.nome} ({raca.custo} PV)
                                    {isSelected && tempSubRaca && ` - ${tempSubRaca}`}
                                </h3>
                                <p className="text-sm mb-2">{raca.descricao}</p>
                                <ul className="list-disc list-inside text-xs opacity-70 space-y-1">
                                    {raca.vantagens.map(v => <li key={v}>{v}</li>)}
                                </ul>
                            </div>
                        )})}
                    </div>
                </div>
            </div>
            {subRaceModalData && (
                <Modal title={`Escolha a sub-raça de ${subRaceModalData.nome}`} onClose={() => setSubRaceModalData(null)}>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {subRaceModalData.subRacas?.map(subRaca => (
                            <div
                                key={subRaca.nome}
                                onClick={() => handleSelectSubRaca(subRaca)}
                                className="p-3 rounded-lg border-2 border-transparent hover:border-amber-500 hover:bg-stone-700/50 cursor-pointer"
                                style={componentStyle}
                            >
                                <h4 className="font-bold">{subRaca.nome} (+{subRaca.custoAdicional} PV)</h4>
                                <p className="text-sm opacity-80">{subRaca.descricao}</p>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
        </>
    );
};