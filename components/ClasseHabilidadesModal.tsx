import React, { useState, useMemo } from 'react';
import type { Ficha, ClasseHabilidade, Magia } from '../types';
import { classesData } from '../constants';
import { Modal } from './Modal';
import { EditableStat } from './EditableStat';

interface ClasseHabilidadesModalProps {
    ficha: Ficha;
    pontosVantagemDisponiveis: number;
    onUpdate: (updates: Partial<Ficha>) => void;
    onClose: () => void;
    isOpeningAfterLevelUp: boolean;
    isGmMode: boolean;
}

const SoulOrb = () => <div className="soul-orb"></div>;

export const ClasseHabilidadesModal: React.FC<ClasseHabilidadesModalProps> = ({
    ficha,
    pontosVantagemDisponiveis,
    onUpdate,
    onClose,
    isOpeningAfterLevelUp,
    isGmMode
}) => {
    const selectedClasseData = ficha.classeSelecionada ? classesData.find(c => c.nome === ficha.classeSelecionada) : null;

    const [tempHabilidadesAdquiridas, setTempHabilidadesAdquiridas] = useState([...ficha.habilidadesClasseAdquiridas]);
    // Fix: Ensure `habilidadesClasseCompradasComPV` is an array before spreading, preventing crashes with corrupted data.
    const [tempHabilidadesCompradasComPV, setTempHabilidadesCompradasComPV] = useState([...(Array.isArray(ficha.habilidadesClasseCompradasComPV) ? ficha.habilidadesClasseCompradasComPV : [])]);
    const [almasGastasNestaSessao, setAlmasGastasNestaSessao] = useState(0);

    const habilidadesPorNivel = useMemo(() => {
        if (!selectedClasseData) return {};
        const grouped: Record<number, ClasseHabilidade[]> = {};
        selectedClasseData.habilidades.forEach(h => {
            if (!grouped[h.nivel]) {
                grouped[h.nivel] = [];
            }
            grouped[h.nivel].push(h);
        });
        return grouped;
    }, [selectedClasseData]);

    const almasDisponiveis = useMemo(() => {
        return ficha.almasTotais - ficha.almasGastas - almasGastasNestaSessao;
    }, [ficha.almasTotais, ficha.almasGastas, almasGastasNestaSessao]);
    
    const pvDisponiveis = useMemo(() => {
        let pv = pontosVantagemDisponiveis;
        // Calculate PV spent on skills in this session
        const pvGastosNestaSessao = tempHabilidadesCompradasComPV
            // FIX: Safely check if ficha.habilidadesClasseCompradasComPV is an array before using .includes
            .filter(hNome => !(Array.isArray(ficha.habilidadesClasseCompradasComPV) && ficha.habilidadesClasseCompradasComPV.includes(hNome)))
            .reduce((total, hNome) => {
                const habilidade = selectedClasseData?.habilidades.find(h => h.nome === hNome);
                return total + (habilidade?.custoPVSemAlma || 0);
            }, 0);
        return pv - pvGastosNestaSessao;
    }, [pontosVantagemDisponiveis, tempHabilidadesCompradasComPV, ficha.habilidadesClasseCompradasComPV, selectedClasseData]);


    if (!selectedClasseData) {
        return null;
    }
    
    const toggleHabilidade = (habilidade: ClasseHabilidade) => {
        const isAdquirida = tempHabilidadesAdquiridas.includes(habilidade.nome);

        if (isAdquirida) {
            // Cannot un-acquire skills
            return;
        }

        if (ficha.nivel < habilidade.nivel) {
            alert(`Você precisa ser nível ${habilidade.nivel} para adquirir esta habilidade.`);
            return;
        }

        if (almasDisponiveis > 0) {
            setTempHabilidadesAdquiridas([...tempHabilidadesAdquiridas, habilidade.nome]);
            setAlmasGastasNestaSessao(almasGastasNestaSessao + 1);
        } else if (pvDisponiveis >= habilidade.custoPVSemAlma) {
            setTempHabilidadesAdquiridas([...tempHabilidadesAdquiridas, habilidade.nome]);
            setTempHabilidadesCompradasComPV([...tempHabilidadesCompradasComPV, habilidade.nome]);
        } else {
            alert("Você não tem Almas ou Pontos de Vantagem suficientes para adquirir esta habilidade.");
        }
    };
    
    const handleSave = () => {
        const novasHabilidadesAdquiridas = tempHabilidadesAdquiridas.filter(h => !ficha.habilidadesClasseAdquiridas.includes(h));
        
        const novasMagias: Magia[] = novasHabilidadesAdquiridas.map(nomeHabilidade => {
            const habilidade = selectedClasseData.habilidades.find(h => h.nome === nomeHabilidade);
            return {
                nome: habilidade?.nome || 'Desconhecida',
                custo: habilidade?.custoMagia || 0,
                custoVigor: habilidade?.custoVigor || 0,
                dano: habilidade?.dano || '',
                tipo: habilidade?.tipo || 'utilidade',
                isClassSkill: true,
                descricao: habilidade?.descricao,
                duracao: habilidade?.duracao,
                castingTime: habilidade?.castingTime,
                cooldown: habilidade?.cooldown,
                efeitoNegativo: habilidade?.efeitoNegativo,
            };
        });

        onUpdate({
            habilidadesClasseAdquiridas: tempHabilidadesAdquiridas,
            habilidadesClasseCompradasComPV: tempHabilidadesCompradasComPV,
            almasGastas: ficha.almasGastas + almasGastasNestaSessao,
            magiasHabilidades: [...ficha.magiasHabilidades, ...novasMagias]
        });
        onClose();
    };
    
    const hasChanges = tempHabilidadesAdquiridas.length > ficha.habilidadesClasseAdquiridas.length;
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    const highlightColor = 'var(--accent-color)';

    return (
        <Modal 
            title={`Habilidades de ${selectedClasseData.nome}`} 
            onClose={onClose} 
            className={isOpeningAfterLevelUp ? 'star-shine-animation' : ''}
        >
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="flex justify-around items-center p-3 rounded-lg text-center" style={componentStyle}>
                    <div>
                        <div className="text-sm opacity-80">{isGmMode ? 'Almas Totais' : 'Almas Disponíveis'}</div>
                        {isGmMode ? (
                             <EditableStat
                                value={ficha.almasTotais}
                                isGmMode={isGmMode}
                                onUpdate={(newTotal) => onUpdate({ almasTotais: Math.max(0, newTotal) })}
                                displayClass="text-xl font-bold"
                                inputClass="w-20 text-center border border-stone-600 rounded-md"
                                inputStyle={{ backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)'}}
                            />
                        ) : (
                             <div className="flex items-center justify-center gap-2 mt-1">
                                {Array.from({ length: Math.max(0, almasDisponiveis) }).map((_, i) => <SoulOrb key={i} />)}
                                {almasDisponiveis <= 0 && <span className="text-xl font-bold">{almasDisponiveis}</span>}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm opacity-80">PV Disponíveis</div>
                        <div className="text-xl font-bold">{pvDisponiveis}</div>
                    </div>
                </div>

                {isOpeningAfterLevelUp && (
                     <div className="p-3 bg-amber-800/30 border border-amber-600 rounded-md text-center">
                        <p className="font-bold">🎉 Você subiu de nível e ganhou uma Alma! 🎉</p>
                        <p className="text-sm opacity-90">Use-a para adquirir uma nova habilidade de classe gratuitamente.</p>
                    </div>
                )}
                
                 {Object.entries(habilidadesPorNivel)
                 .filter(([nivel]) => ficha.nivel >= parseInt(nivel))
                 .map(([nivel, habilidades]) => (
                    <div key={nivel}>
                        <h3 className="font-medieval text-lg mb-2" style={{ color: highlightColor }}>Nível {nivel}</h3>
                        <div className="space-y-2">
                            {(Array.isArray(habilidades) ? habilidades : []).map(h => {
                                const isAcquired = tempHabilidadesAdquiridas.includes(h.nome);
                                const isCompradaComPV = tempHabilidadesCompradasComPV.includes(h.nome) && !(Array.isArray(ficha.habilidadesClasseCompradasComPV) && ficha.habilidadesClasseCompradasComPV.includes(h.nome));
                                const isDisabled = ficha.nivel < h.nivel || isAcquired;

                                let containerClasses = 'w-full text-left p-3 rounded-lg border transition-all duration-200 ';
                                let buttonText = '';
                                
                                if (isAcquired) {
                                    containerClasses += 'bg-green-800/40 border-green-600 cursor-default';
                                    buttonText = 'Adquirida';
                                } else if (isDisabled) {
                                    containerClasses += 'bg-stone-800/50 border-stone-700 opacity-60 cursor-not-allowed';
                                } else {
                                    containerClasses += 'hover:bg-stone-700/50 cursor-pointer border-stone-600';
                                    buttonText = almasDisponiveis > 0 ? 'Adquirir com Alma' : `Adquirir (${h.custoPVSemAlma} PV)`;
                                }

                                return (
                                    <div key={h.nome} onClick={() => !isDisabled && toggleHabilidade(h)} className={containerClasses} style={{...componentStyle, borderColor: 'var(--border-color)'}}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 pr-2">
                                                <p className="font-bold">{h.nome} <span className="text-xs font-normal opacity-70">({h.tipo})</span></p>
                                                <p className="text-sm opacity-90 mt-1">{h.descricao}</p>
                                                <div className="mt-2 text-xs opacity-80 grid grid-cols-2 gap-x-4 gap-y-1">
                                                    {h.dano && <div><strong>Dano/Efeito:</strong> {h.dano}</div>}
                                                    {h.duracao && h.duracao !== "N/A" && <div><strong>Duração:</strong> {h.duracao}</div>}
                                                    {h.castingTime && h.castingTime !== "N/A" && <div><strong>Casting:</strong> {h.castingTime}</div>}
                                                    {h.cooldown && h.cooldown !== "N/A" && <div><strong>Cooldown:</strong> {h.cooldown}</div>}
                                                </div>
                                                {h.efeitoNegativo && h.efeitoNegativo !== "N/A" && <div className="mt-1 text-xs text-red-400"><strong>Negativo:</strong> {h.efeitoNegativo}</div>}
                                            </div>
                                            <div className="text-right ml-2 flex-shrink-0">
                                                <div className={`font-bold ${isAcquired ? 'text-green-400' : ''} ${isCompradaComPV ? 'text-yellow-400' : ''}`}>{buttonText}</div>
                                                {h.custoMagia > 0 && <p className="text-xs text-blue-400" title="Custo de Magia">✨ {h.custoMagia}</p>}
                                                {h.custoVigor > 0 && <p className="text-xs text-yellow-400" title="Custo de Vigor">⚡ {h.custoVigor}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                 ))}

            </div>
            <div className="mt-6 flex justify-end gap-2">
                <button onClick={onClose} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Cancelar</button>
                <button onClick={handleSave} disabled={!hasChanges} className="btn-interactive px-4 py-2 bg-amber-700 rounded disabled:bg-stone-500 disabled:cursor-not-allowed text-white">Confirmar</button>
            </div>
        </Modal>
    );
};