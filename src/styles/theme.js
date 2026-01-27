/**
 * MindCare AI - Sistema de Temas
 * Cores calmantes e acolhedoras para promover bem-estar
 * Tema claro e escuro com paleta relaxante
 */

export const colors = {
    // Cores primárias - tons calmantes e tranquilizadores
    primary: {
        main: '#4A90A4',
        light: '#7BB8C9',
        dark: '#2D6A7F',
        gradient: ['#4A90A4', '#7BB8C9'],
    },

    // Cores de destaque e acentuação
    accent: {
        warm: '#E8B89D',
        soft: '#B8D4E3',
        hope: '#98D4BB',
    },

    // Cores de humor (para feedback visual)
    mood: {
        great: '#7ED399',
        good: '#98D4BB',
        okay: '#E8C87D',
        low: '#E8A87D',
        struggling: '#D4868C',
    },

    // Tema claro
    light: {
        background: '#F7F9FC',
        surface: '#FFFFFF',
        surfaceVariant: '#F0F4F8',
        text: {
            primary: '#2C3E50',
            secondary: '#5D6D7E',
            muted: '#95A5A6',
            inverse: '#FFFFFF',
        },
        border: '#E1E8ED',
        shadow: 'rgba(0, 0, 0, 0.08)',
    },

    // Tema escuro
    dark: {
        background: '#1A2634',
        surface: '#243447',
        surfaceVariant: '#2D4156',
        text: {
            primary: '#ECF0F1',
            secondary: '#B4BEC9',
            muted: '#7F8C8D',
            inverse: '#1A2634',
        },
        border: '#3D5269',
        shadow: 'rgba(0, 0, 0, 0.3)',
    },

    // Estados
    error: '#E74C3C',
    warning: '#F39C12',
    success: '#27AE60',
    info: '#3498DB',

    // Emergência
    emergency: {
        background: '#FFF5F5',
        border: '#E74C3C',
        text: '#C0392B',
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
