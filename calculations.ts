import type { Ficha } from './types';
import { classesData, racasData, vantagensData } from './constants';

export const calcularAtributos = (ficha: Ficha): Ficha => {
    // Create a fresh copy to work with, preventing mutation of the original state object
    const newFicha = { ...ficha };
    const adj = newFicha.gmAdjustments || {};

    // --- Step 1: Accumulate all passive bonuses from different sources ---
    const passiveBonuses: Partial<Record<keyof Ficha, number>> = {};
    const addBonus = (attr: keyof Ficha, value: number) => {
        passiveBonuses[attr] = (passiveBonuses[attr] || 0) + value;
    };

    // Advantages
    if (newFicha.vantagens.includes("Pele Arcana (3)")) {
        addBonus('rdm', 5);
    }
    if (newFicha.vantagens.includes("Vigoroso (3)")) {
        addBonus('vigorTotal', 10);
    }
    
    // Race & Sub-race
    const raca = racasData.find(r => r.nome === newFicha.racaSelecionada);
    if (raca && newFicha.subRacaSelecionada) {
        const subRaca = raca.subRacas?.find(sr => sr.nome === newFicha.subRacaSelecionada);
        if (subRaca?.efeito) {
            const effects = Array.isArray(subRaca.efeito) ? subRaca.efeito : [subRaca.efeito];
            effects.forEach(eff => addBonus(eff.atributo, eff.valor));
        }
    }
    
    // Class Passives
    if (newFicha.classeSelecionada && newFicha.habilidadesClasseAdquiridas.length > 0) {
        const classe = classesData.find(c => c.nome === newFicha.classeSelecionada);
        if (classe) {
            newFicha.habilidadesClasseAdquiridas.forEach(nomeHabilidade => {
                const habilidade = classe.habilidades.find(h => h.nome === nomeHabilidade);
                if (habilidade?.efeito && habilidade.tipo === 'passiva') {
                    const effects = Array.isArray(habilidade.efeito) ? habilidade.efeito : [habilidade.efeito];
                    effects.forEach(eff => addBonus(eff.atributo, eff.valor));
                }
            });
        }
    }
    
    // --- Step 2: Use base attributes + passive bonuses for calculations ---
    const forca = newFicha.forca + (passiveBonuses.forca || 0);
    const destreza = newFicha.destreza + (passiveBonuses.destreza || 0);
    const agilidade = newFicha.agilidade + (passiveBonuses.agilidade || 0);
    const inteligencia = newFicha.inteligencia + (passiveBonuses.inteligencia || 0);
    const constituicao = newFicha.constituicao + (passiveBonuses.constituicao || 0);
    const nivel = newFicha.nivel;

    // --- Step 3: Recalculate all derived stats FROM SCRATCH using '=' ---

    // Resources (Vida, Magia, Vigor)
    newFicha.vidaTotal = Math.ceil(50 + (constituicao * (3 + Math.floor(forca / 10))) + 10 * nivel) + (passiveBonuses.vidaTotal || 0) + (adj.vidaTotal || 0);
    newFicha.magiaTotal = Math.ceil(20 + 3 * constituicao + (inteligencia >= 10 ? constituicao * Math.floor(inteligencia / 10) : 0)) + (passiveBonuses.magiaTotal || 0) + (adj.magiaTotal || 0);
    newFicha.vigorTotal = parseFloat((10 + 0.4 * constituicao).toFixed(1)) + (passiveBonuses.vigorTotal || 0) + (adj.vigorTotal || 0);

    // Combat Attributes
    newFicha.ataque = forca + Math.floor(destreza / 5) + newFicha.armaDireitaAtaque + newFicha.armaEsquerdaAtaque + (passiveBonuses.ataque || 0) + (adj.ataque || 0);
    newFicha.ataqueMagico = inteligencia + newFicha.armaDireitaAtaqueMagico + newFicha.armaEsquerdaAtaqueMagico + (passiveBonuses.ataqueMagico || 0) + (adj.ataqueMagico || 0);
    newFicha.acerto = Math.floor(destreza / 3) + Math.floor(agilidade / 10) + (passiveBonuses.acerto || 0) + (adj.acerto || 0);
    newFicha.esquiva = Math.floor(agilidade / 3) + (passiveBonuses.esquiva || 0) + (adj.esquiva || 0);
    newFicha.rdf = Math.floor(forca / 5) + (newFicha.armaDireitaRdf || 0) + (newFicha.armaEsquerdaRdf || 0) + (passiveBonuses.rdf || 0) + (adj.rdf || 0);
    newFicha.rdm = Math.floor(inteligencia / 5) + (newFicha.armaDireitaRdm || 0) + (newFicha.armaEsquerdaRdm || 0) + (passiveBonuses.rdm || 0) + (adj.rdm || 0);
    
    // Encumbrance (This modifies combat stats, so it should come after their base calculation)
    newFicha.capacidadeCarga = 5 + Math.floor(forca / 5) + (adj.capacidadeCarga || 0);
    if (newFicha.pesoTotal > newFicha.capacidadeCarga) {
        const sobrecarga = newFicha.pesoTotal - newFicha.capacidadeCarga;
        const penalidade = -1 - Math.floor(Math.max(0, sobrecarga - 3) / 3);
        newFicha.acerto += penalidade;
        newFicha.esquiva += penalidade;
    }

    // Locomotion
    const bonusVelocidade = newFicha.vantagens.includes("Combo Físico (4)") ? 25 : 0;
    const bonusAlturaPulo = newFicha.vantagens.includes("Combo Físico (4)") ? 2 : 0;
    const bonusDistanciaPulo = newFicha.vantagens.includes("Combo Físico (4)") ? 6 : 0;
    newFicha.velocidadeCorrida = 25 + Math.floor(agilidade / 3) * 3 + bonusVelocidade + (adj.velocidadeCorrida || 0);
    newFicha.alturaPulo = 1 + Math.floor(forca / 10) + bonusAlturaPulo + (adj.alturaPulo || 0);
    newFicha.distanciaPulo = 3 + 3 * Math.min(Math.floor(forca / 5), Math.floor(agilidade / 5)) + bonusDistanciaPulo + (adj.distanciaPulo || 0);
    
    // Regeneration
    let baseRegenVigor = 0.4 * constituicao;
    if (newFicha.vantagens.includes("Vigoroso (3)")) {
       baseRegenVigor *= 1.20; // 20% increase
    }
    newFicha.regeneracaoVida = parseFloat((0.2 * constituicao).toFixed(1)) + (adj.regeneracaoVida || 0);
    newFicha.regeneracaoMagia = parseFloat((0.8 * constituicao).toFixed(1)) + (adj.regeneracaoMagia || 0);
    newFicha.regeneracaoVigor = parseFloat(baseRegenVigor.toFixed(1)) + (adj.regeneracaoVigor || 0);

    // Skill Points
    const pdGastos = newFicha.forca + newFicha.destreza + newFicha.agilidade + newFicha.constituicao + newFicha.inteligencia;
    newFicha.pontosHabilidadeDisponiveis = newFicha.pontosHabilidadeTotais - pdGastos;

    // --- Step 4: Final validation to prevent inconsistencies ---
    // Ensure current values don't exceed the newly calculated totals.
    // This is crucial for fixing the visual bug where the bar decreases.
    if (newFicha.vidaAtual > newFicha.vidaTotal) {
        newFicha.vidaAtual = newFicha.vidaTotal;
    }
    if (newFicha.magiaAtual > newFicha.magiaTotal) {
        newFicha.magiaAtual = newFicha.magiaTotal;
    }
    if (newFicha.vigorAtual > newFicha.vigorTotal) {
        newFicha.vigorAtual = newFicha.vigorTotal;
    }

    return newFicha;
};
