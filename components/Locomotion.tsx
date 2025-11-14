

import React from 'react';
import type { Ficha } from '../types';
import { Tooltip } from './Tooltip';

interface LocomotionProps {
    ficha: Ficha;
    onSelectAttribute: (attribute: string) => void;
    selectedAttribute: string | null;
}

const locomotionTooltips: Record<string, string> = {
    velocidadeCorrida: "Corra como o vento! Sua velocidade base é 25 km/h, e cada 3 pontos em Agilidade te deixam 3 km/h mais rápido. A vantagem 'Combo Físico' te transforma num verdadeiro velocista com +25 km/h!",
    alturaPulo: "Alcance os céus! Você já pula 1 metro, e cada 10 pontos em Força te impulsionam 1 metro mais alto. Com o 'Combo Físico', você ganha +2 metros de altura, superando qualquer obstáculo.",
    distanciaPulo: "Cruze abismos com um salto! Seu pulo básico tem 3 metros. Sua Força e Agilidade (a cada 5 pontos em ambos) te impulsionam mais longe. O 'Combo Físico' adiciona impressionantes 6 metros à sua distância!"
};

const QuestionMarkIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`inline-block w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);

const LocomotionStat: React.FC<{
    label: string;
    value: number;
    unit: string;
    icon: string;
    attrKey: keyof Ficha;
    onSelectAttribute: (attribute: keyof Ficha) => void;
    selectedAttribute: string | null;
}> = ({ label, value, unit, icon, attrKey, onSelectAttribute, selectedAttribute }) => {

    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className="flex justify-between items-center py-2 px-3 bg-stone-900/50 rounded-md" style={componentStyle}>
             <div className="font-bold flex items-center gap-2">
                <span>{icon}</span>
                <span>{label}</span>
                <Tooltip text={locomotionTooltips[attrKey]}>
                    <span className="cursor-help text-xs opacity-70" aria-label={`Explicação para ${label}`}><QuestionMarkIcon /></span>
                </Tooltip>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onSelectAttribute(attrKey)}
                    className={`btn-interactive text-xl opacity-60 hover:opacity-100 ${selectedAttribute === attrKey ? 'dice-selected-glow' : ''}`}
                    title={`Rolar com ${label}`}
                >
                    🎲
                </button>
                <span className="font-bold text-lg">
                    {value}
                    <span className="text-sm opacity-70 ml-1">{unit}</span>
                </span>
            </div>
        </div>
    );
};

export const Locomotion: React.FC<LocomotionProps> = ({ ficha, onSelectAttribute, selectedAttribute }) => {
    return (
        <div className="space-y-2">
            <LocomotionStat 
                label="Velocidade de Corrida"
                value={ficha.velocidadeCorrida}
                unit="km/h"
                icon="🏃‍♂️"
                attrKey="velocidadeCorrida"
                onSelectAttribute={onSelectAttribute}
                selectedAttribute={selectedAttribute}
            />
            <LocomotionStat 
                label="Altura do Pulo"
                value={ficha.alturaPulo}
                unit="m"
                icon="⬆️"
                attrKey="alturaPulo"
                onSelectAttribute={onSelectAttribute}
                selectedAttribute={selectedAttribute}
            />
            <LocomotionStat 
                label="Distância do Pulo"
                value={ficha.distanciaPulo}
                unit="m"
                icon="➡️"
                attrKey="distanciaPulo"
                onSelectAttribute={onSelectAttribute}
                selectedAttribute={selectedAttribute}
            />
        </div>
    );
};