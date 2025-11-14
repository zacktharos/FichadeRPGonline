import React, { useState, useEffect, useRef } from 'react';
import type { Ficha } from '../types';
import { EditableStat } from './EditableStat';
import { Tooltip } from './Tooltip';

interface ResourceBarsProps {
    ficha: Ficha;
    onUpdate: (updates: Partial<Ficha>) => void;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
}

const resourceTooltips: Record<string, string> = {
    vida: "Sua energia vital, o que te mantém de pé! Sua Vida Total é calculada com base na sua Constituição, com um bônus da sua Força e Nível. Lembre-se, um herói ferido ainda é um herói, mas um herói morto... nem tanto. Sua regeneração por turno é 0.2 * Constituição.",
    magia: "A fonte do seu poder arcano. Sua Magia Total depende da sua Constituição e, para os mais sábios, da sua Inteligência. Gerencie bem este recurso para virar o jogo com feitiços poderosos! Sua regeneração por turno é 0.8 * Constituição.",
    vigor: "Seu fôlego de combate, a estamina para feitos incríveis! Seu Vigor é determinado pela sua Constituição e é essencial para usar habilidades especiais e continuar lutando. Mantenha-o alto para não se cansar no meio da batalha! Sua regeneração por turno é 0.4 * Constituição."
};

const QuestionMarkIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`inline-block w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);


const ResourceBar: React.FC<{
    label: string;
    current: number;
    total: number;
    color: string;
    icon: string;
    regeneration: number;
    onCurrentChange: (value: number) => void;
    totalKey: keyof Ficha;
    isGmMode: boolean;
    onGmUpdate: (attr: keyof Ficha, adjustment: number) => void;
    baseTotal: number;
}> = ({ label, current, total, color, icon, regeneration, onCurrentChange, totalKey, isGmMode, onGmUpdate, baseTotal }) => {
    const prevCurrentRef = useRef(current);
    const [ghostPercentage, setGhostPercentage] = useState((current / total) * 100);
    const [shimmer, setShimmer] = useState(false);

    useEffect(() => {
        const percentage = total > 0 ? (current / total) * 100 : 0;
        if (current < prevCurrentRef.current) {
            // Damage taken
            setGhostPercentage((prevCurrentRef.current / total) * 100);
            setTimeout(() => {
                setGhostPercentage(percentage);
            }, 100);
        } else if (current > prevCurrentRef.current) {
            // Healed
            setGhostPercentage(percentage);
            setShimmer(true);
            setTimeout(() => setShimmer(false), 1200);
        } else {
             setGhostPercentage(percentage);
        }

        prevCurrentRef.current = current;
    }, [current, total]);

    const percentage = total > 0 ? (current / total) * 100 : 0;

    const handleGmUpdate = (newValue: number) => {
        const adjustment = newValue - baseTotal;
        onGmUpdate(totalKey, adjustment);
    };

    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    const inputStyle = { backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)'};


    return (
        <div className="bg-stone-900/50 p-3 rounded-lg" style={componentStyle}>
            <div className="flex justify-between items-center mb-1 text-sm">
                <div className="flex items-center gap-1.5 font-bold">
                    <span>{icon} {label}</span>
                    <Tooltip text={resourceTooltips[label.toLowerCase()]}>
                        <span className="cursor-help text-xs opacity-70" aria-label={`Explicação para ${label}`}><QuestionMarkIcon /></span>
                    </Tooltip>
                </div>
                <div className="font-mono flex items-center gap-1">
                    <span>{current} /</span>
                    <EditableStat
                        value={total}
                        isGmMode={isGmMode}
                        onUpdate={handleGmUpdate}
                        displayClass="font-mono"
                        inputClass="w-16 text-center border border-stone-600 rounded-md"
                        inputStyle={inputStyle}
                    />
                </div>
            </div>
            <div className="w-full bg-stone-700 rounded-full h-4 overflow-hidden border border-stone-600 relative">
                <div
                    className="absolute top-0 left-0 h-full bg-black/30 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${ghostPercentage}%` }}
                ></div>
                <div
                    className={`${color} h-4 rounded-full transition-all duration-300 ease-out relative overflow-hidden ${shimmer ? 'shimmer-bar' : ''}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <div className="flex items-center justify-center mt-2 gap-2">
                <button onClick={() => onCurrentChange(Math.max(0, current - 1))} className="btn-interactive w-8 h-8 rounded-full bg-stone-700 hover:bg-stone-600 text-white">-</button>
                <input
                    type="number"
                    value={current}
                    onChange={(e) => onCurrentChange(Math.max(0, Math.min(total, parseInt(e.target.value) || 0)))}
                    className="w-16 text-center border border-stone-600 rounded-md"
                    style={inputStyle}
                />
                <button onClick={() => onCurrentChange(Math.min(total, current + 1))} className="btn-interactive w-8 h-8 rounded-full bg-stone-700 hover:bg-stone-600 text-white">+</button>
            </div>
            <div className="text-center text-xs opacity-70 mt-2">
                Regeneração: {regeneration}/turno
            </div>
        </div>
    );
};

export const ResourceBars: React.FC<ResourceBarsProps> = ({ ficha, onUpdate, isGmMode, onGmUpdate }) => {
    const baseVidaTotal = Math.ceil(50 + (ficha.constituicao * (3 + Math.floor(ficha.forca / 10))) + 10 * ficha.nivel);
    const baseMagiaTotal = Math.ceil(20 + 3 * ficha.constituicao + (ficha.inteligencia >= 10 ? ficha.constituicao * Math.floor(ficha.inteligencia / 10) : 0));
    const baseVigorTotal = parseFloat((10 + 0.4 * ficha.constituicao).toFixed(1));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResourceBar
                label="Vida"
                icon="❤️"
                current={ficha.vidaAtual}
                total={ficha.vidaTotal}
                baseTotal={baseVidaTotal}
                regeneration={ficha.regeneracaoVida}
                color="bg-red-500"
                onCurrentChange={(val) => onUpdate({vidaAtual: val})}
                totalKey="vidaTotal"
                isGmMode={isGmMode}
                onGmUpdate={onGmUpdate}
            />
            <ResourceBar
                label="Magia"
                icon="✨"
                current={ficha.magiaAtual}
                total={ficha.magiaTotal}
                baseTotal={baseMagiaTotal}
                regeneration={ficha.regeneracaoMagia}
                color="bg-blue-500"
                onCurrentChange={(val) => onUpdate({magiaAtual: val})}
                totalKey="magiaTotal"
                isGmMode={isGmMode}
                onGmUpdate={onGmUpdate}
            />
            <ResourceBar
                label="Vigor"
                icon="⚡"
                current={ficha.vigorAtual}
                total={ficha.vigorTotal}
                baseTotal={baseVigorTotal}
                regeneration={ficha.regeneracaoVigor}
                color="bg-yellow-500"
                onCurrentChange={(val) => onUpdate({vigorAtual: val})}
                totalKey="vigorTotal"
                isGmMode={isGmMode}
                onGmUpdate={onGmUpdate}
            />
        </div>
    );
};