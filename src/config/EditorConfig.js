/**
 * Configurações do Editor de Documentos
 * Fontes, tamanhos e cores
 */

export const FONTS = [
    // Sans-Serif
    { id: 'arial', name: 'Arial', family: 'Arial, sans-serif' },
    { id: 'arial-black', name: 'Arial Black', family: '"Arial Black", sans-serif' },
    { id: 'comic-sans', name: 'Comic Sans MS', family: '"Comic Sans MS", cursive' },
    { id: 'impact', name: 'Impact', family: 'Impact, sans-serif' },
    { id: 'lucida-sans', name: 'Lucida Sans', family: '"Lucida Sans Unicode", sans-serif' },
    { id: 'tahoma', name: 'Tahoma', family: 'Tahoma, sans-serif' },
    { id: 'trebuchet', name: 'Trebuchet MS', family: '"Trebuchet MS", sans-serif' },
    { id: 'verdana', name: 'Verdana', family: 'Verdana, sans-serif' },
    // Serif
    { id: 'times', name: 'Times New Roman', family: '"Times New Roman", serif' },
    { id: 'georgia', name: 'Georgia', family: 'Georgia, serif' },
    { id: 'palatino', name: 'Palatino', family: '"Palatino Linotype", serif' },
    { id: 'book-antiqua', name: 'Book Antiqua', family: '"Book Antiqua", serif' },
    { id: 'garamond', name: 'Garamond', family: 'Garamond, serif' },
    // Monospace
    { id: 'courier', name: 'Courier New', family: '"Courier New", monospace' },
    { id: 'lucida-console', name: 'Lucida Console', family: '"Lucida Console", monospace' },
    { id: 'consolas', name: 'Consolas', family: 'Consolas, monospace' },
    // Display
    { id: 'brush-script', name: 'Brush Script MT', family: '"Brush Script MT", cursive' },
    { id: 'copperplate', name: 'Copperplate', family: 'Copperplate, fantasy' },
];

export const FONT_SIZES = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72, 96];

// Paleta de cores completa estilo Google Docs
export const TEXT_COLORS = [
    // Linha 1 - Pretos e cinzas
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    // Linha 2 - Vermelhos
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    // Linha 3 - Tons pastéis
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    // Linha 4 - Tons médios
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    // Linha 5 - Tons escuros
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
];

// Cores de destaque/highlight
export const HIGHLIGHT_COLORS = [
    'transparent', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff0000',
    '#ffd966', '#93c47d', '#6fa8dc', '#8e7cc3', '#f4cccc', '#fff2cc',
];

// Espaçamentos de linha
export const LINE_SPACINGS = [
    { id: '1', name: 'Simples', value: 1.0 },
    { id: '1.15', name: '1,15', value: 1.15 },
    { id: '1.5', name: '1,5', value: 1.5 },
    { id: '2', name: 'Duplo', value: 2.0 },
    { id: '2.5', name: '2,5', value: 2.5 },
    { id: '3', name: 'Triplo', value: 3.0 },
];
