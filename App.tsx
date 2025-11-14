


import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useCharacterSheet } from './hooks/useCharacterSheet';
import { useDynamicStyles } from './hooks/useDynamicStyles';
import type { Ficha } from './types';
import { racasData, classesData, FICHA_MATRIZ_ID } from './constants';

// Component Imports
import { Section } from './components/Section';
import { Header } from './components/Header';
import { ResourceBars } from './components/ResourceBars';
import { Attributes } from './components/Attributes';
import { Combat } from './components/Combat';
import { Inventory } from './components/Inventory';
import { Skills } from './components/Skills';
import { Vitals } from './components/Vitals';
import { Actions } from './components/Actions';
import { Locomotion } from './components/Locomotion';
import { Modal } from './components/Modal';
import { VantagensDesvantagensPanel } from './components/VantagensDesvantagensPanel';
import { RacasPanel } from './components/RacasPanel';
import { ClassesPanel } from './components/ClassesPanel';
import { CustomizationModal } from './components/CustomizationModal';
import { ExclusionModal } from './components/ExclusionModal';
import { NotesModal } from './components/NotesModal';
import { PasswordModal } from './components/PasswordModal';
import { CharacterImage } from './components/CharacterImage';
import { NpcGeneratorModal } from './components/NpcGeneratorModal';
import { TabBar } from './components/TabBar';
import { CompactDerivedStats } from './components/CompactDerivedStats';
import { ClasseHabilidadesModal } from './components/ClasseHabilidadesModal';
import { DiceRoller } from './components/DiceRoller';
import { HistoryModal } from './components/HistoryModal';
import { FirstTimeCreation } from './components/FirstTimeCreation';
import { LockManagementModal } from './components/LockManagementModal';

// --- Multi Delete Modal Component ---
interface MultiDeleteModalProps {
    fichas: Record<string, Ficha>;
    onClose: () => void;
    onConfirm: (ids: string[]) => void;
}

const MultiDeleteModal: React.FC<MultiDeleteModalProps> = ({ fichas, onClose, onConfirm }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleToggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleConfirmClick = () => {
        onConfirm(selectedIds);
    };

    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };
    // FIX: Explicitly type `f` as `Ficha` to resolve TypeScript's inability to infer the type from `Object.values`.
    const fichasToList = Object.values(fichas).filter((f: Ficha) => f.id !== FICHA_MATRIZ_ID);

    return (
        <Modal title="Selecionar Fichas para Excluir" onClose={onClose}>
            <p className="mb-4">Selecione uma ou mais fichas que você deseja excluir permanentemente.</p>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 border-y border-stone-600 py-2">
                {fichasToList.length > 0 ? (
                    fichasToList.map((ficha: Ficha) => (
                        <label key={ficha.id} htmlFor={`del-${ficha.id}`} className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-stone-700" style={componentStyle}>
                            <input
                                type="checkbox"
                                id={`del-${ficha.id}`}
                                checked={selectedIds.includes(ficha.id)}
                                onChange={() => handleToggleSelection(ficha.id)}
                                className="w-5 h-5 text-amber-600 bg-stone-700 border-stone-500 rounded focus:ring-amber-500 focus:ring-2"
                            />
                            <span>{ficha.nomeFicha}</span>
                        </label>
                    ))
                ) : (
                    <p className="text-center opacity-70">Nenhuma ficha para excluir.</p>
                )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <button onClick={onClose} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Cancelar</button>
                <button
                    onClick={handleConfirmClick}
                    disabled={selectedIds.length === 0}
                    className="btn-interactive px-4 py-2 bg-red-700 rounded disabled:bg-stone-500 disabled:cursor-not-allowed text-white"
                >
                    Excluir ({selectedIds.length})
                </button>
            </div>
        </Modal>
    );
};


