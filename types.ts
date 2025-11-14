

export interface Ficha {
    id: string;
    nomeFicha: string;
    nomePersonagem: string;
    descricaoPersonagem: string;

    forca: number;
    destreza: number;
    agilidade: number;
    constituicao: number;
    inteligencia: number;

    ataque: number;
    ataqueMagico: number;
    acerto: number;
    esquiva: number;
    rdf: number;
    rdm: number;

    vidaTotal: number;
    vidaAtual: number;
    magiaTotal: number;
    magiaAtual: number;
    vigorTotal: number;
    vigorAtual: number;

    regeneracaoVida: number;
    regeneracaoMagia: number;
    regeneracaoVigor: number;

    armaDireitaNome: string;
    armaDireitaAtaque: number;
    armaDireitaAtaqueMagico: number;
    armaDireitaRdf: number;
    armaDireitaRdm: number;
    armaDireitaEfeito: string;
    armaEsquerdaNome: string;
    armaEsquerdaAtaque: number;
    armaEsquerdaAtaqueMagico: number;
    armaEsquerdaRdf: number;
    armaEsquerdaRdm: number;
    armaEsquerdaEfeito: string;

    inventario: InventarioItem[];
    pesoTotal: number;
    capacidadeCarga: number;
    
    moedasOuro: number;
    moedasPrata: number;
    moedasBronze: number;

    magiasHabilidades: Magia[];
    vantagens: string[];
    desvantagens: string[];
    racaSelecionada: string | null;
    subRacaSelecionada: string | null;

    velocidadeCorrida: number;
    alturaPulo: number;
    distanciaPulo: number;

    experiencia: number;
    lockedExperiencia: number;
    nivel: number;
    pontosHabilidadeTotais: number;
    pontosHabilidadeDisponiveis: number;
    pontosVantagemTotais: number;
    
    classeSelecionada: string | null;
    habilidadesClasseAdquiridas: string[];
    habilidadesClasseCompradasComPV: string[];
    almasTotais: number;
    almasGastas: number;
    showClasseSkillsNotification: boolean;


    anotacoes: string;
    lockedAtributos: {
        forca: number;
        destreza: number;
        agilidade: number;
        constituicao: number;
        inteligencia: number;
    };
    
    gmAdjustments?: Partial<Record<keyof Ficha, number>>;

    diceHistory: DiceRoll[];

    // Character Image
    characterImage: string | null;

    // Aesthetic properties
    theme: string;
    darkMode: boolean;
    backgroundColor: string | null;
    sheetBackgroundColor: string | null;
    componentBackgroundColor: string | null;
    fontFamily: string;
    sheetOpacity: number;
    shadowColor: string;
    shadowIntensity: number;
    backgroundImage: string | null;
    backgroundSize: 'cover' | '100% 100%' | 'auto';
    borderColor: string;
    borderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge';
    borderWidth: number;
    diceColor: string | null;
    diceNumberColor: string | null;
    diceTexture: string | null;
    textColor: string | null;
    accentColor: string | null;

    // Lock feature
    isLocked: boolean;
    password: string | null;
}

export interface InventarioItem {
    item: string;
    peso: number;
}

// Fix: Add missing DiceRoll interface.
export interface DiceRoll {
    id: string;
    total: number;
    type: string;
    result: number;
    bonus: number;
    attribute: string | null;
    timestamp: string;
}

export interface Magia {
    nome: string;
    custo: number; // MP cost
    custoVigor: number;
    dano: string; // "Damage/Effect" string
    tipo: string;
    isClassSkill?: boolean;
    descricao?: string;
    duracao?: string;
    castingTime?: string;
    cooldown?: string;
    efeitoNegativo?: string;
}


export interface Vantagem {
    nome: string;
    custo: number;
    descricao: string;
    restricao?: string;
}

export interface Desvantagem {
    nome: string;
    ganho: number;
    descricao: string;
}

export interface SubRaca {
    nome: string;
    descricao: string;
    custoAdicional: number;
    efeito?: { atributo: keyof Ficha; valor: number; } | Array<{ atributo: keyof Ficha; valor: number; }>;
}

export interface Raca {
    nome: string;
    custo: number;
    descricao: string;
    vantagens: string[];
    subRacas?: SubRaca[];
}

export interface ClasseHabilidade {
    nome: string;
    nivel: number;
    tipo: 'ataque' | 'defesa' | 'passiva' | 'utilidade';
    descricao: string;
    dano: string;
    duracao: string;
    castingTime: string;
    cooldown: string;
    efeitoNegativo: string;
    custoMagia: number;
    custoVigor: number;
    efeito?: { atributo: keyof Ficha; valor: number; } | Array<{ atributo: keyof Ficha; valor: number; }>;
    custoPVSemAlma: number;
}


export interface Classe {
    nome: string;
    custo: number; // Custo em Pontos de Vantagem para adquirir a classe
    descricao: string;
    habilidades: ClasseHabilidade[];
}


export interface NivelInfo {
    nivel: number;
    xp: number;
    pd: number;
    ph: number;
}