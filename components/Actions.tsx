import React from 'react';

interface ActionsProps {
    onResetPontos: () => void;
    onRecomecar: () => void;
    onRequestDelete: () => void;
}

export const Actions: React.FC<ActionsProps> = ({ onResetPontos, onRecomecar, onRequestDelete }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button onClick={onResetPontos} className="btn-interactive py-2 px-4 bg-yellow-800 hover:bg-yellow-700 rounded-md text-white">
                Reiniciar Pontos
            </button>
            <button onClick={onRecomecar} className="btn-interactive py-2 px-4 bg-orange-800 hover:bg-orange-700 rounded-md text-white">
                Recomeçar Ficha
            </button>
            <button onClick={onRequestDelete} className="btn-interactive py-2 px-4 bg-red-800 hover:bg-red-700 rounded-md text-white">
                Excluir Ficha
            </button>
        </div>
    );
};