const App: React.FC = () => {
    const {
        fichas,
        currentFicha,
        currentFichaId,
        switchFicha,
        updateFicha,
        createFicha,
        deleteFichas,
        importFicha,
        generateNpc,
        resetPontos,
        recomecarFicha,
        resetAesthetics,
        calcularAtributos,
        getPontosVantagem,
        passwordRequest,
        setPasswordRequest,
        closePasswordRequest,
        excludeItems,
        isGmMode,
        toggleGmMode,
        updateGmAdjustment,
        levelUpEffect,
        resetClasseNotification,
        rollDice,
        clearDiceHistory,
        selectedAttribute,
        setSelectedAttribute,
        generatedNpcInfo,
        clearGeneratedNpcInfo,
        lockFicha,
        unlockFicha,
    } = useCharacterSheet();

    useDynamicStyles(currentFicha);
    
    const tabsOrder = useMemo(() => ['principal', 'atributos', 'inventario', 'habilidades', 'perfil'], []);
    const [activeTab, setActiveTab] = useState('principal');
    const [tabAnimationClass, setTabAnimationClass] = useState('animate-tab-enter');
    const prevTabIndexRef = useRef(tabsOrder.indexOf('principal'));

    const [isVantagensPanelOpen, setVantagensPanelOpen] = useState(false);
    const [isRacasPanelOpen, setRacasPanelOpen] = useState(false);
    const [isClassesPanelOpen, setClassesPanelOpen] = useState(false);
    const [isClasseHabilidadesModalOpen, setClasseHabilidadesModalOpen] = useState(false);
    const [isNewFichaModalOpen, setNewFichaModalOpen] = useState(false);
    const [isCustomizationOpen, setCustomizationOpen] = useState(false);
    const [isExclusionModalOpen, setExclusionModalOpen] = useState(false);
    const [isNotesModalOpen, setNotesModalOpen] = useState(false);
    const [isMultiDeleteModalOpen, setMultiDeleteModalOpen] = useState(false);
    const [isConfirmRecomecarOpen, setConfirmRecomecarOpen] = useState(false);
    const [isNpcGeneratorOpen, setNpcGeneratorOpen] = useState(false);
    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
    const [isLockManagementOpen, setLockManagementOpen] = useState(false);
    
    // Lock management state
    const [isPasswordVerifyOpen, setPasswordVerifyOpen] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState<{ type: 'single' | 'bulk', payload: any } | null>(null);
    const [unlockedFichaIds, setUnlockedFichaIds] = useState<Set<string>>(new Set());


    const [newFichaName, setNewFichaName] = useState('');
    const [animatingFichaId, setAnimatingFichaId] = useState<string | null>(null);
    const [sheetSwitchAnimation, setSheetSwitchAnimation] = useState('');
    const animationTimerRef = useRef<number | null>(null);


    const sectionTitles = useMemo(() => ['Informações Básicas', 'Recursos', 'Atributos', 'Combate', 'Inventário', 'Habilidades', 'Vantagens e Desvantagens', 'Raça e Classe', 'Locomoção', 'Status'], []);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    const areAllSectionsExpanded = useMemo(() => sectionTitles.every(title => openSections[title]), [openSections, sectionTitles]);

    useEffect(() => {
        const initialOpenState: Record<string, boolean> = {};
        sectionTitles.forEach(title => {
            initialOpenState[title] = title === 'Informações Básicas'; // Default open
        });
        setOpenSections(initialOpenState);
    }, [currentFichaId, sectionTitles]);

    const handleToggleSection = (title: string) => {
        setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const handleToggleAllSections = () => {
        const nextState = !areAllSectionsExpanded;
        const newOpenState: Record<string, boolean> = {};
        sectionTitles.forEach(title => {
            newOpenState[title] = nextState;
        });
        setOpenSections(newOpenState);
    };

    const handleUpdate = useCallback(<K extends keyof Ficha>(key: K, value: Ficha[K]) => {
        const isSheetUnlockedForSession = unlockedFichaIds.has(currentFichaId!);
        if (currentFicha?.isLocked && !isSheetUnlockedForSession) {
            setPendingUpdate({ type: 'single', payload: { key, value } });
            setPasswordVerifyOpen(true);
        } else if (currentFicha) {
            updateFicha(currentFichaId!, { [key]: value });
        }
    }, [currentFicha, currentFichaId, updateFicha, unlockedFichaIds]);

    const handleBulkUpdate = useCallback((updates: Partial<Ficha>) => {
        const isSheetUnlockedForSession = unlockedFichaIds.has(currentFichaId!);
        if (currentFicha?.isLocked && !isSheetUnlockedForSession) {
            setPendingUpdate({ type: 'bulk', payload: updates });
            setPasswordVerifyOpen(true);
        } else if (currentFicha) {
            updateFicha(currentFichaId!, updates);
        }
    }, [currentFicha, currentFichaId, updateFicha, unlockedFichaIds]);

    const handleVerificationSuccess = useCallback(() => {
        if (currentFichaId) {
            setUnlockedFichaIds(prev => new Set(prev).add(currentFichaId));
        }
        if (pendingUpdate && currentFichaId) {
            if (pendingUpdate.type === 'single') {
                const { key, value } = pendingUpdate.payload;
                updateFicha(currentFichaId, { [key]: value });
            } else { // bulk
                updateFicha(currentFichaId, pendingUpdate.payload);
            }
            setPendingUpdate(null);
        }
        setPasswordVerifyOpen(false);
    }, [currentFichaId, pendingUpdate, updateFicha]);

    useEffect(() => {
      if (currentFicha?.showClasseSkillsNotification) {
          setClasseHabilidadesModalOpen(true);
      }
    }, [currentFicha?.showClasseSkillsNotification]);

    useEffect(() => {
        if (animatingFichaId) {
            // Only start a new timer if one isn't already running.
            // This prevents the timer from resetting when the ID changes from temp to real.
            if (animationTimerRef.current === null) {
                animationTimerRef.current = window.setTimeout(() => {
                    setAnimatingFichaId(null);
                    animationTimerRef.current = null; // Clear the ref after timer finishes
                }, 4000); // Duração da animação
            }
        } else {
            // If animatingFichaId becomes null for any reason, ensure the timer is cleared.
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
                animationTimerRef.current = null;
            }
        }

        // Cleanup on unmount
        return () => {
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
            }
        };
    }, [animatingFichaId]);
    
    useEffect(() => {
        if (generatedNpcInfo) {
            const timer = setTimeout(() => {
                clearGeneratedNpcInfo();
            }, 3000); // Duração da animação de invocação
            return () => clearTimeout(timer);
        }
    }, [generatedNpcInfo, clearGeneratedNpcInfo]);
    
    const handleTabClick = useCallback((newTab: string) => {
        const oldIndex = prevTabIndexRef.current;
        const newIndex = tabsOrder.indexOf(newTab);

        if (newIndex === oldIndex) return;

        if (newIndex > oldIndex) {
            setTabAnimationClass('animate-slide-in-right');
        } else {
            setTabAnimationClass('animate-slide-in-left');
        }
        
        prevTabIndexRef.current = newIndex;
        setActiveTab(newTab);
    }, [tabsOrder]);

    const handleSwitchFicha = useCallback((newId: string) => {
        if (newId === currentFichaId || sheetSwitchAnimation) return;

        setAnimatingFichaId(null); // Cancela a animação longa se estiver ativa

        setSheetSwitchAnimation('sheet-slide-out');

        setTimeout(() => {
            switchFicha(newId);
        }, 300); // Duração da animação de saída
    }, [currentFichaId, switchFicha, sheetSwitchAnimation]);

    useEffect(() => {
        if (sheetSwitchAnimation === 'sheet-slide-out') {
            setSheetSwitchAnimation('sheet-grow-in');
            
            const timer = setTimeout(() => {
                setSheetSwitchAnimation('');
            }, 300); // Duração da animação de entrada

            return () => clearTimeout(timer);
        }
    }, [currentFichaId]);


    const handleCreateAndAnimateFicha = (name: string) => {
        const result = createFicha(name);
        if (result) {
            const { tempId, promise } = result;
            setAnimatingFichaId(tempId);
            promise.then(realId => {
                if (realId) {
                    // Swap the animation target to the real ID without resetting the timer
                    setAnimatingFichaId(currentAnimId => (currentAnimId === tempId ? realId : currentAnimId));
                }
            });
        }
    };
    
    const handleSelectAndAnimate = (id: string) => {
        switchFicha(id);
        setAnimatingFichaId(id);
    };

    const createFichaWithSwitchAnimation = (name: string) => {
        setAnimatingFichaId(null); // Cancela a animação longa se estiver ativa
        setSheetSwitchAnimation('sheet-slide-out');
        setTimeout(() => {
            // createFicha will handle setting the current ID
            const result = createFicha(name);
            if (!result) {
                // If creation failed for some reason, reset animation
                setSheetSwitchAnimation('');
            }
        }, 300); // Match the slide-out duration
    };

    const handleCreateFichaFromHeader = () => {
        if (newFichaName.trim()) {
            createFichaWithSwitchAnimation(newFichaName.trim());
            setNewFichaName('');
            setNewFichaModalOpen(false);
        }
    };
    
    const handleExportFicha = useCallback(() => {
        if (!currentFicha) return;
        try {
            const fichaJson = JSON.stringify(currentFicha, null, 2);
            const blob = new Blob([fichaJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = (currentFicha.nomePersonagem || currentFicha.nomeFicha || 'ficha_rpg').trim().replace(/\s+/g, '_');
            a.download = `${fileName}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export ficha", error);
            alert("Ocorreu um erro ao exportar a ficha.");
        }
    }, [currentFicha]);

    const handleImportFicha = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const text = event.target?.result;
                    if (typeof text !== 'string') throw new Error("File content is not a string.");
                    
                    const importedFichaData = JSON.parse(text);

                    if (typeof importedFichaData !== 'object' || importedFichaData === null || !('nomeFicha' in importedFichaData)) {
                        throw new Error("Invalid ficha file format.");
                    }
                    importFicha(importedFichaData);
                } catch (error) {
                    console.error("Failed to import ficha", error);
                    alert("Falha ao importar ficha. O arquivo pode estar corrompido ou em formato inválido.");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, [importFicha]);

    const handleGenerateNpc = (level: number, archetype: string) => {
        generateNpc(level, archetype);
        setNpcGeneratorOpen(false);
    };

    const handleRequestDelete = () => {
        setPasswordRequest(() => () => setMultiDeleteModalOpen(true));
    };

    const handleMultiDeleteConfirm = (ids: string[]) => {
        deleteFichas(ids);
        setMultiDeleteModalOpen(false);
    };

    const openExclusionModal = () => {
        setPasswordRequest(() => () => setExclusionModalOpen(true));
    };

    if (Object.keys(fichas).length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-stone-900 text-white">
                <p>Carregando...</p>
            </div>
        );
    }
    
    if (!currentFichaId || !currentFicha) {
        return <FirstTimeCreation
            fichas={fichas}
            onFichaCreate={handleCreateAndAnimateFicha}
            onFichaSelect={handleSelectAndAnimate}
        />;
    }
    
    const selectedRacaData = currentFicha.racaSelecionada ? racasData.find(r => r.nome === currentFicha.racaSelecionada) : null;
    const selectedClasseData = currentFicha.classeSelecionada ? classesData.find(c => c.nome === currentFicha.classeSelecionada) : null;
    const almasDisponiveis = currentFicha.almasTotais - currentFicha.almasGastas;
    
    const appClasses = `${currentFicha.darkMode ? 'dark-mode' : 'light-mode'} ${currentFicha.theme}`;
    const componentStyle = { backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)' };
    const isAnimating = animatingFichaId === currentFichaId;
    const isNpcSpawning = generatedNpcInfo?.id === currentFichaId;

    return (
        <div className={appClasses}>
            <div id="character-sheet-container" className={`relative max-w-2xl mx-auto sm:rounded-xl shadow-2xl shadow-black/50 overflow-hidden sm:my-4 ${levelUpEffect ? 'level-up-glow' : ''} ${isAnimating ? 'magical-aura-spawn' : ''} ${isNpcSpawning ? 'npc-spawn-ripple' : ''} ${sheetSwitchAnimation}`} style={{
                backgroundColor: 'var(--sheet-bg-color)',
                opacity: currentFicha.sheetOpacity / 100,
                borderWidth: `var(--border-width)`,
                borderStyle: `var(--border-style)`,
                borderColor: `var(--border-color)`,
                boxShadow: `var(--sheet-shadow)`,
            }}>
                <Header 
                    fichas={fichas}
                    currentFicha={currentFicha}
                    currentFichaId={currentFichaId}
                    switchFicha={handleSwitchFicha}
                    nomePersonagem={currentFicha.nomePersonagem}
                    nomeFicha={currentFicha.nomeFicha}
                    nivel={currentFicha.nivel}
                    levelUpEffect={levelUpEffect}
                    handleUpdate={handleUpdate}
                    onNewFicha={() => setNewFichaModalOpen(true)}
                    isGmMode={isGmMode}
                    onToggleGmMode={toggleGmMode}
                    onImport={handleImportFicha}
                    onExport={handleExportFicha}
                    onOpenNpcGenerator={() => setNpcGeneratorOpen(true)}
                    onToggleAllSections={handleToggleAllSections}
                    areAllSectionsExpanded={areAllSectionsExpanded}
                    onLockClick={() => setLockManagementOpen(true)}
                />
                
                <main className="p-2 sm:p-4">
                    {/* ======== DESKTOP VIEW ======== */}
                    <div className="hidden sm:space-y-4 sm:block">
                        <Section title="Informações Básicas" isOpen={openSections['Informações Básicas']} onToggle={() => handleToggleSection('Informações Básicas')}>
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <textarea
                                    id="descricao-personagem"
                                    placeholder="Descrição do seu personagem"
                                    value={currentFicha.descricaoPersonagem}
                                    onChange={(e) => handleUpdate('descricaoPersonagem', e.target.value)}
                                    className="w-full flex-grow p-2 border border-stone-600 rounded-md h-40 resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    style={componentStyle}
                                />
                                <CharacterImage
                                    image={currentFicha.characterImage}
                                    onUpdate={(img) => handleUpdate('characterImage', img)}
                                />
                            </div>
                        </Section>

                        <Section title="Recursos" isOpen={openSections['Recursos']} onToggle={() => handleToggleSection('Recursos')}>
                            <ResourceBars 
                                ficha={currentFicha} 
                                onUpdate={handleBulkUpdate} 
                                isGmMode={isGmMode}
                                onGmUpdate={updateGmAdjustment}
                            />
                        </Section>

                        <Section title="Atributos" isOpen={openSections['Atributos']} onToggle={() => handleToggleSection('Atributos')}>
                            <Attributes 
                                ficha={currentFicha}
                                onBulkUpdate={handleBulkUpdate}
                                isGmMode={isGmMode}
                                onGmUpdate={updateGmAdjustment}
                                onSelectAttribute={setSelectedAttribute}
                                selectedAttribute={selectedAttribute}
                            />
                        </Section>
                        
                        <Section title="Combate" isOpen={openSections['Combate']} onToggle={() => handleToggleSection('Combate')}>
                            <Combat 
                                ficha={currentFicha} 
                                onUpdate={handleUpdate} 
                                onRecalculate={calcularAtributos} 
                                isGmMode={isGmMode}
                                onGmUpdate={updateGmAdjustment}
                            />
                        </Section>

                        <Section title="Inventário" isOpen={openSections['Inventário']} onToggle={() => handleToggleSection('Inventário')}>
                            <Inventory ficha={currentFicha} onUpdate={handleUpdate} onRecalculate={calcularAtributos}/>
                        </Section>

                        <Section title="Habilidades" isOpen={openSections['Habilidades']} onToggle={() => handleToggleSection('Habilidades')}>
                            <Skills ficha={currentFicha} onUpdate={handleBulkUpdate} isGmMode={isGmMode} />
                        </Section>

                        <Section title="Vantagens e Desvantagens" isOpen={openSections['Vantagens e Desvantagens']} onToggle={() => handleToggleSection('Vantagens e Desvantagens')}>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold" style={{ color: 'var(--accent-color)' }}>Vantagens</h3>
                                    <div className="p-2 rounded-md min-h-[4rem] space-y-1" style={componentStyle}>
                                        {currentFicha.vantagens.length > 0 ? (
                                            currentFicha.vantagens.map(v => 
                                                <div key={v} className="text-sm p-1 rounded" style={{...componentStyle, backgroundColor: `rgba(0,0,0,0.1)`}}>
                                                    <span>{v}</span>
                                                </div>
                                            )
                                        ) : <p className="text-sm opacity-70 italic">Nenhuma vantagem selecionada.</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-500">Desvantagens</h3>
                                    <div className="p-2 rounded-md min-h-[4rem] space-y-1" style={componentStyle}>
                                        {currentFicha.desvantagens.length > 0 ? (
                                            currentFicha.desvantagens.map(d => 
                                                <div key={d} className="text-sm p-1 rounded" style={{...componentStyle, backgroundColor: `rgba(0,0,0,0.1)`}}>
                                                    <span>{d}</span>
                                                </div>
                                            )
                                        ) : <p className="text-sm opacity-70 italic">Nenhuma desvantagem selecionada.</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setVantagensPanelOpen(true)} className="btn-interactive py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white">Gerenciar</button>
                                    <button onClick={openExclusionModal} className="btn-interactive py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white">Excluir...</button>
                                </div>
                            </div>
                        </Section>

                        <Section title="Raça e Classe" isOpen={openSections['Raça e Classe']} onToggle={() => handleToggleSection('Raça e Classe')}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Raça Card */}
                                <div className="flex flex-col p-4 rounded-lg border" style={{...componentStyle, borderColor: 'var(--border-color)'}}>
                                    <h3 className="text-xl font-medieval mb-2" style={{ color: 'var(--accent-color)' }}>Raça</h3>
                                    <div className="flex-grow p-3 rounded-md min-h-[8rem]" style={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
                                        {selectedRacaData ? (
                                            <>
                                                <h4 className="font-bold text-lg">{selectedRacaData.nome} {currentFicha.subRacaSelecionada ? `(${currentFicha.subRacaSelecionada})` : ''}</h4>
                                                <p className="text-sm opacity-80 mt-1">{selectedRacaData.descricao}</p>
                                            </>
                                        ) : <p className="text-sm opacity-70 italic">Nenhuma raça selecionada.</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                         <button onClick={() => setRacasPanelOpen(true)} className="btn-interactive py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white">Comprar</button>
                                         <button onClick={openExclusionModal} className="btn-interactive py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white" disabled={!currentFicha.racaSelecionada}>Excluir...</button>
                                    </div>
                                </div>
                                 {/* Classe Card */}
                                <div className="flex flex-col p-4 rounded-lg border" style={{...componentStyle, borderColor: 'var(--border-color)'}}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-medieval" style={{ color: 'var(--accent-color)' }}>Classe</h3>
                                        {selectedClasseData && (
                                            <button 
                                                onClick={() => setClasseHabilidadesModalOpen(true)} 
                                                className={almasDisponiveis > 0 ? "soul-indicator-animation" : ""} 
                                                title="Habilidades de Classe (Almas disponíveis!)"
                                            >
                                                <span className="text-2xl">🛍️</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-grow p-3 rounded-md min-h-[8rem]" style={{backgroundColor: 'rgba(0,0,0,0.1)'}}>
                                         {selectedClasseData ? (
                                            <>
                                                <h4 className="font-bold text-lg">{selectedClasseData.nome}</h4>
                                                <p className="text-sm opacity-80 mt-1">{selectedClasseData.descricao}</p>
                                            </>
                                        ) : <p className="text-sm opacity-70 italic">Nenhuma classe selecionada.</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <button onClick={() => setClassesPanelOpen(true)} className="btn-interactive py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white">
                                            Comprar
                                        </button>
                                        <button onClick={openExclusionModal} className="btn-interactive py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white" disabled={!currentFicha.classeSelecionada}>Excluir...</button>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <Section title="Locomoção" isOpen={openSections['Locomoção']} onToggle={() => handleToggleSection('Locomoção')}>
                            <Locomotion 
                                ficha={currentFicha}
                                onSelectAttribute={setSelectedAttribute}
                                selectedAttribute={selectedAttribute}
                            />
                        </Section>
                        
                        <Section title="Status" isOpen={openSections['Status']} onToggle={() => handleToggleSection('Status')}>
                             <Vitals 
                                ficha={currentFicha} 
                                onBulkUpdate={handleBulkUpdate} 
                                pontosVantagemDisponiveis={getPontosVantagem()}
                                isGmMode={isGmMode}
                                onGmUpdate={updateGmAdjustment}
                                levelUpEffect={levelUpEffect}
                            />
                        </Section>

                        <div className="space-y-4 pt-4">
                            <Actions 
                                onResetPontos={resetPontos}
                                onRecomecar={() => setConfirmRecomecarOpen(true)}
                                onRequestDelete={handleRequestDelete}
                            />

                            <div className="flex justify-center items-center gap-4 pt-4">
                                <button onClick={() => setHistoryModalOpen(true)} title="Histórico de Rolagens" className="btn-interactive p-2 w-12 h-12 text-2xl bg-stone-800 text-white rounded-full">📜</button>
                                <button onClick={() => setNotesModalOpen(true)} title="Anotações" className="btn-interactive p-2 w-12 h-12 text-2xl bg-stone-800 text-white rounded-full">📝</button>
                                <button onClick={() => handleUpdate('darkMode', false)} title="Modo Claro" className="btn-interactive p-2 w-12 h-12 text-2xl bg-yellow-400 text-black rounded-full">☀️</button>
                                <button onClick={() => setCustomizationOpen(true)} title="Customizar" className="btn-interactive p-2 w-12 h-12 text-2xl bg-purple-800 hover:bg-purple-700 rounded-md text-white">🎨</button>
                                <button onClick={() => handleUpdate('darkMode', true)} title="Modo Escuro" className="btn-interactive p-2 w-12 h-12 text-2xl bg-indigo-900 text-white rounded-full">🌙</button>
                                <DiceRoller
                                    onRoll={rollDice}
                                    selectedAttribute={selectedAttribute}
                                    ficha={currentFicha}
                                    positionClass="relative z-10"
                                    isDraggable={false}
                                    buttonClass="btn-interactive p-2 w-12 h-12 text-2xl bg-amber-600 text-white rounded-full flex items-center justify-center shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                     {/* ======== MOBILE TAB VIEW ======== */}
                    <div className="sm:hidden space-y-4 pb-20">
                        <div key={activeTab} className={tabAnimationClass}>
                            {activeTab === 'principal' && (
                                <div className="space-y-4">
                                    <Vitals ficha={currentFicha} onBulkUpdate={handleBulkUpdate} pontosVantagemDisponiveis={getPontosVantagem()} isGmMode={isGmMode} onGmUpdate={updateGmAdjustment} levelUpEffect={levelUpEffect} />
                                    <ResourceBars ficha={currentFicha} onUpdate={handleBulkUpdate} isGmMode={isGmMode} onGmUpdate={updateGmAdjustment} />
                                    <CompactDerivedStats ficha={currentFicha} />
                                    <Locomotion ficha={currentFicha} onSelectAttribute={setSelectedAttribute} selectedAttribute={selectedAttribute} />
                                </div>
                            )}
                            {activeTab === 'atributos' && (
                                <Attributes ficha={currentFicha} onBulkUpdate={handleBulkUpdate} isGmMode={isGmMode} onGmUpdate={updateGmAdjustment} onSelectAttribute={setSelectedAttribute} selectedAttribute={selectedAttribute} />
                            )}
                            {activeTab === 'inventario' && (
                                <div className="space-y-4">
                                    <Combat ficha={currentFicha} onUpdate={handleUpdate} onRecalculate={calcularAtributos} isGmMode={isGmMode} onGmUpdate={updateGmAdjustment} />
                                    <Inventory ficha={currentFicha} onUpdate={handleUpdate} onRecalculate={calcularAtributos} />
                                </div>
                            )}
                            {activeTab === 'habilidades' && (
                                <Skills ficha={currentFicha} onUpdate={handleBulkUpdate} isGmMode={isGmMode} />
                            )}
                            {activeTab === 'perfil' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-4 items-center">
                                        <textarea id="descricao-personagem-mobile" placeholder="Descrição do seu personagem" value={currentFicha.descricaoPersonagem} onChange={(e) => handleUpdate('descricaoPersonagem', e.target.value)} className="w-full p-2 border border-stone-600 rounded-md h-24 resize-none" style={componentStyle} />
                                        <CharacterImage image={currentFicha.characterImage} onUpdate={(img) => handleUpdate('characterImage', img)} />
                                    </div>
                                    <div className="p-3 rounded-lg" style={componentStyle}>
                                        <h3 className="font-bold mb-2" style={{ color: 'var(--accent-color)' }}>Vantagens</h3>
                                        {currentFicha.vantagens.length > 0 ? currentFicha.vantagens.map(v => <div key={v} className="text-sm"><span>{v}</span></div>) : <p className="text-sm opacity-70 italic">Nenhuma.</p>}
                                        <h3 className="font-bold text-red-500 mt-2 mb-1">Desvantagens</h3>
                                        {currentFicha.desvantagens.length > 0 ? currentFicha.desvantagens.map(d => <div key={d} className="text-sm"><span>{d}</span></div>) : <p className="text-sm opacity-70 italic">Nenhuma.</p>}
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <button onClick={() => setVantagensPanelOpen(true)} className="btn-interactive py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white text-sm">Gerenciar</button>
                                            <button onClick={openExclusionModal} className="btn-interactive py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white text-sm">Excluir...</button>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg" style={componentStyle}>
                                         <h3 className="font-bold" style={{ color: 'var(--accent-color)' }}>Raça</h3>
                                         {selectedRacaData ? <p className="text-sm opacity-80 mt-1">{selectedRacaData.nome} {currentFicha.subRacaSelecionada ? `(${currentFicha.subRacaSelecionada})` : ''}: {selectedRacaData.descricao}</p> : <p className="text-sm opacity-70 italic">Nenhuma.</p>}
                                         <div className="grid grid-cols-2 gap-2 mt-2">
                                            <button onClick={() => setRacasPanelOpen(true)} className="btn-interactive py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white text-sm">Comprar</button>
                                            <button onClick={openExclusionModal} className="btn-interactive py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white text-sm" disabled={!currentFicha.racaSelecionada}>Excluir...</button>
                                         </div>
                                    </div>
                                    <div className="p-3 rounded-lg" style={componentStyle}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold" style={{ color: 'var(--accent-color)' }}>Classe</h3>
                                            {selectedClasseData && (
                                                <button 
                                                    onClick={() => setClasseHabilidadesModalOpen(true)} 
                                                    className={almasDisponiveis > 0 ? "soul-indicator-animation" : ""} 
                                                    title="Habilidades de Classe (Almas disponíveis!)"
                                                >
                                                    <span className="text-2xl">🛍️</span>
                                                </button>
                                            )}
                                        </div>
                                         {selectedClasseData ? <p className="text-sm opacity-80 mt-1">{selectedClasseData.nome}: {selectedClasseData.descricao}</p> : <p className="text-sm opacity-70 italic">Nenhuma.</p>}
                                         <div className="grid grid-cols-2 gap-2 mt-2">
                                            <button onClick={() => setClassesPanelOpen(true)} className="btn-interactive py-2 px-4 bg-amber-800 hover:bg-amber-700 rounded-md text-white text-sm">
                                                Comprar
                                            </button>
                                            <button onClick={openExclusionModal} className="btn-interactive py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white text-sm" disabled={!currentFicha.classeSelecionada}>Excluir...</button>
                                         </div>
                                    </div>
                                    <Actions onResetPontos={resetPontos} onRecomecar={() => setConfirmRecomecarOpen(true)} onRequestDelete={handleRequestDelete} />
                                    <div className="flex justify-center items-center gap-4 pt-4">
                                        <button onClick={() => setHistoryModalOpen(true)} title="Histórico de Rolagens" className="btn-interactive p-2 w-12 h-12 text-2xl bg-stone-800 text-white rounded-full">📜</button>
                                        <button onClick={() => setNotesModalOpen(true)} title="Anotações" className="btn-interactive p-2 w-12 h-12 text-2xl bg-stone-800 text-white rounded-full">📝</button>
                                        <button onClick={() => handleUpdate('darkMode', false)} title="Modo Claro" className="btn-interactive p-2 w-12 h-12 text-2xl bg-yellow-400 text-black rounded-full">☀️</button>
                                        <button onClick={() => setCustomizationOpen(true)} title="Customizar" className="btn-interactive p-2 w-12 h-12 text-2xl bg-purple-800 hover:bg-purple-700 rounded-md text-white">🎨</button>
                                        <button onClick={() => handleUpdate('darkMode', true)} title="Modo Escuro" className="btn-interactive p-2 w-12 h-12 text-2xl bg-indigo-900 text-white rounded-full">🌙</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </main>
            </div>

            {/* Desktop-only fixed text */}
            <span className={`christ-text hidden sm:block ${levelUpEffect ? 'golden-glow-animation' : ''}`}>
                Cristo Vive!
            </span>

            <TabBar
                activeTab={activeTab}
                onTabClick={handleTabClick}
                onRoll={rollDice}
                selectedAttribute={selectedAttribute}
                ficha={currentFicha}
            />
            
            {isHistoryModalOpen && (
                <HistoryModal
                    history={currentFicha.diceHistory || []}
                    onRequestClear={clearDiceHistory}
                    onClose={() => setHistoryModalOpen(false)}
                />
            )}
            
            {isNotesModalOpen && (
                <NotesModal 
                    notes={currentFicha.anotacoes} 
                    onUpdate={(val) => handleUpdate('anotacoes', val)}
                    onClose={() => setNotesModalOpen(false)}
                />
            )}

            {isVantagensPanelOpen && (
                <VantagensDesvantagensPanel
                    ficha={currentFicha}
                    pontosVantagemDisponiveis={getPontosVantagem()}
                    onBulkUpdate={handleBulkUpdate}
                    onClose={() => setVantagensPanelOpen(false)}
                />
            )}
             {isRacasPanelOpen && (
                <RacasPanel
                    ficha={currentFicha}
                    pontosVantagemDisponiveis={getPontosVantagem()}
                    onUpdate={handleBulkUpdate}
                    onClose={() => setRacasPanelOpen(false)}
                />
            )}
            {isClassesPanelOpen && (
                <ClassesPanel
                    ficha={currentFicha}
                    pontosVantagemDisponiveis={getPontosVantagem()}
                    onUpdate={handleUpdate}
                    onClose={() => setClassesPanelOpen(false)}
                />
            )}
             {isClasseHabilidadesModalOpen && (
                <ClasseHabilidadesModal
                    ficha={currentFicha}
                    pontosVantagemDisponiveis={getPontosVantagem()}
                    onUpdate={handleBulkUpdate}
                    onClose={() => {
                        setClasseHabilidadesModalOpen(false);
                        resetClasseNotification();
                    }}
                    isOpeningAfterLevelUp={currentFicha.showClasseSkillsNotification}
                    isGmMode={isGmMode}
                />
            )}

            {isNewFichaModalOpen && (
                 <Modal title="Criar Nova Ficha" onClose={() => setNewFichaModalOpen(false)}>
                    <input
                        type="text"
                        value={newFichaName}
                        onChange={(e) => setNewFichaName(e.target.value)}
                        placeholder="Nome da Ficha"
                        className="w-full p-2 border rounded border-stone-600"
                        style={{ backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)' }}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setNewFichaModalOpen(false)} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Cancelar</button>
                        <button onClick={handleCreateFichaFromHeader} className="btn-interactive px-4 py-2 bg-amber-700 rounded text-white">Criar</button>
                    </div>
                </Modal>
            )}
            {isNpcGeneratorOpen && (
                 <NpcGeneratorModal
                    onClose={() => setNpcGeneratorOpen(false)}
                    onGenerate={handleGenerateNpc}
                 />
            )}
            {isCustomizationOpen && (
                <CustomizationModal 
                    ficha={currentFicha}
                    onClose={() => setCustomizationOpen(false)}
                    onUpdate={handleBulkUpdate}
                    onReset={resetAesthetics}
                />
            )}
             {isExclusionModalOpen && (
                <ExclusionModal
                    ficha={currentFicha}
                    onClose={() => setExclusionModalOpen(false)}
                    onConfirm={excludeItems}
                />
            )}
            {passwordRequest && (
                <PasswordModal
                    isOpen={!!passwordRequest}
                    onClose={closePasswordRequest}
                    onVerify={(pass) => pass === '1040'}
                    onSuccess={() => {
                        if (passwordRequest) {
                            passwordRequest();
                        }
                        closePasswordRequest();
                    }}
                />
            )}
            {isPasswordVerifyOpen && (
                <PasswordModal
                    isOpen={isPasswordVerifyOpen}
                    onClose={() => { setPasswordVerifyOpen(false); setPendingUpdate(null); }}
                    onVerify={(pass) => pass === '1040' || pass === currentFicha?.password}
                    onSuccess={handleVerificationSuccess}
                    title="Ficha Trancada"
                    description="Esta ficha está trancada. Insira a senha para editar."
                />
            )}
            {isLockManagementOpen && (
                <LockManagementModal
                    ficha={currentFicha}
                    onClose={() => setLockManagementOpen(false)}
                    onLock={(pass) => lockFicha(currentFichaId!, pass)}
                    onUnlock={() => unlockFicha(currentFichaId!)}
                />
            )}
            {isConfirmRecomecarOpen && (
                <Modal title="Confirmar Reinício de Ficha" onClose={() => setConfirmRecomecarOpen(false)}>
                    <p>Tem certeza que deseja recomeçar a ficha "{currentFicha.nomeFicha}"?</p>
                    <p className="text-sm opacity-70 mt-1">Todos os dados, incluindo atributos, itens e progresso, serão perdidos e resetados para o padrão.</p>
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setConfirmRecomecarOpen(false)} className="btn-interactive px-4 py-2 bg-stone-600 rounded text-white">Não</button>
                        <button onClick={() => { recomecarFicha(); setConfirmRecomecarOpen(false); }} className="btn-interactive px-4 py-2 bg-red-700 rounded text-white">Sim, Recomeçar</button>
                    </div>
                </Modal>
            )}
            {isMultiDeleteModalOpen && (
                <MultiDeleteModal
                    fichas={fichas}
                    onClose={() => setMultiDeleteModalOpen(false)}
                    onConfirm={handleMultiDeleteConfirm}
                />
            )}
            {isNpcSpawning && (
                <div className="flaming-text-overlay">
                    <h2 className="flaming-text text-center px-4">
                        Bem-vindo, {generatedNpcInfo.classe}
                    </h2>
                </div>
            )}
        </div>
    );
};

export default App;