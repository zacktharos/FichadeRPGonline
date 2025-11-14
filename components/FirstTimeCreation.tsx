import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Ficha } from '../types';
import { FICHA_MATRIZ_ID } from '../constants';

interface FirstTimeCreationProps {
  fichas: Record<string, Ficha>;
  onFichaCreate: (name: string) => void;
  onFichaSelect: (id: string) => void;
}

export const FirstTimeCreation: React.FC<FirstTimeCreationProps> = ({ fichas, onFichaCreate, onFichaSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFichaName, setNewFichaName] = useState('');

  const handleCreateClick = () => {
    if (newFichaName.trim()) {
      onFichaCreate(newFichaName.trim());
    }
  };

  const handleSelectClick = (id: string) => {
    onFichaSelect(id);
  };

  // FIX: Explicitly type `f` as `Ficha` to resolve TypeScript's inability to infer the type from `Object.values`. This fixes all related property access errors.
  const existingFichas = Object.values(fichas).filter((f: Ficha) => f.id !== FICHA_MATRIZ_ID);

  return (
    <div className="first-time-container fixed inset-0 bg-gradient-to-b from-stone-900 to-black flex flex-col items-center justify-center p-4">
      <div 
        className="fire-plus text-9xl text-yellow-300 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        +
      </div>
      <h1 className="creation-title mt-4 text-3xl text-amber-500 font-medieval text-center pointer-events-none">
        Dê vida ao seu Personagem
      </h1>

      {isModalOpen && (
        <Modal 
          title="Bem-vindo" 
          onClose={() => setIsModalOpen(false)}
          contentClassName="creation-modal-content"
        >
          <div className="space-y-6">
            {/* Creation Section */}
            <div>
              <h2 className="text-xl font-medieval mb-2" style={{ color: '#f59e0b' }}>Criar Nova Ficha</h2>
              <div className="flex gap-2">
                <input
                  id="fichaName"
                  type="text"
                  value={newFichaName}
                  onChange={(e) => setNewFichaName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateClick()}
                  placeholder="Nome da Ficha"
                  className="w-full p-2 border rounded"
                  autoFocus
                />
                <button onClick={handleCreateClick} className="btn-interactive px-4 py-2 rounded">Criar</button>
              </div>
            </div>

            {/* Selection Section */}
            {existingFichas.length > 0 && (
              <div>
                <h2 className="text-xl font-medieval mb-2" style={{ color: '#f59e0b' }}>Selecione seu personagem</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {/* FIX: Explicitly type `ficha` as `Ficha` to resolve property access errors on type `unknown`. */}
                  {existingFichas.map((ficha: Ficha) => (
                    <button
                      key={ficha.id}
                      onClick={() => handleSelectClick(ficha.id)}
                      className="btn-interactive w-full text-left p-3 rounded transition-colors"
                      style={{ backgroundColor: '#3f3223', borderColor: '#6d583c', color: '#f0e6d2' }}
                    >
                      {ficha.nomeFicha}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};