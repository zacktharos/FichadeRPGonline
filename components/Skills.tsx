import React, { useState } from 'react';
import type { Ficha, Magia } from '../types';
import { Modal } from './Modal';

interface SkillsProps {
    ficha: Ficha;
    onUpdate: (updates: Partial<Ficha>) => void;
    isGmMode: boolean;
}

export const Skills: React.FC<SkillsProps> = ({ ficha, onUpdate, isGmMode }) => {
    const [editingSkillEffect, setEditingSkillEffect] = useState<Magia | null>(null);
    
    const classSkills = ficha.magiasHabilidades.filter(s => s.isClassSkill);
    const regularSkills = ficha.magiasHabilidades.filter(s => !s.isClassSkill);

    const handleSkillChange = (skillToUpdate: Magia, field: keyof Magia, value: string | number) => {
        let updatedSkillInLoop: Magia | null = null;
        const newSkills = ficha.magiasHabilidades.map(s => {
            if (s === skillToUpdate) {
                const updatedSkill = { ...s };
                if ((field === 'custo' || field === 'custoVigor') && typeof value === 'string') {
                    (updatedSkill as any)[field] = parseFloat(value) || 0;
                } else {
                    (updatedSkill as any)[field] = value;
                }
                updatedSkillInLoop = updatedSkill;
                return updatedSkill;
            }
            return s;
        });

        onUpdate({ magiasHabilidades: newSkills });
        
        // If the skill being changed is the one in the modal, update the modal's state too
        if (editingSkillEffect && skillToUpdate === editingSkillEffect && updatedSkillInLoop) {
            setEditingSkillEffect(updatedSkillInLoop);
        }
    };

    const addSkillSlot = () => {
        const newSkills = [...ficha.magiasHabilidades, { nome: '', custo: 0, custoVigor: 0, dano: '', tipo: '', descricao: '', duracao: '', castingTime: '', cooldown: '', efeitoNegativo: '' }];
        onUpdate({ magiasHabilidades: newSkills });
    };
    
    const removeSkillSlot = (skillToRemove: Magia) => {
        const newSkills = ficha.magiasHabilidades.filter(s => s !== skillToRemove);
        onUpdate({ magiasHabilidades: newSkills });
    };

    const handleCast = (skill: Magia) => {
        let newVida = ficha.vidaAtual;
        let newMagia = ficha.magiaAtual;
        let newVigor = ficha.vigorAtual;

        if (newMagia < skill.custo) {
            alert("Magia insuficiente!");
            return;
        }
        if (newVigor < skill.custoVigor) {
            alert("Vigor insuficiente!");
            return;
        }

        newMagia -= skill.custo;
        newVigor -= skill.custoVigor;
        
        if (skill.tipo === 'cura') {
            const healAmount = parseInt(skill.dano) || 0;
            newVida = Math.min(ficha.vidaTotal, newVida + healAmount);
        }

        onUpdate({
            vidaAtual: newVida,
            magiaAtual: newMagia,
            vigorAtual: newVigor,
        });
    }

    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    const inputStyle = { backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)' };
    
    const renderSkillList = (skills: Magia[], isClassSkill: boolean) => (
        <div className="space-y-3">
            {skills.map((skill, index) => (
                <div key={`${isClassSkill}-${skill.nome}-${index}`} className="p-3 rounded-lg border border-stone-700" style={componentStyle}>
                    <div className="flex items-center gap-2 mb-2">
                         <input
                            type="text"
                            placeholder="Nome da Habilidade"
                            value={skill.nome}
                            onChange={(e) => handleSkillChange(skill, 'nome', e.target.value)}
                            disabled={isClassSkill && !isGmMode}
                            className="flex-grow p-2 border border-stone-600 rounded-md font-bold disabled:bg-stone-800 disabled:opacity-70"
                            style={inputStyle}
                        />
                        {!isClassSkill && (
                            <button onClick={() => removeSkillSlot(skill)} className="btn-interactive w-8 h-8 rounded-md bg-red-800 hover:bg-red-700 text-white flex-shrink-0">-</button>
                        )}
                    </div>
                    
                    {isClassSkill && skill.descricao && (
                        <p className="text-sm opacity-80 mb-2 italic">{skill.descricao}</p>
                    )}

                    {!isClassSkill && (
                        <textarea
                            placeholder="Descrição da habilidade..."
                            value={skill.descricao || ''}
                            onChange={(e) => handleSkillChange(skill, 'descricao', e.target.value)}
                            className="w-full p-2 mb-2 border border-stone-600 rounded-md text-sm resize-none"
                            rows={2}
                            style={inputStyle}
                        />
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                        <div className="flex items-center gap-1 p-2 border border-stone-600 rounded-md">
                            <span title="Custo de Magia">✨</span>
                            <input
                                type="number"
                                placeholder="MP"
                                value={skill.custo}
                                onChange={(e) => handleSkillChange(skill, 'custo', e.target.value)}
                                disabled={isClassSkill && !isGmMode}
                                className="w-full bg-transparent border-none focus:ring-0 disabled:bg-transparent disabled:opacity-70"
                                style={{ color: 'var(--text-color)' }}
                            />
                        </div>
                         <div className="flex items-center gap-1 p-2 border border-stone-600 rounded-md">
                             <span title="Custo de Vigor">⚡</span>
                             <input
                                type="number"
                                placeholder="Vigor"
                                value={skill.custoVigor}
                                step="0.1"
                                onChange={(e) => handleSkillChange(skill, 'custoVigor', e.target.value)}
                                disabled={isClassSkill && !isGmMode}
                                className="w-full bg-transparent border-none focus:ring-0 disabled:bg-transparent disabled:opacity-70"
                                style={{ color: 'var(--text-color)' }}
                            />
                        </div>
                        <div className="relative p-2 border border-stone-600 rounded-md col-span-2 sm:col-span-1 flex items-center justify-between">
                            <p className="text-sm truncate pr-8">{skill.dano || 'Dano/Efeito'}</p>
                            <button
                                onClick={() => setEditingSkillEffect(skill)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-xs btn-interactive border hover:brightness-95"
                                style={{
                                    backgroundColor: 'var(--component-bg-color)',
                                    color: 'var(--text-color)',
                                    borderColor: 'var(--border-color)'
                                }}
                                title="Expandir Dano/Efeito"
                            >
                                ...
                            </button>
                        </div>
                        <select
                            value={skill.tipo}
                            onChange={(e) => handleSkillChange(skill, 'tipo', e.target.value)}
                            disabled={isClassSkill && !isGmMode}
                            className="p-2 border border-stone-600 rounded-md disabled:bg-stone-800 disabled:opacity-70"
                            style={inputStyle}
                        >
                            <option value="">Tipo...</option>
                            <option value="dano">Dano</option>
                            <option value="cura">Cura</option>
                            <option value="buff">Buff</option>
                            <option value="debuff">Debuff</option>
                            <option value="utilidade">Utilidade</option>
                        </select>
                         <button onClick={() => handleCast(skill)} className="btn-interactive p-2 bg-amber-700 rounded-md hover:bg-amber-600 text-xs text-white">Lançar</button>
                    </div>

                    {isClassSkill && (
                        <div className="mt-2 pt-2 border-t border-stone-600 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                            {skill.duracao && skill.duracao !== "N/A" && <div><strong>Duração:</strong> {skill.duracao}</div>}
                            {skill.castingTime && skill.castingTime !== "N/A" && <div><strong>Casting:</strong> {skill.castingTime}</div>}
                            {skill.cooldown && skill.cooldown !== "N/A" && <div><strong>Cooldown:</strong> {skill.cooldown}</div>}
                            {skill.efeitoNegativo && skill.efeitoNegativo !== "N/A" && <div className="col-span-2"><strong>Efeito Negativo:</strong> {skill.efeitoNegativo}</div>}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-4 max-h-96 overflow-y-auto overflow-x-hidden pr-2">
            {classSkills.length > 0 && (
                <div>
                    <h3 className="font-medieval text-lg mb-2">Habilidades de Classe</h3>
                    {renderSkillList(classSkills, true)}
                </div>
            )}
            
            <div>
                <h3 className="font-medieval text-lg mb-2">Magias e Habilidades</h3>
                {renderSkillList(regularSkills, false)}
                <button onClick={addSkillSlot} className="btn-interactive mt-2 w-full py-1 bg-stone-700 hover:bg-stone-600 rounded-md text-sm text-white">Adicionar Habilidade</button>
            </div>
            {editingSkillEffect && (
                <Modal 
                    title={`Editar Dano/Efeito de "${editingSkillEffect.nome || 'Nova Habilidade'}"`} 
                    onClose={() => setEditingSkillEffect(null)}
                >
                    <textarea
                        placeholder="Descreva o dano e os efeitos da habilidade..."
                        value={editingSkillEffect.dano}
                        onChange={(e) => handleSkillChange(editingSkillEffect, 'dano', e.target.value)}
                        disabled={editingSkillEffect.isClassSkill && !isGmMode}
                        className="w-full h-48 p-2 border border-stone-600 rounded-md resize-y disabled:bg-stone-800 disabled:opacity-70"
                        style={inputStyle}
                        autoFocus
                    />
                    <div className="flex justify-end mt-4">
                        <button 
                            onClick={() => setEditingSkillEffect(null)}
                            className="btn-interactive py-2 px-6 bg-amber-800 hover:bg-amber-700 rounded-md text-white"
                        >
                            Fechar
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};