





import { useState, useEffect, useCallback } from 'react';
import type { Ficha, DiceRoll, Magia } from '../types';
import { 
    FICHA_MATRIZ_ID,
    nivelData, 
    vantagensData, 
    desvantagensData, 
    racasData, 
    classesData,
    classWeaponsData
} from '../constants';
import { calcularAtributos } from '../calculations';

const RPG_GM_MODE_KEY = 'rpgGmMode';

// Configuração do cliente Supabase
const supabaseUrl = 'https://lwotgxcbzbhmvaawzlxz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3b3RneGNiemJobXZhYXd6bHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTY4MDgsImV4cCI6MjA3ODYzMjgwOH0.bf0O_PwGogW5fbSxQ9dTnsH_W93fikUbOpC6DmQNtZs';
const supabase = (window as any).supabase.createClient(supabaseUrl, supabaseKey);


const createDefaultFicha = (id: string, nomeFicha: string): Ficha => ({
    id,
    nomeFicha,
    nomePersonagem: '',
    descricaoPersonagem: '',
    forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0,
    lockedAtributos: { forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0 },
    ataque: 0, ataqueMagico: 0, acerto: 0, esquiva: 0, rdf: 0, rdm: 0,
    vidaTotal: 50, vidaAtual: 50, magiaTotal: 20, magiaAtual: 20, vigorTotal: 10, vigorAtual: 10,
    regeneracaoVida: 0, regeneracaoMagia: 0, regeneracaoVigor: 0,
    armaDireitaNome: '', armaDireitaAtaque: 0, armaDireitaAtaqueMagico: 0, armaDireitaRdf: 0, armaDireitaRdm: 0, armaDireitaEfeito: '',
    armaEsquerdaNome: '', armaEsquerdaAtaque: 0, armaEsquerdaAtaqueMagico: 0, armaEsquerdaRdf: 0, armaEsquerdaRdm: 0, armaEsquerdaEfeito: '',
    inventario: Array(5).fill({ item: '', peso: 0 }),
    pesoTotal: 0, capacidadeCarga: 5,
    moedasOuro: 0, moedasPrata: 0, moedasBronze: 0,
    magiasHabilidades: Array(3).fill({ nome: '', custo: 0, custoVigor: 0, dano: '', tipo: '' }),
    vantagens: [], desvantagens: [], racaSelecionada: null, subRacaSelecionada: null,
    velocidadeCorrida: 25, alturaPulo: 1, distanciaPulo: 3,
    experiencia: 0,
    lockedExperiencia: 0,
    nivel: 0, pontosHabilidadeTotais: 25, pontosHabilidadeDisponiveis: 25, pontosVantagemTotais: 8,
    
    classeSelecionada: null,
    habilidadesClasseAdquiridas: [],
    habilidadesClasseCompradasComPV: [],
    almasTotais: 0,
    almasGastas: 0,
    showClasseSkillsNotification: false,


    anotacoes: '',
    gmAdjustments: {},
    diceHistory: [],

    // Character Image
    characterImage: null,

    // Aesthetic properties
    theme: 'theme-medieval',
    darkMode: false,
    backgroundColor: '#f0e6d2',
    sheetBackgroundColor: '#f0e6d2',
    componentBackgroundColor: '#f0e6d2',
    fontFamily: "'Inter', sans-serif",
    sheetOpacity: 100,
    shadowColor: '#000000',
    shadowIntensity: 0,
    backgroundImage: null,
    backgroundSize: 'cover',
    borderColor: '#b8860b',
    borderStyle: 'solid',
    borderWidth: 2,
    diceColor: '#f0e6d2',
    diceNumberColor: '#000000',
    diceTexture: null,
    textColor: '#000000',
    accentColor: '#f59e0b',
    
    // Lock feature
    isLocked: false,
    password: null,
});

type EditableAttributes = Pick<Ficha, 'forca' | 'destreza' | 'agilidade' | 'constituicao' | 'inteligencia'>;

