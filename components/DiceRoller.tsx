

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Ficha, DiceRoll } from '../types';

interface DiceRollerProps {
    onRoll: (max: number) => DiceRoll;
    selectedAttribute: string | null;
    ficha: Ficha;
    positionClass?: string;
    buttonClass?: string;
    isDraggable?: boolean;
}

const diceRollerAttributeLabels: Record<string, string> = {
    forca: 'Força', destreza: 'Destreza', agilidade: 'Agilidade', constituicao: 'Constituição', inteligencia: 'Inteligência',
    ataque: "Ataque", ataqueMagico: "Ataque Mágico", acerto: "Acerto", esquiva: "Esquiva", rdf: "RDF", rdm: "RDM",
    velocidadeCorrida: 'Velocidade', alturaPulo: 'Pulo (Altura)', distanciaPulo: 'Pulo (Dist.)'
};

export const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll, selectedAttribute, ficha, positionClass = "fixed bottom-5 right-5 z-40", buttonClass, isDraggable = false }) => {
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);
    const [rollStatus, setRollStatus] = useState<'none' | 'crit' | 'fail'>('none');
    const [animationPhase, setAnimationPhase] = useState<'rolling' | 'result'>('rolling');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const cubeRef = useRef<HTMLDivElement>(null);

    // Refs for animation timers
    const animPhaseTimerRef = useRef<number | null>(null);
    const animEndTimerRef = useRef<number | null>(null);
    const cubeAnimTimerRef = useRef<number | null>(null);

    // State for dragging logic
    const [dragState, setDragState] = useState({
        isDragging: false,
        style: {} as React.CSSProperties,
    });
    const dragInfo = useRef({ offsetX: 0, offsetY: 0 });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOptionsVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isDraggable || !wrapperRef.current) return;

        // Prevent dragging if options are visible to not interfere with button clicks
        if(optionsVisible) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        const parentRect = wrapperRef.current.offsetParent?.getBoundingClientRect() || { top: 0, left: 0 };
        
        dragInfo.current.offsetX = e.clientX - rect.left;
        dragInfo.current.offsetY = e.clientY - rect.top;

        setDragState({
            isDragging: true,
            style: {
                position: 'absolute',
                left: `${rect.left - parentRect.left}px`,
                top: `${rect.top - parentRect.top}px`,
                zIndex: 50,
            },
        });

        e.preventDefault();
    };

     useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!wrapperRef.current) return;
            const parentRect = wrapperRef.current.offsetParent?.getBoundingClientRect() || { top: 0, left: 0 };
            
            const newLeft = e.clientX - parentRect.left - dragInfo.current.offsetX;
            const newTop = e.clientY - parentRect.top - dragInfo.current.offsetY;

            setDragState(prev => ({
                ...prev,
                style: {
                    ...prev.style,
                    left: `${newLeft}px`,
                    top: `${newTop}px`,
                }
            }));
        };
        
        const handleMouseUp = () => {
            setDragState(prev => ({ ...prev, isDragging: false }));
        };

        if (dragState.isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'grabbing';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'auto';
            document.body.style.cursor = 'auto';
        }
    }, [dragState.isDragging]);
    
    const handleRoll = (max: number) => {
        // Limpa timers de animações anteriores para permitir uma nova rolagem imediata
        if (animPhaseTimerRef.current) clearTimeout(animPhaseTimerRef.current);
        if (animEndTimerRef.current) clearTimeout(animEndTimerRef.current);
        if (cubeAnimTimerRef.current) clearTimeout(cubeAnimTimerRef.current);
        if (cubeRef.current) {
            cubeRef.current.classList.remove('rolling');
        }
        
        setOptionsVisible(false);
        
        // 1. Rola o dado para obter o resultado.
        const result = onRoll(max);
        setLastRoll(result);

        // 2. Define o status para visuais de crítico/falha.
        if (result.result === max) {
            setRollStatus('crit');
        } else if (result.result === 1) {
            setRollStatus('fail');
        } else {
            setRollStatus('none');
        }
        
        // 3. Inicia a sequência de animação.
        setAnimationPhase('rolling'); // Define a fase de rolagem
        setIsAnimating(true);

        const animDuration = 1200; 

        // Adiciona a classe 'rolling' para acionar a animação CSS.
        cubeAnimTimerRef.current = window.setTimeout(() => {
            if (cubeRef.current) {
                cubeRef.current.classList.add('rolling');
            }
        }, 10);

        // Muda para a fase de 'resultado' após a animação.
        animPhaseTimerRef.current = window.setTimeout(() => {
            setAnimationPhase('result');
            if (cubeRef.current) {
                cubeRef.current.classList.remove('rolling');
            }
        }, animDuration);

        // Fecha automaticamente o modal de animação.
        animEndTimerRef.current = window.setTimeout(() => {
            setIsAnimating(false);
        }, animDuration + 2000); 
    };

    const diceTypes = [4, 6, 8, 10, 12, 20];
    const diceStyle: React.CSSProperties = {
        borderColor: ficha.darkMode ? '#888' : 'var(--border-color)',
        backgroundColor: ficha.darkMode ? '#444' : (ficha.diceColor || '#f0e6d2'),
        color: ficha.darkMode ? '#fff' : (ficha.diceNumberColor || '#000000'),
        backgroundImage: ficha.diceTexture ? `url(${ficha.diceTexture})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };
    const resultClasses = `dice-result-land ${rollStatus === 'crit' ? 'crit-success' : rollStatus === 'fail' ? 'crit-fail' : ''}`;

    const attributeGlowClass = selectedAttribute ? 'attribute-selected-glow' : '';
    const defaultButtonClasses = 'btn-interactive p-2 w-16 h-16 text-4xl bg-amber-600 text-white rounded-full flex items-center justify-center shadow-2xl';
    
    const wrapperStyle = isDraggable ? { ...dragState.style, cursor: dragState.isDragging ? 'grabbing' : 'grab' } : {};
    const wrapperClassName = isDraggable && dragState.style.position ? '' : positionClass;


    return (
        <div ref={wrapperRef} className={wrapperClassName} style={wrapperStyle}>
            {optionsVisible && (
                 <div className="absolute bottom-full right-0 mb-3 flex flex-col items-end gap-2">
                    {diceTypes.map(sides => (
                        <button
                            key={sides}
                            onClick={() => handleRoll(sides)}
                            className="btn-interactive w-14 h-14 rounded-full bg-stone-800/90 text-white font-bold border-2 border-amber-500 shadow-lg"
                        >
                            d{sides}
                        </button>
                    ))}
                </div>
            )}
            <button
                onMouseDown={handleMouseDown}
                onClick={() => {
                    if (!dragState.isDragging) {
                       setOptionsVisible(v => !v)
                    }
                }}
                title="Rolar Dados"
                className={`${buttonClass ?? defaultButtonClasses} ${attributeGlowClass}`}
                style={isDraggable ? { cursor: 'grab' } : {}}
            >
                🎲
            </button>
            
            {isAnimating && (
                <div 
                    className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-4"
                    onClick={() => setIsAnimating(false)}
                >
                    <div className="w-48 h-48">
                        {animationPhase === 'rolling' && (
                            <div className="dice-cube-container">
                                <div ref={cubeRef} id="dice-cube" className="dice-cube">
                                    <div className="dice-face face-front" style={diceStyle}>{lastRoll?.total}</div>
                                    <div className="dice-face face-back" style={diceStyle}>{lastRoll?.total}</div>
                                    <div className="dice-face face-top" style={diceStyle}>{lastRoll?.total}</div>
                                    <div className="dice-face face-bottom" style={diceStyle}>{lastRoll?.total}</div>
                                    <div className="dice-face face-left" style={diceStyle}>{lastRoll?.total}</div>
                                    <div className="dice-face face-right" style={diceStyle}>{lastRoll?.total}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    {animationPhase === 'result' && lastRoll !== null && (
                        <div className="text-center text-white absolute inset-0 flex flex-col items-center justify-center bg-transparent">
                            <span className={`text-9xl font-bold ${resultClasses}`}>{lastRoll.total}</span>
                            <p className="text-lg opacity-90 mt-2">
                                {`Rolagem (${lastRoll.type}): ${lastRoll.result}`}
                                {lastRoll.attribute && lastRoll.bonus !== 0 && ` ${lastRoll.bonus > 0 ? '+' : '-'} ${Math.abs(lastRoll.bonus)} (${diceRollerAttributeLabels[lastRoll.attribute] || lastRoll.attribute})`}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};