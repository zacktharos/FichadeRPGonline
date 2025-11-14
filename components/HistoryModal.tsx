
import React from 'react';
import type { DiceRoll } from '../types';
import { Modal } from './Modal';

interface HistoryModalProps {
    history: DiceRoll[];
    onRequestClear: () => void;
    onClose: () => void;
}

const diceRollerAttributeLabels: Record<string, string> = {
    forca: 'Força', destreza: 'Destreza', agilidade: 'Agilidade', constituicao: 'Constituição', inteligencia: 'Inteligência',
    ataque: "Ataque", ataqueMagico: "Ataque Mágico", acerto: "Acerto", esquiva: "Esquiva", rdf: "RDF", rdm: "RDM",
    velocidadeCorrida: 'Velocidade', alturaPulo: 'Pulo (Altura)', distanciaPulo: 'Pulo (Dist.)'
};

export const HistoryModal: React.FC<HistoryModalProps> = ({ history, onRequestClear, onClose }) => {
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    return (
        <Modal title="Histórico de Rolagens" onClose={onClose}>
            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2 mb-4">
                {history.length > 0 ? (
                    history.map(roll => (
                        <div key={roll.id} className="p-2 rounded-md" style={{...componentStyle, backgroundColor: `rgba(0,0,0,0.1)`}}>
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-lg">
                                    Total: <span style={{ color: 'var(--accent-color)'}}>{roll.total}</span>
                                </p>
                                <p className="text-xs opacity-60">{roll.timestamp}</p>
                            </div>
                            <p className="opacity-80 text-sm">
                                Rolagem ({roll.type}): {roll.result}
                                {roll.attribute && ` + ${roll.bonus} (${diceRollerAttributeLabels[roll.attribute] || roll.attribute})`}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="opacity-70 text-center py-4">Nenhuma rolagem registrada.</p>
                )}
            </div>
            <div className="flex gap-2 mt-4">
                <button
                    onClick={onClose}
                    className="btn-interactive flex-1 py-2 px-4 bg-stone-600 hover:bg-stone-500 rounded-md text-white"
                >
                    Fechar
                </button>
                <button
                    onClick={onRequestClear}
                    disabled={history.length === 0}
                    className="btn-interactive flex-1 py-2 px-4 bg-red-800 hover:bg-red-700 rounded-md text-white disabled:bg-stone-500 disabled:cursor-not-allowed"
                >
                    Limpar
                </button>
            </div>
        </Modal>
    );
};