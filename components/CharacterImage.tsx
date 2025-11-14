import React from 'react';

interface CharacterImageProps {
    image: string | null;
    onUpdate: (image: string | null) => void;
}

export const CharacterImage: React.FC<CharacterImageProps> = ({ image, onUpdate }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the file dialog
        onUpdate(null);
    };
    
    const componentStyle = { backgroundColor: 'var(--component-bg-color)' };

    return (
        <div
            onClick={handleImageClick}
            className="w-32 h-40 flex-shrink-0 rounded-lg bg-stone-800 border-2 border-dashed border-stone-600 flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:bg-stone-700 transition-colors relative group"
            title="Alterar imagem do personagem"
            style={componentStyle}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            {image ? (
                <>
                    <img src={image} alt="Personagem" className="w-full h-full object-cover rounded-md" />
                    <button
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 bg-red-700/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover Imagem"
                    >
                        X
                    </button>
                </>
            ) : (
                <div className="opacity-70 text-sm">
                    <span className="text-3xl">🖼️</span>
                    <p>Adicionar Imagem</p>
                </div>
            )}
        </div>
    );
};
