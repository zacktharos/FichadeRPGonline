

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Ficha } from '../types';
import { calcularAtributos } from '../calculations';
import { Tooltip } from './Tooltip';
import { EditableStat } from './EditableStat';

type EditableAttributes = Pick<Ficha, 'forca' | 'destreza' | 'agilidade' | 'constituicao' | 'inteligencia'>;

interface AttributesProps {
    ficha: Ficha;
    onBulkUpdate: (updates: Partial<Ficha>) => void;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
    onSelectAttribute: (attribute: string) => void;
    selectedAttribute: string | null;
}

const attributeLabels: Record<keyof EditableAttributes, string> = {
    forca: 'Força',
    destreza: 'Destreza',
    agilidade: 'Agilidade',
    constituicao: 'Constituição',
    inteligencia: 'Inteligência',
};
const derivedAttributeLabels: Record<string, string> = {
    ataque: "Ataque",
    ataqueMagico: "Ataque Mágico",
    acerto: "Acerto",
    esquiva: "Esquiva",
    rdf: "RDF",
    rdm: "RDM"
};

const primaryAttributeTooltips: Record<keyof EditableAttributes, string> = {
    forca: "Olá, aventureiro! Como vai a Força? Falando nela, cada ponto que você distribui aqui aumenta seu Ataque em +1. Além disso, a cada 5 pontos, sua Redução de Dano Físico (RDF) e sua Capacidade de Carga melhoram. E não para por aí: a cada 10 pontos, seus pulos ficam mais altos e sua Vida Total recebe um bônus! Poder puro!",
    destreza: "Saudações, andarilho de mãos rápidas! Sua precisão é lendária. A cada 3 pontos em Destreza, seu Acerto aumenta em +1, garantindo que seus golpes atinjam o alvo. A cada 5 pontos, você também ganha +1 de Ataque, um toque de fineza em sua ofensiva.",
    agilidade: "Veloz como o vento, não é mesmo? Sua Agilidade é a chave para a sobrevivência. A cada 3 pontos, sua Esquiva aumenta em +1, tornando-o um alvo difícil. Ela também impulsiona sua Velocidade de Corrida e a Distância dos seus Pulos. Um bônus a cada 10 pontos ainda melhora seu Acerto!",
    constituicao: "Firme como uma montanha! Sua Constituição é o pilar da sua resistência. Cada ponto investido aqui aumenta drasticamente sua Vida, Magia e Vigor totais, além de acelerar a Regeneração de todos eles. Um verdadeiro herói precisa de fôlego para grandes batalhas!",
    inteligencia: "Olá, mente brilhante! O conhecimento é sua maior arma. Cada ponto em Inteligência aumenta seu Ataque Mágico em +1. A cada 5 pontos, sua Redução de Dano Mágico (RDM) melhora. Se for sábio o suficiente (10+ de INT), sua Magia Total será ampliada pela sua Constituição. Use seu poder com sabedoria!"
};

const derivedAttributeTooltips: Record<string, string> = {
    ataque: "Este é o seu poder de esmagar inimigos! Seu Ataque é a soma da sua Força, um bônus da sua Destreza (a cada 5 pontos) e o poder da sua arma. Quanto maior, mais dano você causa!",
    ataqueMagico: "O poder arcano flui através de você! Seu Ataque Mágico é a soma da sua Inteligência e o poder de sua arma mágica. Canalize essa energia para conjurar feitiços devastadores.",
    acerto: "De que adianta a força sem precisão? Seu Acerto determina a chance de atingir o alvo. Ele vem da sua Destreza (a cada 3 pontos) com um toque de Agilidade (a cada 10 pontos). Mire bem!",
    esquiva: "Ser intocável é uma grande vantagem. Sua Esquiva é sua capacidade de desviar de golpes, vinda diretamente da sua Agilidade (a cada 3 pontos). Dance pelo campo de batalha!",
    rdf: "Resistência é fundamental. Sua Redução de Dano Físico (RDF) diminui o dano de golpes, socos e flechas. Ela é forjada a partir da sua Força (a cada 5 pontos).",
    rdm: "Sua mente é um escudo. Sua Redução de Dano Mágico (RDM) protege você de feitiços e maldições. Ela é fortalecida pela sua Inteligência (a cada 5 pontos)."
};

const QuestionMarkIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`inline-block w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);

export const Attributes: React.FC<AttributesProps> = ({ ficha, onBulkUpdate, isGmMode, onGmUpdate, onSelectAttribute, selectedAttribute }) => {
    const [tempAttrs, setTempAttrs] = useState<Partial<EditableAttributes> | null>(null);
    const [changedStats, setChangedStats] = useState<Record<string, boolean>>({});
    const prevDisplayFichaRef = useRef<Ficha>(ficha);

    useEffect(() => {
        setTempAttrs(null);
    }, [ficha.id]);

    const displayFicha = useMemo(() => {
        const baseFicha = tempAttrs ? { ...ficha, ...tempAttrs } : ficha;
        return calcularAtributos(baseFicha);
    }, [ficha, tempAttrs]);
    
    useEffect(() => {
        const changes: Record<string, boolean> = {};
        const derivedKeys: (keyof Ficha)[] = ['ataque', 'ataqueMagico', 'acerto', 'esquiva', 'rdf', 'rdm'];
        
        derivedKeys.forEach(key => {
            if (displayFicha[key] !== prevDisplayFichaRef.current[key]) {
                changes[key] = true;
            }
        });
        
        if (Object.keys(changes).length > 0) {
            setChangedStats(changes);
            const timer = setTimeout(() => {
                setChangedStats({});
            }, 800);
            return () => clearTimeout(timer);
        }
        
        prevDisplayFichaRef.current = displayFicha;
    }, [displayFicha]);


    const pontosDisponiveis = displayFicha.pontosHabilidadeDisponiveis;

    const handleAttrChange = (attrKey: keyof EditableAttributes, delta: number) => {
        const currentVal = displayFicha[attrKey];
        const lockedVal = ficha.lockedAtributos[attrKey];
        const newValue = currentVal + delta;

        if (delta < 0 && newValue < lockedVal) {
            console.warn(`Cannot decrease ${attrKey} below locked value of ${lockedVal}`);
            return;
        }
        if (delta > 0 && pontosDisponiveis <= 0) {
            alert("Sem Pontos de Habilidade disponíveis.");
            return;
        }

        setTempAttrs(prev => ({
            ...(prev || {
                forca: ficha.forca,
                destreza: ficha.destreza,
                agilidade: ficha.agilidade,
                constituicao: ficha.constituicao,
                inteligencia: ficha.inteligencia,
            }),
            [attrKey]: newValue
        }));
    };
    
    const handleSave = () => {
        if (!tempAttrs) return;

        const newLockedAtributos = { ...ficha.lockedAtributos };
        const payload: Partial<Ficha> = {};

        (Object.keys(tempAttrs) as Array<keyof EditableAttributes>).forEach(key => {
            const tempValue = tempAttrs[key];
            if (tempValue !== undefined) {
                payload[key] = tempValue;
                newLockedAtributos[key] = Math.max(newLockedAtributos[key], tempValue);
            }
        });

        payload.lockedAtributos = newLockedAtributos;
        onBulkUpdate(payload);
        setTempAttrs(null);
    };

    const handleCancel = () => {
        setTempAttrs(null);
    };

    const handleGmUpdateDerived = (attrKey: keyof Ficha, newValue: number) => {
        const baseFicha = { ...ficha, gmAdjustments: { ...ficha.gmAdjustments, [attrKey]: 0 } };
        const calculatedFicha = calcularAtributos(baseFicha);
        const baseValue = calculatedFicha[attrKey] as number;
        const adjustment = newValue - baseValue;
        onGmUpdate(attrKey, adjustment);
    };

    const attributeMap: Array<{ primary: keyof EditableAttributes | null; derived: string | null }> = [
        { primary: 'forca', derived: 'ataque' },
        { primary: 'destreza', derived: 'acerto' },
        { primary: 'agilidade', derived: 'esquiva' },
        { primary: 'constituicao', derived: 'rdf' },
        { primary: 'inteligencia', derived: 'ataqueMagico' },
        { primary: null, derived: 'rdm' }
    ];
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    const inputStyle = { backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)'};
    
    const primaryAttributesForMobile = ['forca', 'destreza', 'agilidade', 'constituicao', 'inteligencia'];
    const derivedAttributesForMobile = ['ataque', 'ataqueMagico', 'acerto', 'esquiva', 'rdf', 'rdm'];

    return (
        <div className="p-3 rounded-lg" style={componentStyle}>
            {/* Common Header */}
            <div className="text-center mb-4">
                <h3 className="font-medieval text-xl">Atributos</h3>
                <p className="text-sm">Pontos Disponíveis: <span className={`font-bold text-xl ${pontosDisponiveis < 0 ? 'text-red-500' : 'text-green-400'}`}>{pontosDisponiveis}</span></p>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {attributeMap.map(({ primary, derived }) => (
                        <React.Fragment key={primary || derived}>
                            {/* Primary Attribute Cell */}
                            <div className="flex justify-between items-center py-1">
                                {primary ? (
                                    <>
                                        <div className="flex items-center gap-1.5">
                                            <label className="font-bold">{attributeLabels[primary]}</label>
                                            <Tooltip text={primaryAttributeTooltips[primary]}>
                                                <span className="cursor-help text-xs opacity-70"><QuestionMarkIcon /></span>
                                            </Tooltip>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onSelectAttribute(primary)} className={`btn-interactive text-xl opacity-60 hover:opacity-100 ${selectedAttribute === primary ? 'dice-selected-glow' : ''}`} title={`Rolar com ${attributeLabels[primary]}`}>🎲</button>
                                            {!isGmMode ? (
                                                <>
                                                    <button onClick={() => handleAttrChange(primary, -1)} disabled={displayFicha[primary] <= ficha.lockedAtributos[primary]} className="btn-interactive w-8 h-8 rounded-md bg-amber-800 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white">-</button>
                                                    <span className="w-10 text-center font-black text-lg">{displayFicha[primary]}</span>
                                                    <button onClick={() => handleAttrChange(primary, 1)} disabled={pontosDisponiveis <= 0} className="btn-interactive w-8 h-8 rounded-md bg-amber-800 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white">+</button>
                                                </>
                                            ) : (
                                                <EditableStat value={displayFicha[primary]} isGmMode={isGmMode} onUpdate={(val) => onBulkUpdate({ [primary]: val })} displayClass="font-bold text-lg" inputClass="w-20 text-center border border-stone-600 rounded-md" inputStyle={inputStyle} />
                                            )}
                                        </div>
                                    </>
                                ) : <div />}
                            </div>

                            {/* Derived Attribute Cell */}
                            <div className="flex justify-between items-center py-1">
                                {derived ? (
                                     <>
                                        <div className="flex items-center gap-1.5">
                                            <label className="font-bold" style={{ color: '#0ea5e9' }}>{derivedAttributeLabels[derived]}</label>
                                            <Tooltip text={derivedAttributeTooltips[derived]}>
                                                <span className="cursor-help text-xs opacity-70"><QuestionMarkIcon /></span>
                                            </Tooltip>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onSelectAttribute(derived)} className={`btn-interactive text-xl opacity-60 hover:opacity-100 ${selectedAttribute === derived ? 'dice-selected-glow' : ''}`} title={`Rolar com ${derivedAttributeLabels[derived]}`}>🎲</button>
                                            <EditableStat value={displayFicha[derived as keyof Ficha] as number} isGmMode={isGmMode} onUpdate={(val) => handleGmUpdateDerived(derived as keyof Ficha, val)} displayClass={`font-bold text-lg ${changedStats[derived] ? 'attribute-flash-animation' : ''}`} inputClass="w-20 text-center border border-stone-600 rounded-md" inputStyle={inputStyle} />
                                        </div>
                                    </>
                                ) : <div />}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden space-y-4">
                 <div>
                    <h4 className="font-medieval text-center mb-2">Primários</h4>
                    <div className="divide-y divide-stone-700">
                        {primaryAttributesForMobile.map(attr => (
                             <div key={attr} className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-1.5">
                                    <label className="font-bold">{attributeLabels[attr as keyof EditableAttributes]}</label>
                                    <Tooltip text={primaryAttributeTooltips[attr as keyof EditableAttributes]}>
                                        <span className="cursor-help text-xs opacity-70"><QuestionMarkIcon /></span>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onSelectAttribute(attr)} className={`btn-interactive text-xl opacity-60 hover:opacity-100 ${selectedAttribute === attr ? 'dice-selected-glow' : ''}`}>🎲</button>
                                    {!isGmMode ? (
                                        <>
                                            <button onClick={() => handleAttrChange(attr as keyof EditableAttributes, -1)} disabled={displayFicha[attr as keyof EditableAttributes] <= ficha.lockedAtributos[attr as keyof EditableAttributes]} className="btn-interactive w-8 h-8 rounded-md bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-white">-</button>
                                            <span className="w-10 text-center font-black text-lg">{displayFicha[attr as keyof EditableAttributes]}</span>
                                            <button onClick={() => handleAttrChange(attr as keyof EditableAttributes, 1)} disabled={pontosDisponiveis <= 0} className="btn-interactive w-8 h-8 rounded-md bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-white">+</button>
                                        </>
                                    ) : (
                                        <EditableStat value={displayFicha[attr as keyof EditableAttributes]} isGmMode={isGmMode} onUpdate={(val) => onBulkUpdate({ [attr]: val })} displayClass="font-bold text-lg" inputClass="w-20 text-center" inputStyle={inputStyle} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h4 className="font-medieval text-center mb-2" style={{ color: '#0ea5e9' }}>Secundários</h4>
                     <div className="divide-y divide-stone-700">
                        {derivedAttributesForMobile.map(key => (
                            <div key={key} className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-1.5">
                                    <label className="font-bold" style={{ color: '#0ea5e9' }}>{derivedAttributeLabels[key]}</label>
                                    <Tooltip text={derivedAttributeTooltips[key]}>
                                        <span className="cursor-help text-xs opacity-70"><QuestionMarkIcon /></span>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onSelectAttribute(key)} className={`btn-interactive text-xl opacity-60 hover:opacity-100 ${selectedAttribute === key ? 'dice-selected-glow' : ''}`}>🎲</button>
                                    <EditableStat value={displayFicha[key as keyof Ficha] as number} isGmMode={isGmMode} onUpdate={(val) => handleGmUpdateDerived(key as keyof Ficha, val)} displayClass={`font-bold text-lg ${changedStats[key] ? 'attribute-flash-animation' : ''}`} inputClass="w-20 text-center" inputStyle={inputStyle} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Common Save/Cancel Buttons */}
            {tempAttrs && (
                <div className="flex gap-2 pt-4 mt-2 border-t border-stone-600">
                    <button onClick={handleCancel} className="btn-interactive flex-1 py-2 bg-stone-600 hover:bg-stone-500 rounded-md text-white">Cancelar</button>
                    <button onClick={handleSave} className="btn-interactive flex-1 py-2 bg-green-700 hover:bg-green-600 rounded-md text-white">Salvar</button>
                </div>
            )}
        </div>
    );
};
