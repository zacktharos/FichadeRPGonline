import React from 'react';
import type { Ficha } from '../types';

export const CompactDerivedStats: React.FC<{ ficha: Ficha }> = ({ ficha }) => {
    const stats = {
        Ataque: ficha.ataque,
        'Atq. Mágico': ficha.ataqueMagico,
        Acerto: ficha.acerto,
        Esquiva: ficha.esquiva,
        RDF: ficha.rdf,
        RDM: ficha.rdm,
    };
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div className="p-3 rounded-lg" style={componentStyle}>
            <h3 className="font-medieval text-lg text-center mb-2">Combate Rápido</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
                {Object.entries(stats).map(([label, value]) => (
                    <div key={label}>
                        <div className="text-xs opacity-80" style={{color: 'var(--accent-color)'}}>{label}</div>
                        <div className="text-xl font-bold">{value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
