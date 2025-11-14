import React, { useState } from 'react';
import { Modal } from './Modal';

interface NpcGeneratorModalProps {
    onClose: () => void;
    onGenerate: (level: number, archetype: string) => void;
}

export const NpcGeneratorModal: React.FC<NpcGeneratorModalProps> = ({ onClose, onGenerate }) => {
    const [level, setLevel] = useState(0);
    const [archetype, setArchetype] = useState('Ataque');

    const archetypes = ['Ataque', 'Defesa', 'Cura', 'Furtivo', 'Aleatório'];
    
    const componentStyle = { color: 'var(--text-color)'};
    const selectStyle = { backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)'};

    return (
        <Modal title="Gerador de personagem aleatório" onClose={onClose}>
            <div className="space-y-4" style={componentStyle}>
                <div>
                    <label className="block font-bold mb-2">Nível: <span style={{color: 'var(--accent-color)'}}>{level}</span></label>
                    <input
                        type="range"
                        min="0"
                        max="30"
                        value={level}
                        onChange={(e) => setLevel(parseInt(e.target.value))}
                        className="w-full"
                    />
                </div>
                 <div>
                    <label className="block font-bold mb-2">Arquétipo</label>
                    <select value={archetype} onChange={e => setArchetype(e.target.value)} className="w-full p-2 rounded" style={selectStyle}>
                        {archetypes.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div className="pt-4 border-t border-stone-600">
                     <button
                        onClick={() => onGenerate(level, archetype)}
                        className="btn-interactive w-full py-3 bg-amber-700 hover:bg-amber-600 rounded-md font-bold text-white"
                    >
                        Gerar Personagem
                    </button>
                </div>
            </div>
        </Modal>
    );
};