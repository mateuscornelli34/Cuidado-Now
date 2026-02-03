/**
 * Cuidado-Now AI - Sistema de Temas
 * Cores calmantes e acolhedoras para promover bem-estar
 * Tema claro e escuro com paleta relaxante
 */

export const colors = {
    // Professional & Clinical Blue Palette
    primary: {
        main: '#0052CC', // Trusted Blue
        light: '#4C9AFF', // Soft Blue
        dark: '#172B4D', // Deep Navy
        gradient: ['#0052CC', '#2684FF'],
    },

    // Acentuação com foco em calma e confiança
    accent: {
        warm: '#FFBDAE', // Soft Peach
        soft: '#EAE6FF', // Lavender
        hope: '#36B37E', // Success Green
        info: '#6554C0', // Purple for deeper actions
    },

    // Feedback visual (Cores de status profissional)
    mood: {
        great: '#36B37E', // Green
        good: '#79F2C0', // Light Green
        okay: '#FFAB00', // Amber
        low: '#FF8B00', // Orange
        struggling: '#BF2600', // Red
    },

    // Tema claro (Clean & Medical)
    light: {
        background: '#FAFBFC', // Very light gray, almost white
        surface: '#FFFFFF', // Pure white
        surfaceVariant: '#EBECF0', // Light gray for inputs/secondary
        text: {
            primary: '#172B4D', // Dark Navy for readable text
            secondary: '#505F79', // Slate gray
            muted: '#97A0AF', // Muted gray
            inverse: '#FFFFFF',
        },
        border: '#DFE1E6', // Subtle border
        shadow: 'rgba(9, 30, 66, 0.15)', // Professional shadow
    },

    // Tema escuro (Sleek & Focused)
    dark: {
        background: '#091E42', // Deep Navy Background
        surface: '#172B4D', // Darker Surface
        surfaceVariant: '#253858', // Input variant
        text: {
            primary: '#EBECF0', // Light gray
            secondary: '#B3BAC5', // Soft gray
            muted: '#7A869A', // Muted
            inverse: '#091E42',
        },
        border: '#42526E', // Dark border
        shadow: 'rgba(0, 0, 0, 0.5)',
    },

    // Estados universais
    error: '#DE350B',
    warning: '#FF991F',
    success: '#36B37E',
    info: '#0065FF',

    // Emergência (Distinct & Clear)
    emergency: {
        background: '#FFEBE6',
        border: '#FF5630',
        text: '#BF2600',
    },
};

export const typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 22,
        xxl: 28,
        display: 36,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 8,
    },
};

// Função auxiliar para obter tema baseado no modo
export const getTheme = (isDark = false) => {
    const themeColors = isDark ? colors.dark : colors.light;

    return {
        colors: {
            ...colors,
            ...themeColors,
        },
        typography,
        spacing,
        borderRadius,
        shadows,
        isDark,
    };
};

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    getTheme,
};
