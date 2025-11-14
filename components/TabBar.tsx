import React from 'react';
import { DiceRoller } from './DiceRoller';
import type { Ficha, DiceRoll } from '../types';

interface TabBarProps {
    activeTab: string;
    onTabClick: (tab: string) => void;
    onRoll: (max: number) => DiceRoll;
    selectedAttribute: string | null;
    ficha: Ficha;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabClick, onRoll, selectedAttribute, ficha }) => {
    const tabs = [
        { id: 'principal', icon: '🛡️', label: 'Principal' },
        { id: 'atributos', icon: '💪', label: 'Atributos' },
        { id: 'inventario', icon: '🎒', label: 'Inventário' },
        { id: 'habilidades', icon: '✨', label: 'Habilidades' },
        { id: 'perfil', icon: '👤', label: 'Perfil' },
    ];

    const navItems = tabs.map(tab => (
        <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`flex flex-col items-center justify-center pt-2 pb-1 w-full text-xs transition-colors duration-200`}
            style={{ 
                color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-color)', 
                opacity: activeTab !== tab.id ? 0.7 : 1,
            }}
            aria-label={tab.label}
        >
            <span className="text-2xl">{tab.icon}</span>
            <span className="mt-1">{tab.label}</span>
            {activeTab === tab.id && <div className="w-10 h-1 rounded-full mt-1" style={{ backgroundColor: 'var(--accent-color)' }}></div>}
        </button>
    ));

    const diceRollerItem = (
        <div key="dice-roller-tab" className="flex flex-col items-center justify-center pt-2 pb-1 w-full text-xs">
            <DiceRoller
                onRoll={onRoll}
                selectedAttribute={selectedAttribute}
                ficha={ficha}
                positionClass="relative"
                isDraggable={false}
                buttonClass={`btn-interactive text-2xl`}
            />
            <span className="mt-1" style={{ 
                color: 'var(--text-color)', 
                opacity: 0.7,
            }}>Dados</span>
            <div className="w-10 h-1 rounded-full mt-1 bg-transparent"></div>
        </div>
    );
    
    navItems.splice(2, 0, diceRollerItem);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-700 flex justify-around items-center sm:hidden z-20" style={{ backgroundColor: 'var(--sheet-bg-color)', borderColor: 'var(--border-color)'}}>
            {navItems}
        </div>
    );
};