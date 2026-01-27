/**
 * Lumina AI - Theme Context
 * Provides global theme state (dark/light mode) and AI font size settings
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import userData from '../storage/UserData';
import { colors } from '../styles/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState('auto'); // 'light', 'dark', 'auto'
    const [aiFontSize, setAiFontSize] = useState(16); // Default AI message font size

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await userData.getSettings();
            if (settings.theme) {
                setThemeMode(settings.theme);
            }
            if (settings.aiFontSize) {
                setAiFontSize(settings.aiFontSize);
            }
        } catch (error) {
            console.error('Error loading theme settings:', error);
        }
    };

    const updateThemeMode = async (mode) => {
        setThemeMode(mode);
        await userData.saveSettings({ theme: mode });
    };

    const updateAiFontSize = async (size) => {
        setAiFontSize(size);
        await userData.saveSettings({ aiFontSize: size });
    };

    // Determine if dark mode should be active
    const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark');

    // Get the active color palette
    const themeColors = {
        ...colors,
        ...(isDark ? colors.dark : colors.light)
    };

    const value = {
        isDark,
        themeMode,
        themeColors,
        aiFontSize,
        setThemeMode: updateThemeMode,
        setAiFontSize: updateAiFontSize,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