const processRawFichaData = (rawFichaData: any, fichaId: string): Ficha => {
    const defaultFichaTemplate = createDefaultFicha(fichaId, rawFichaData?.nomeFicha || '');
    const ficha: Ficha = { ...defaultFichaTemplate, ...rawFichaData, id: fichaId };

    for (const prop in defaultFichaTemplate) {
        const typedProp = prop as keyof Ficha;
        const defaultValue = defaultFichaTemplate[typedProp];
        const currentValue = ficha[typedProp];
        
        if (currentValue === undefined) {
            (ficha as any)[typedProp] = defaultValue;
        } else if (typeof defaultValue === 'number' && typeof currentValue !== 'number') {
            (ficha as any)[typedProp] = parseFloat(currentValue as any) || 0;
        } else if (Array.isArray(defaultValue) && !Array.isArray(currentValue)) {
            (ficha as any)[typedProp] = defaultValue;
        }
    }
    
    if (Array.isArray(ficha.inventario)) {
        ficha.inventario = ficha.inventario.map(item => ({
            item: String(item?.item || ''),
            peso: parseFloat(item?.peso as any) || 0
        }));
    } else {
         ficha.inventario = defaultFichaTemplate.inventario;
    }

    if (Array.isArray(ficha.magiasHabilidades)) {
        ficha.magiasHabilidades = ficha.magiasHabilidades.map(magia => ({
            nome: String(magia?.nome || ''),
            custo: parseFloat(magia?.custo as any) || 0,
            custoVigor: parseFloat(magia?.custoVigor as any) || 0,
            dano: String(magia?.dano || ''),
            tipo: String(magia?.tipo || ''),
            isClassSkill: !!magia?.isClassSkill,
        }));
    } else {
        ficha.magiasHabilidades = defaultFichaTemplate.magiasHabilidades;
    }

    if (typeof ficha.lockedAtributos === 'object' && ficha.lockedAtributos !== null) {
         for (const attr in defaultFichaTemplate.lockedAtributos) {
            const typedAttr = attr as keyof typeof defaultFichaTemplate.lockedAtributos;
            if (typeof ficha.lockedAtributos[typedAttr] !== 'number') {
                (ficha.lockedAtributos as any)[typedAttr] = parseFloat((ficha.lockedAtributos as any)[typedAttr] as any) || 0;
            }
        }
    } else {
        ficha.lockedAtributos = defaultFichaTemplate.lockedAtributos;
    }

    return ficha;
};


