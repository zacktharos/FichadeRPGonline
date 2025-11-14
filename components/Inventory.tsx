import React, { useState, useEffect, useRef } from 'react';
import type { Ficha, InventarioItem } from '../types';

interface InventoryProps {
    ficha: Ficha;
    onUpdate: <K extends keyof Ficha>(key: K, value: Ficha[K]) => void;
    onRecalculate: (ficha: Ficha) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ ficha, onUpdate }) => {
    const [goldAmount, setGoldAmount] = useState('1');
    const [silverAmount, setSilverAmount] = useState('1');
    const [bronzeAmount, setBronzeAmount] = useState('1');

    const handleCurrencyUpdate = (
        currency: 'moedasOuro' | 'moedasPrata' | 'moedasBronze',
        operation: 'add' | 'subtract',
        amountStr: string
    ) => {
        const amount = parseInt(amountStr, 10) || 0;
        if (amount <= 0) return;

        const currentValue = ficha[currency];
        let newValue;

        if (operation === 'add') {
            newValue = currentValue + amount;
        } else {
            newValue = Math.max(0, currentValue - amount);
        }
        
        onUpdate(currency, newValue);
    };


    const handleItemChange = (index: number, field: keyof InventarioItem, value: string) => {
        const newInventory = [...ficha.inventario];
        const item = { ...newInventory[index] };
        
        if (field === 'peso') {
            item[field] = parseFloat(value) || 0;
        } else {
            item[field] = value;
        }

        newInventory[index] = item;
        onUpdate('inventario', newInventory);
    };

    const addItemSlot = () => {
        const newInventory = [...ficha.inventario, { item: '', peso: 0 }];
        onUpdate('inventario', newInventory);
    };

    const removeItemSlot = (index: number) => {
        const newInventory = ficha.inventario.filter((_, i) => i !== index);
        onUpdate('inventario', newInventory);
    }

    const pesoColor = ficha.pesoTotal > ficha.capacidadeCarga ? 'text-red-500' : 'var(--text-color)';
    const componentStyle = { backgroundColor: 'var(--component-bg-color)', color: 'var(--text-color)' };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-medieval text-lg">Itens</h3>
                <span className={`text-sm font-mono`} style={{ color: pesoColor }}>
                    {ficha.pesoTotal.toFixed(1)} / {ficha.capacidadeCarga} kg
                </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {ficha.inventario.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder={`Item ${index + 1}`}
                            value={item.item}
                            onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                            className="flex-grow p-2 border border-stone-600 rounded-md"
                            style={componentStyle}
                        />
                        <input
                            type="number"
                            value={item.peso}
                            onChange={(e) => handleItemChange(index, 'peso', e.target.value)}
                            className="w-20 p-2 border border-stone-600 rounded-md text-center"
                            title="Peso em kg"
                            style={componentStyle}
                        />
                        <button onClick={() => removeItemSlot(index)} className="btn-interactive w-8 h-8 rounded-md bg-red-800 hover:bg-red-700 text-white flex-shrink-0">-</button>
                    </div>
                ))}
            </div>
            <button onClick={addItemSlot} className="btn-interactive mt-2 w-full py-1 bg-stone-700 hover:bg-stone-600 rounded-md text-sm text-white">Adicionar Item</button>
            
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="font-medieval text-lg mb-3">Dinheiro</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded-md" style={componentStyle}>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">💰</span>
                             <div className="flex flex-col items-start">
                                <span className="font-bold">Ouro</span>
                                <span className="font-mono text-base">{ficha.moedasOuro}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleCurrencyUpdate('moedasOuro', 'subtract', goldAmount)} className="btn-interactive w-7 h-7 rounded-md bg-red-800 text-white">-</button>
                            <input
                                type="number"
                                value={goldAmount}
                                onChange={(e) => setGoldAmount(e.target.value)}
                                className="w-16 p-1 border border-stone-600 rounded-md text-center"
                                style={componentStyle}
                                onFocus={(e) => e.target.select()}
                            />
                            <button onClick={() => handleCurrencyUpdate('moedasOuro', 'add', goldAmount)} className="btn-interactive w-7 h-7 rounded-md bg-green-800 text-white">+</button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md" style={componentStyle}>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">💰</span>
                             <div className="flex flex-col items-start">
                                <span className="font-bold">Prata</span>
                                <span className="font-mono text-base">{ficha.moedasPrata}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleCurrencyUpdate('moedasPrata', 'subtract', silverAmount)} className="btn-interactive w-7 h-7 rounded-md bg-red-800 text-white">-</button>
                             <input
                                type="number"
                                value={silverAmount}
                                onChange={(e) => setSilverAmount(e.target.value)}
                                className="w-16 p-1 border border-stone-600 rounded-md text-center"
                                style={componentStyle}
                                onFocus={(e) => e.target.select()}
                            />
                            <button onClick={() => handleCurrencyUpdate('moedasPrata', 'add', silverAmount)} className="btn-interactive w-7 h-7 rounded-md bg-green-800 text-white">+</button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md" style={componentStyle}>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">💰</span>
                             <div className="flex flex-col items-start">
                                <span className="font-bold">Bronze</span>
                                <span className="font-mono text-base">{ficha.moedasBronze}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleCurrencyUpdate('moedasBronze', 'subtract', bronzeAmount)} className="btn-interactive w-7 h-7 rounded-md bg-red-800 text-white">-</button>
                            <input
                                type="number"
                                value={bronzeAmount}
                                onChange={(e) => setBronzeAmount(e.target.value)}
                                className="w-16 p-1 border border-stone-600 rounded-md text-center"
                                style={componentStyle}
                                onFocus={(e) => e.target.select()}
                            />
                            <button onClick={() => handleCurrencyUpdate('moedasBronze', 'add', bronzeAmount)} className="btn-interactive w-7 h-7 rounded-md bg-green-800 text-white">+</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};