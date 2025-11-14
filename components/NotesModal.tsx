import React from 'react';
import { Modal } from './Modal';

interface NotesModalProps {
    notes: string;
    onUpdate: (notes: string) => void;
    onClose: () => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({ notes, onUpdate, onClose }) => {
    return (
        <Modal title="Anotações" onClose={onClose}>
             <textarea
                value={notes}
                onChange={(e) => onUpdate(e.target.value)}
                className="w-full h-64 p-2 border border-stone-600 rounded-md resize-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="Suas anotações aqui..."
                style={{ backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)'}}
            />
            <div className="flex justify-end mt-4">
                 <button
                    onClick={onClose}
                    className="btn-interactive py-2 px-6 bg-amber-800 hover:bg-amber-700 rounded-md text-white"
                >
                    Fechar
                </button>
            </div>
        </Modal>
    );
};