export const useCharacterSheet = () => {
    const [fichas, setFichas] = useState<Record<string, Ficha>>({});
    const [currentFichaId, setCurrentFichaId] = useState<string | null>(null);
    const [passwordRequest, setPasswordRequest] = useState<(() => void) | null>(null);
    const [isGmMode, setIsGmMode] = useState(false);
    const [levelUpEffect, setLevelUpEffect] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
    const [generatedNpcInfo, setGeneratedNpcInfo] = useState<{ id: string; classe: string; } | null>(null);

    const updateFicha = useCallback((id: string, updatedFichaData: Partial<Ficha>) => {
        // Obter a ficha antiga do estado para garantir que estamos trabalhando com a versão mais recente
        const oldFicha = fichas[id];
        if (!oldFicha) return;
    
        // Aplicar atualizações e recalcular tudo para obter a versão final da ficha
        let newFicha = { ...oldFicha, ...updatedFichaData };
    
        // Lógica de cálculo que estava dentro do `setFichas`
        if (updatedFichaData.classeSelecionada && updatedFichaData.classeSelecionada !== oldFicha.classeSelecionada) {
            const chosenClassName = updatedFichaData.classeSelecionada;
            const weaponsForClass = classWeaponsData.filter(w => w.classe === chosenClassName);
            
            if (weaponsForClass.length > 0) {
                const chosenWeapon = weaponsForClass[Math.floor(Math.random() * weaponsForClass.length)];
                
                newFicha.armaDireitaNome = chosenWeapon.nome;
                newFicha.armaDireitaAtaque = chosenWeapon.stats.ataque || 0;
                newFicha.armaDireitaAtaqueMagico = chosenWeapon.stats.ataqueMagico || 0;
                newFicha.armaDireitaRdf = chosenWeapon.stats.rdf || 0;
                newFicha.armaDireitaRdm = chosenWeapon.stats.rdm || 0;
                newFicha.armaDireitaEfeito = chosenWeapon.efeito || '';

                newFicha.armaEsquerdaNome = '';
                newFicha.armaEsquerdaAtaque = 0;
                newFicha.armaEsquerdaAtaqueMagico = 0;
                newFicha.armaEsquerdaRdf = 0;
                newFicha.armaEsquerdaRdm = 0;
                newFicha.armaEsquerdaEfeito = '';
                
                const inventory = oldFicha.inventario.filter(i => i.item.trim() !== '');
                if (!inventory.some(i => i.item === chosenWeapon.nome)) {
                    inventory.push({ item: chosenWeapon.nome, peso: 1.5 });
                    newFicha.inventario = inventory;
                }
            }
        }
        
        const oldLevel = oldFicha.nivel;
        const nivelInfo = [...nivelData].reverse().find(data => newFicha.experiencia >= data.xp) || nivelData[0];
        const newLevel = nivelInfo.nivel;
        
        newFicha.nivel = newLevel;
        newFicha.pontosHabilidadeTotais = nivelInfo.pd + (newFicha.gmAdjustments?.pontosHabilidadeTotais || 0);
        newFicha.pontosVantagemTotais = nivelInfo.ph + (newFicha.gmAdjustments?.pontosVantagemTotais || 0);
        
        if (newLevel > oldLevel) {
            setLevelUpEffect(true);
            setTimeout(() => setLevelUpEffect(false), 5000);

            const keyLevels = [1, 5, 10, 15, 20, 25, 30];
            let almasGanhadas = 0;
            for (let i = oldLevel + 1; i <= newLevel; i++) {
                if (keyLevels.includes(i)) {
                    almasGanhadas++;
                }
            }
            if(almasGanhadas > 0) {
                newFicha.almasTotais = (oldFicha.almasTotais || 0) + almasGanhadas;
                newFicha.showClasseSkillsNotification = true;
            }
        }

        newFicha.pesoTotal = newFicha.inventario.reduce((sum, item) => sum + (item.peso || 0), 0);
        
        const finalFicha = calcularAtributos(newFicha);
    
        // Atualizar o estado da UI de forma otimista
        setFichas(prevFichas => ({ ...prevFichas, [id]: finalFicha }));
    
        // Salvar no Supabase (fire-and-forget)
        if (id !== FICHA_MATRIZ_ID) {
            const save = async () => {
                const { error } = await supabase
                    .from('fichas')
                    .update({
                        nome_personagem: finalFicha.nomeFicha,
                        dados_ficha: finalFicha
                    })
                    .eq('id', id);
    
                if (error) {
                    alert(`Erro ao salvar ficha: ${error.message}`);
                }
            };
            save();
        }
    }, [fichas]);

     useEffect(() => {
        const loadFichas = async () => {
            const { data, error } = await supabase.from('fichas').select('*');

            if (error) {
                alert(`Erro ao carregar fichas: ${error.message}`);
                setFichas({ [FICHA_MATRIZ_ID]: createDefaultFicha(FICHA_MATRIZ_ID, "Matriz") });
                return;
            }

            let loadedFichas: Record<string, Ficha> = {};
            if (data) {
                for (const row of data) {
                    const fichaId = String(row.id);
                    loadedFichas[fichaId] = processRawFichaData(row.dados_ficha, fichaId);
                }
            }
            
            if (!loadedFichas[FICHA_MATRIZ_ID]) {
                loadedFichas[FICHA_MATRIZ_ID] = createDefaultFicha(FICHA_MATRIZ_ID, "Matriz");
            }
            
            setFichas(loadedFichas);
        };

        loadFichas();

        const savedGmMode = localStorage.getItem(RPG_GM_MODE_KEY);
        setIsGmMode(savedGmMode === 'true');

    }, []);

    useEffect(() => {
        if (currentFichaId && !fichas[currentFichaId]) {
            setCurrentFichaId(null);
        }
    }, [fichas, currentFichaId]);

    useEffect(() => {
        const channel = supabase
          .channel('fichas-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'fichas' },
            (payload) => {
              const { eventType, new: newRecord, old: oldRecord } = payload;
    
              setFichas(currentFichas => {
                const newFichas = { ...currentFichas };
    
                if (eventType === 'INSERT') {
                  const fichaId = String(newRecord.id);
                  newFichas[fichaId] = processRawFichaData(newRecord.dados_ficha, fichaId);
                  return newFichas;
                }
    
                if (eventType === 'UPDATE') {
                  const fichaId = String(newRecord.id);
                  newFichas[fichaId] = processRawFichaData(newRecord.dados_ficha, fichaId);
                  return newFichas;
                }
    
                if (eventType === 'DELETE') {
                  const fichaId = String(oldRecord.id);
                  if (newFichas[fichaId]) {
                    delete newFichas[fichaId];
                  }
                  return newFichas;
                }
    
                return currentFichas;
              });
            }
          )
          .subscribe();
    
        return () => {
          supabase.removeChannel(channel);
        };
      }, []);

    const closePasswordRequest = useCallback(() => setPasswordRequest(null), []);

    const toggleGmMode = useCallback(() => {
        if (isGmMode) {
            setIsGmMode(false);
            localStorage.setItem(RPG_GM_MODE_KEY, 'false');
        } else {
            setPasswordRequest(() => () => {
                setIsGmMode(true);
                localStorage.setItem(RPG_GM_MODE_KEY, 'true');
            });
        }
    }, [isGmMode]);

    const updateGmAdjustment = useCallback((attr: keyof Ficha, adjustment: number) => {
        const current = fichas[currentFichaId!];
        if (current) {
            const newAdjustments = { ...current.gmAdjustments, [attr]: adjustment };
            if (adjustment === 0) {
                 delete newAdjustments[attr];
            }
            updateFicha(currentFichaId!, { gmAdjustments: newAdjustments });
        }
    }, [currentFichaId, fichas, updateFicha]);

    const switchFicha = useCallback((id: string) => {
        if (fichas[id]) {
            setCurrentFichaId(id);
        }
    }, [fichas]);

    const createFicha = useCallback((nomeFicha: string) => {
        const tempId = `ficha_${Date.now()}`;
        const newFicha = createDefaultFicha(tempId, nomeFicha);

        setFichas(prevFichas => ({ ...prevFichas, [tempId]: newFicha }));
        setCurrentFichaId(tempId);

        const save = async (): Promise<string | null> => {
            const { id, ...fichaToInsert } = newFicha;
            const { data, error } = await supabase
                .from('fichas')
                .insert({ nome_personagem: nomeFicha, dados_ficha: fichaToInsert })
                .select()
                .single();

            if (error) {
                alert(`Erro ao criar ficha: ${error.message}`);
                setFichas(prev => { const copy = { ...prev }; delete copy[tempId]; return copy; });
                setCurrentFichaId(currentId => (currentId === tempId ? null : currentId));
                return null;
            }

            if (data) {
                const realId = String(data.id);
                const savedFicha = data.dados_ficha as Ficha;
                savedFicha.id = realId;

                setFichas(prev => {
                    const copy = { ...prev };
                    delete copy[tempId];
                    copy[realId] = savedFicha;
                    return copy;
                });
                setCurrentFichaId(currentId => (currentId === tempId ? realId : currentId));
                return realId;
            }
            return null;
        };

        return { tempId, promise: save() };
    }, []);
    
    const importFicha = useCallback((fichaData: Omit<Ficha, 'id'>) => {
        const nomeFicha = `${fichaData.nomeFicha || "Ficha"} (Importada)`;
        const tempId = `ficha_${Date.now()}`;
        const defaultFicha = createDefaultFicha(tempId, "");
        const newFicha = { ...defaultFicha, ...fichaData, id: tempId, nomeFicha };
        
        setFichas(prev => ({ ...prev, [tempId]: newFicha }));
        setCurrentFichaId(tempId);

        const save = async () => {
            const { id, ...fichaToInsert } = newFicha;
            const { data, error } = await supabase
                .from('fichas')
                .insert({ nome_personagem: nomeFicha, dados_ficha: fichaToInsert })
                .select()
                .single();

            if (error) {
                alert(`Erro ao importar ficha: ${error.message}`);
                setFichas(prev => { const copy = { ...prev }; delete copy[tempId]; return copy; });
                setCurrentFichaId(null);
                return;
            }

            if (data) {
                const realId = String(data.id);
                const savedFicha = data.dados_ficha as Ficha;
                savedFicha.id = realId;

                setFichas(prev => {
                    const copy = { ...prev };
                    delete copy[tempId];
                    copy[realId] = savedFicha;
                    return copy;
                });
                 setCurrentFichaId(currentId => (currentId === tempId ? realId : currentId));
            }
        };

        save();
        alert(`Ficha "${nomeFicha}" importada com sucesso!`);
    }, []);

    const generateNpc = useCallback((level: number, archetype: string) => {
        const tempId = `npc_${Date.now()}`;
        let newFicha = createDefaultFicha(tempId, "Gerando NPC...");

        // ... Lógica de geração de NPC (permanece a mesma)
        const nivelInfo = nivelData[level] || nivelData[0];
        newFicha.nivel = nivelInfo.nivel;
        newFicha.experiencia = nivelInfo.xp;
        const totalPoints = nivelInfo.pd;
        newFicha.pontosHabilidadeTotais = totalPoints;
        let pontosVantagem = nivelInfo.ph;
        newFicha.pontosVantagemTotais = pontosVantagem;

        const archetypeToClassMap: Record<string, string[]> = {
            'Ataque': ['Espadachim', 'Guerreiro', 'Mago', 'Mago de Fogo', 'Mago de Gelo', 'Necromante', 'Bruxo', 'Ladino', 'Ninja'],
            'Defesa': ['Guerreiro', 'Paladino', 'Templário'],
            'Cura': ['Paladino', 'Sacerdote', 'Templário'],
            'Furtivo': ['Arqueiro', 'Patrulheiro (Ranger)', 'Ladino', 'Ninja'],
        };
        
        let currentArchetype = archetype;
        if (archetype === 'Aleatório') {
            const archetypes = Object.keys(archetypeToClassMap);
            currentArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
        }

        const possibleClasses = archetypeToClassMap[currentArchetype as keyof typeof archetypeToClassMap];
        const chosenClassName = possibleClasses[Math.floor(Math.random() * possibleClasses.length)];
        const chosenClassData = classesData.find(c => c.nome === chosenClassName);

        newFicha.classeSelecionada = chosenClassName;
        if (chosenClassData) {
            pontosVantagem -= chosenClassData.custo;
            
            const keyLevels = [1, 5, 10, 15, 20, 25, 30];
            let almasGanhadas = 0;
            for (let i = 1; i <= level; i++) {
                if (keyLevels.includes(i)) {
                    almasGanhadas++;
                }
            }
            newFicha.almasTotais = almasGanhadas;
            
            const availableSkills = chosenClassData.habilidades
                .filter(h => h.nivel <= level)
                .sort(() => 0.5 - Math.random()); 

            const skillsToBuyCount = Math.min(newFicha.almasTotais, availableSkills.length);
            const skillsToBuy = availableSkills.slice(0, skillsToBuyCount);

            newFicha.habilidadesClasseAdquiridas = skillsToBuy.map(h => h.nome);
            newFicha.almasGastas = skillsToBuyCount;

            const newClassMagias: Magia[] = skillsToBuy.map(habilidade => ({
                nome: habilidade.nome,
                custo: habilidade.custoMagia,
                custoVigor: habilidade.custoVigor,
                dano: habilidade.dano,
                tipo: habilidade.tipo,
                isClassSkill: true,
                descricao: habilidade.descricao,
                duracao: habilidade.duracao,
                castingTime: habilidade.castingTime,
                cooldown: habilidade.cooldown,
                efeitoNegativo: habilidade.efeitoNegativo,
            }));
            newFicha.magiasHabilidades = newClassMagias;
        }

        const nomeFicha = `NPC: ${chosenClassName} (${currentArchetype}) Nvl ${level}`;
        newFicha.nomeFicha = nomeFicha;
        newFicha.nomePersonagem = nomeFicha;

        const weights: Record<string, Record<keyof EditableAttributes, number>> = {
            Ataque: { forca: 4, destreza: 4, inteligencia: 3, agilidade: 2, constituicao: 2 },
            Defesa: { constituicao: 5, forca: 4, destreza: 2, agilidade: 1, inteligencia: 1 },
            Cura: { inteligencia: 5, constituicao: 4, forca: 2, destreza: 2, agilidade: 1 },
            Furtivo: { agilidade: 5, destreza: 4, inteligencia: 3, forca: 2, constituicao: 2 },
        };
        
        const attrWeights = weights[currentArchetype as keyof typeof weights];
        const attributes: EditableAttributes = { forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0 };
        const attributeKeys: (keyof EditableAttributes)[] = ['forca', 'destreza', 'agilidade', 'constituicao', 'inteligencia'];

        for (let i = 0; i < totalPoints; i++) {
            const desirabilityScores: Record<keyof EditableAttributes, number> = { forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0 };
            
            attributeKeys.forEach(attr => {
                let score = attrWeights[attr] * 10;
                const currentValue = attributes[attr];

                if (attr === 'destreza' || attr === 'agilidade') {
                    if ((currentValue + 1) % 3 === 0) {
                        score *= 3; 
                    } else if (currentValue % 3 !== 0) {
                        score *= 0.8; 
                    }
                } else {
                    if (attr === 'forca' && ((currentValue + 1) % 5 === 0 || (currentValue + 1) % 10 === 0)) score *= 1.5;
                    if (attr === 'inteligencia' && ((currentValue + 1) % 5 === 0 || (currentValue + 1) % 10 === 0)) score *= 1.5;
                }
                
                desirabilityScores[attr] = score;
            });
            
            const totalScore = attributeKeys.reduce((sum, attr) => sum + desirabilityScores[attr], 0);
            let random = Math.random() * totalScore;
            
            let chosenAttr: keyof EditableAttributes = 'forca';
            for (const attr of attributeKeys) {
                if (random < desirabilityScores[attr]) {
                    chosenAttr = attr;
                    break;
                }
                random -= desirabilityScores[attr];
            }
            attributes[chosenAttr]++;
        }
        newFicha = { ...newFicha, ...attributes };

        const numDesvantagens = Math.floor(Math.random() * 3) + 1;
        const availableDesvantagens = [...desvantagensData];
        for (let i = 0; i < numDesvantagens && availableDesvantagens.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableDesvantagens.length);
            const chosen = availableDesvantagens.splice(randomIndex, 1)[0];
            newFicha.desvantagens.push(chosen.nome);
            pontosVantagem += chosen.ganho;
        }

        const affordableRaces = racasData.filter(r => r.custo <= pontosVantagem);
        if (affordableRaces.length > 0) {
            const chosenRace = affordableRaces[Math.floor(Math.random() * affordableRaces.length)];
            newFicha.racaSelecionada = chosenRace.nome;
            pontosVantagem -= chosenRace.custo;

            if (chosenRace.subRacas && chosenRace.subRacas.length > 0) {
                const affordableSubRaces = chosenRace.subRacas.filter(sr => sr.custoAdicional <= pontosVantagem);
                if (affordableSubRaces.length > 0) {
                    const chosenSubRace = affordableSubRaces[Math.floor(Math.random() * affordableSubRaces.length)];
                    newFicha.subRacaSelecionada = chosenSubRace.nome;
                    pontosVantagem -= chosenSubRace.custoAdicional;
                }
            }
        }
        
        const availableVantagens = [...vantagensData].filter(v => v.restricao !== 'inicio');
        availableVantagens.sort(() => 0.5 - Math.random()); 

        while (pontosVantagem > 0 && availableVantagens.length > 0) {
            let advantageToPick = availableVantagens.find(v => v.custo <= pontosVantagem);
            if (advantageToPick) {
                newFicha.vantagens.push(advantageToPick.nome);
                pontosVantagem -= advantageToPick.custo;
                availableVantagens.splice(availableVantagens.indexOf(advantageToPick), 1);
            } else {
                break; 
            }
        }
        
        newFicha.inventario = []; 
        
        const weaponsForClass = classWeaponsData.filter(w => w.classe === chosenClassName);
        if (weaponsForClass.length > 0) {
            const chosenWeapon = weaponsForClass[Math.floor(Math.random() * weaponsForClass.length)];
            
            newFicha.armaDireitaNome = chosenWeapon.nome;
            newFicha.armaDireitaAtaque = chosenWeapon.stats.ataque || 0;
            newFicha.armaDireitaAtaqueMagico = chosenWeapon.stats.ataqueMagico || 0;
            newFicha.armaDireitaRdf = chosenWeapon.stats.rdf || 0;
            newFicha.armaDireitaRdm = chosenWeapon.stats.rdm || 0;
            newFicha.armaDireitaEfeito = chosenWeapon.efeito || '';
            
            newFicha.armaEsquerdaNome = '';
            newFicha.armaEsquerdaAtaque = 0;
            newFicha.armaEsquerdaAtaqueMagico = 0;
            newFicha.armaEsquerdaRdf = 0;
            newFicha.armaEsquerdaRdm = 0;
            newFicha.armaEsquerdaEfeito = '';

            newFicha.inventario.push({ item: chosenWeapon.nome, peso: 1.5 });
        }

        let finalFicha = calcularAtributos(newFicha);
        finalFicha.vidaAtual = finalFicha.vidaTotal;
        finalFicha.magiaAtual = finalFicha.magiaTotal;
        finalFicha.vigorAtual = finalFicha.vigorTotal;

        setFichas(prev => ({ ...prev, [tempId]: finalFicha }));
        setCurrentFichaId(tempId);
        setGeneratedNpcInfo({ id: tempId, classe: chosenClassName });

        const save = async () => {
             const { id, ...fichaToInsert } = finalFicha;
            const { data, error } = await supabase
                .from('fichas')
                .insert({ nome_personagem: finalFicha.nomeFicha, dados_ficha: fichaToInsert })
                .select()
                .single();

            if (error) {
                alert(`Erro ao gerar NPC: ${error.message}`);
                setFichas(prev => { const copy = { ...prev }; delete copy[tempId]; return copy; });
                setCurrentFichaId(null);
                return;
            }

            if (data) {
                const realId = String(data.id);
                const savedFicha = data.dados_ficha as Ficha;
                savedFicha.id = realId;

                setFichas(prev => {
                    const copy = { ...prev };
                    delete copy[tempId];
                    copy[realId] = savedFicha;
                    return copy;
                });
                setGeneratedNpcInfo(current => current?.id === tempId ? { id: realId, classe: current.classe } : current);
                setCurrentFichaId(currentId => (currentId === tempId ? realId : currentId));
            }
        };
        save();
    }, []);


    const deleteFichas = useCallback((idsToDelete: string[]) => {
        const validIdsToDelete = idsToDelete.filter(id => id !== FICHA_MATRIZ_ID);
        if (validIdsToDelete.length === 0) {
            if (idsToDelete.length > 0) alert("A ficha matriz não pode ser excluída!");
            return;
        }
    
        const oldFichas = { ...fichas };
        const oldCurrentFichaId = currentFichaId;
    
        const newFichas = { ...fichas };
        let newCurrentFichaId = currentFichaId;
    
        validIdsToDelete.forEach(id => {
            delete newFichas[id];
            if (currentFichaId === id) {
                newCurrentFichaId = null;
            }
        });
        
        setFichas(newFichas);
        setCurrentFichaId(newCurrentFichaId);
    
        const remove = async () => {
            const { error } = await supabase.from('fichas').delete().in('id', validIdsToDelete);
            if (error) {
                alert(`Erro ao excluir fichas: ${error.message}`);
                setFichas(oldFichas);
                setCurrentFichaId(oldCurrentFichaId);
            }
        };
        remove();
    }, [currentFichaId, fichas]);

    const resetPontos = useCallback(() => {
        setPasswordRequest(() => () => {
             updateFicha(currentFichaId!, { 
                forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0,
                lockedAtributos: { forca: 0, destreza: 0, agilidade: 0, constituicao: 0, inteligencia: 0 }
            });
        });
    }, [currentFichaId, updateFicha]);

    const recomecarFicha = useCallback(() => {
        const current = fichas[currentFichaId!];
        if(current) {
            const newFicha = createDefaultFicha(current.id, current.nomeFicha);
            
            setFichas(prev => ({ ...prev, [current.id]: newFicha }));
            
            const save = async () => {
                const { error } = await supabase
                    .from('fichas')
                    .update({ dados_ficha: newFicha, nome_personagem: newFicha.nomeFicha })
                    .eq('id', current.id);
                if (error) {
                    alert(`Erro ao recomeçar ficha: ${error.message}`);
                    setFichas(prev => ({ ...prev, [current.id]: current })); // Revert
                }
            };
            save();
        }
    }, [currentFichaId, fichas]);

    const excludeItems = useCallback((itemsToRemove: { vantagens: string[], desvantagens: string[], removeRaca: boolean, removeClasse: boolean }) => {
        const current = fichas[currentFichaId!];
        if (current) {
            const newVantagens = current.vantagens.filter(v => !itemsToRemove.vantagens.includes(v));
            const newDesvantagens = current.desvantagens.filter(d => !itemsToRemove.desvantagens.includes(d));
            const newRaca = itemsToRemove.removeRaca ? null : current.racaSelecionada;
            const newSubRaca = itemsToRemove.removeRaca ? null : current.subRacaSelecionada;
            const newClasse = itemsToRemove.removeClasse ? null : current.classeSelecionada;
            
            updateFicha(currentFichaId!, { 
                vantagens: newVantagens, 
                desvantagens: newDesvantagens,
                racaSelecionada: newRaca,
                subRacaSelecionada: newSubRaca,
                classeSelecionada: newClasse
            });
        }
    }, [currentFichaId, fichas, updateFicha]);

     const resetAesthetics = useCallback(() => {
        const defaults = createDefaultFicha('', '');
        updateFicha(currentFichaId!, {
            theme: defaults.theme,
            darkMode: false, 
            backgroundColor: defaults.backgroundColor,
            sheetBackgroundColor: defaults.sheetBackgroundColor,
            componentBackgroundColor: defaults.componentBackgroundColor,
            fontFamily: defaults.fontFamily,
            sheetOpacity: defaults.sheetOpacity,
            shadowColor: defaults.shadowColor,
            shadowIntensity: defaults.shadowIntensity,
            backgroundImage: defaults.backgroundImage,
            backgroundSize: defaults.backgroundSize,
            borderColor: defaults.borderColor,
            borderStyle: defaults.borderStyle,
            borderWidth: defaults.borderWidth,
            diceColor: defaults.diceColor,
            diceNumberColor: defaults.diceNumberColor,
            diceTexture: defaults.diceTexture,
            textColor: defaults.textColor,
            accentColor: defaults.accentColor,
        });
    }, [currentFichaId, updateFicha]);

    const resetClasseNotification = useCallback(() => {
        if(fichas[currentFichaId!]?.showClasseSkillsNotification) {
            updateFicha(currentFichaId!, { showClasseSkillsNotification: false });
        }
      }, [fichas, currentFichaId, updateFicha]);
    
    const getPontosVantagem = useCallback(() => {
        const ficha = fichas[currentFichaId!];
        if (!ficha) return 0;

        let phBase = ficha.pontosVantagemTotais;
        
        ficha.vantagens.forEach(vNome => {
            const vantagem = vantagensData.find(d => d.nome === vNome);
            if (vantagem) phBase -= vantagem.custo;
        });
        ficha.desvantagens.forEach(dNome => {
            const desvantagem = desvantagensData.find(d => d.nome === dNome);
            if (desvantagem) phBase += desvantagem.ganho;
        });
        if (ficha.racaSelecionada) {
            const raca = racasData.find(r => r.nome === ficha.racaSelecionada);
            if (raca) {
                phBase -= raca.custo;
                if (ficha.subRacaSelecionada) {
                    const subRaca = raca.subRacas?.find(sr => sr.nome === ficha.subRacaSelecionada);
                    if (subRaca) {
                        phBase -= subRaca.custoAdicional;
                    }
                }
            }
        }
        if (ficha.classeSelecionada) {
            const classe = classesData.find(c => c.nome === ficha.classeSelecionada);
            if (classe) {
                phBase -= classe.custo;
                if (ficha.habilidadesClasseCompradasComPV?.length > 0) {
                    ficha.habilidadesClasseCompradasComPV.forEach(nomeHabilidade => {
                        const habilidade = classe.habilidades.find(h => h.nome === nomeHabilidade);
                        if (habilidade) {
                            phBase -= habilidade.custoPVSemAlma;
                        }
                    });
                }
            }
        }

        return phBase;
    }, [fichas, currentFichaId]);
    
    const rollDice = useCallback((max: number): DiceRoll => {
        const ficha = fichas[currentFichaId!];
        if (!ficha) {
            return { id: '', total: 0, type: `d${max}`, result: 0, bonus: 0, attribute: null, timestamp: '' };
        }

        const bonus = selectedAttribute ? (ficha[selectedAttribute as keyof Ficha] as number || 0) : 0;
        const result = Math.floor(Math.random() * max) + 1;
        const total = result + bonus;

        const newRoll: DiceRoll = {
            id: `roll_${Date.now()}`,
            total,
            type: `d${max}`,
            result,
            bonus,
            attribute: selectedAttribute,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        
        const updatedHistory = [newRoll, ...(ficha.diceHistory || [])].slice(0, 50);
        updateFicha(currentFichaId!, { diceHistory: updatedHistory });

        setSelectedAttribute(null);

        return newRoll;
    }, [currentFichaId, fichas, selectedAttribute, updateFicha]);

    const clearDiceHistory = useCallback(() => {
        setPasswordRequest(() => () => {
            updateFicha(currentFichaId!, { diceHistory: [] });
        });
    }, [currentFichaId, updateFicha]);

    const clearGeneratedNpcInfo = useCallback(() => setGeneratedNpcInfo(null), []);

    const lockFicha = useCallback((id: string, pass: string) => {
        updateFicha(id, { isLocked: true, password: pass });
    }, [updateFicha]);

    const unlockFicha = useCallback((id: string) => {
        updateFicha(id, { isLocked: false, password: null });
    }, [updateFicha]);

    return {
        fichas,
        currentFicha: currentFichaId ? fichas[currentFichaId] : null,
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
        calcularAtributos: (ficha: Ficha) => updateFicha(ficha.id, {}),
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
    };
};