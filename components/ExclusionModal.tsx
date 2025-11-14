import React, { useState } from 'react';
import type { Ficha } from '../types';
import { Modal } from './Modal';

interface ExclusionModalProps {
    ficha: Ficha;
    onClose: () => void;
    onConfirm: (items: { vantagens: string[], desvantagens: string[], removeRaca: boolean, removeClasse: boolean }) => void;
}

export const ExclusionModal: React.FC<ExclusionModalProps> = ({ ficha, onClose, onConfirm }) => {
    const [selectedVantagens, setSelectedVantagens] = useState<string[]>([]);
    const [selectedDesvantagens, setSelectedDesvantagens] = useState<string[]>([]);
    const [removeRaca, setRemoveRaca] = useState<boolean>(false);
    const [removeClasse, setRemoveClasse] = useState<boolean>(false);

    const toggleSelection = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleConfirm = () => {
        if (selectedVantagens.length === 0 && selectedDesvantagens.length === 0 && !removeRaca && !removeClasse) {
            alert("Nenhum item selecionado para exclusão.");
            return;
        }
        onConfirm({
            vantagens: selectedVantagens,
            desvantagens: selectedDesvantagens,
            removeRaca,
            removeClasse,
        });
        onClose();
    };

    const hasItems = ficha.vantagens.length > 0 || ficha.desvantagens.length > 0 || ficha.racaSelecionada || ficha.classeSelecionada;
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <Modal title="Excluir Itens da Ficha" onClose={onClose}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {!hasItems && <p className="opacity-70">O personagem não possui vantagens, desvantagens, raça ou classe para excluir.</p>}
                
                {ficha.vantagens.length > 0 && (
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval">Vantagens</legend>
                        <div className="space-y-2">
                            {ficha.vantagens.map(v => (
                                <label key={v} htmlFor={`v-${v}`} className="flex items-center gap-3 p-2 bg-stone-900/50 rounded cursor-pointer hover:bg-stone-700" style={componentStyle}>
                                    <input
                                        type="checkbox"
                                        id={`v-${v}`}
                                        checked={selectedVantagens.includes(v)}
                                        onChange={() => toggleSelection(selectedVantagens, setSelectedVantagens, v)}
                                        className="w-4 h-4 text-amber-600 bg-stone-700 border-stone-500 rounded focus:ring-amber-500"
                                    />
                                    <span>{v}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                )}

                {ficha.desvantagens.length > 0 && (
                     <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval text-red-400">Desvantagens</legend>
                        <div className="space-y-2">
                            {ficha.desvantagens.map(d => (
                                <label key={d} htmlFor={`d-${d}`} className="flex items-center gap-3 p-2 bg-stone-900/50 rounded cursor-pointer hover:bg-stone-700" style={componentStyle}>
                                    <input
                                        type="checkbox"
                                        id={`d-${d}`}
                                        checked={selectedDesvantagens.includes(d)}
                                        onChange={() => toggleSelection(selectedDesvantagens, setSelectedDesvantagens, d)}
                                         className="w-4 h-4 text-amber-600 bg-stone-700 border-stone-500 rounded focus:ring-amber-500"
                                    />
                                    <span>{d}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                )}
                
                {ficha.racaSelecionada && (
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval text-sky-400">Raça</legend>
                        <label htmlFor="raca" className="flex items-center gap-3 p-2 bg-stone-900/50 rounded cursor-pointer hover:bg-stone-700" style={componentStyle}>
                            <input
                                type="checkbox"
                                id="raca"
                                checked={removeRaca}
                                onChange={() => setRemoveRaca(!removeRaca)}
                                className="w-4 h-4 text-amber-600 bg-stone-700 border-stone-500 rounded focus:ring-amber-500"
                            />
                            <span>{ficha.racaSelecionada}</span>
                        </label>
                    </fieldset>
                )}
                
                {ficha.classeSelecionada && (
                    <fieldset className="border border-stone-600 p-3 rounded-md">
                        <legend className="px-2 font-medieval text-lime-400">Classe</legend>
                        <label htmlFor="classe" className="flex items-center gap-3 p-2 bg-stone-900/50 rounded cursor-pointer hover:bg-stone-700" style={componentStyle}>
                            <input
                                type="checkbox"
                                id="classe"
                                checked={removeClasse}
                                onChange={() => setRemoveClasse(!removeClasse)}
                                className="w-4 h-4 text-amber-600 bg-stone-700 border-stone-500 rounded focus:ring-amber-500"
                            />
                            <span>{ficha.classeSelecionada}</span>
                        </label>
                    </fieldset>
                )}


            </div>
            <div className="mt-6 flex justify-end gap-2">
                <button onClick={onClose} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Cancelar</button>
                <button onClick={handleConfirm} disabled={!hasItems} className="btn-interactive px-4 py-2 bg-red-700 rounded disabled:bg-stone-500 disabled:cursor-not-allowed text-white">Confirmar Exclusão</button>
            </div>
        </Modal>
    );
};
