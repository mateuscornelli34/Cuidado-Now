/**
 * Lumina AI - Voice Service
 * Gerencia síntese de voz (TTS) para App e Web
 * Opções de vozes inspiradas em artistas do MPB
 */

import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VOICE_SETTINGS_KEY = '@mindcare_voice_settings';

// Vozes inspiradas em artistas do MPB brasileiro
export const VOICE_PERSONAS = {
    default: {
        id: 'default',
        name: 'Padrão',
        description: 'Voz natural e equilibrada',
        pitch: 1.0,
        rate: 1.0,
        icon: 'mic',
    },
    elis: {
        id: 'elis',
        name: 'Elis',
        description: 'Intensa e emotiva (inspirada em Elis Regina)',
        pitch: 1.15,
        rate: 0.95,
        icon: 'musical-notes',
    },
    milton: {
        id: 'milton',
        name: 'Milton',
        description: 'Grave e profunda (inspirada em Milton Nascimento)',
        pitch: 0.6, // Deepened significantly
        rate: 0.85, // Slower
        icon: 'musical-note',
    },
    gal: {
        id: 'gal',
        name: 'Gal',
        description: 'Suave e calorosa (inspirada em Gal Costa)',
        pitch: 1.1,
        rate: 1.0,
        icon: 'heart',
    },
    caetano: {
        id: 'caetano',
        name: 'Caetano',
        description: 'Calma e poética (inspirada em Caetano Veloso)',
        pitch: 0.95,
        rate: 0.85,
        icon: 'leaf',
    },
    maria: {
        id: 'maria',
        name: 'Maria',
        description: 'Doce e acolhedora (inspirada em Maria Bethânia)',
        pitch: 1.05,
        rate: 0.9,
        icon: 'flower',
    },
    gilberto: {
        id: 'gilberto',
        name: 'Gilberto',
        description: 'Serena e relaxante (inspirada em Gilberto Gil)',
        pitch: 0.88,
        rate: 0.95,
        icon: 'sunny',
    },
    rita: {
        id: 'rita',
        name: 'Rita',
        description: 'Irreverente e explosiva (inspirada em Rita Lee)',
        pitch: 1.3, // Higher
        rate: 1.15, // Faster
        icon: 'flash',
    },
    dinho: {
        id: 'dinho',
        name: 'Dinho',
        description: 'Energética e divertida (inspirada em Dinho - Mamonas)',
        pitch: 1.3,
        rate: 1.15,
        icon: 'rocket',
    },
    raul: {
        id: 'raul',
        name: 'Raul',
        description: 'Rebelde e filosófica (inspirada em Raul Seixas)',
        pitch: 0.7, // Lower/Raspy simulation
        rate: 0.9,
        icon: 'skull',
    },
    chico: {
        id: 'chico',
        name: 'Chico',
        description: 'Rítmica e inovadora (inspirada em Chico Science)',
        pitch: 0.92,
        rate: 1.05,
        icon: 'planet',
    },
    mano: {
        id: 'mano',
        name: 'Mano Brown',
        description: 'Profunda e impactante (inspirada em Mano Brown)',
        pitch: 0.55, // Very deep
        rate: 0.85,  // Slow and deliberate
        icon: 'megaphone',
    },
    emicida: {
        id: 'emicida',
        name: 'Emicida',
        description: 'Eloquente e inspiradora (inspirada em Emicida)',
        pitch: 0.9,
        rate: 0.95,
        icon: 'mic',
    },
    criolo: {
        id: 'criolo',
        name: 'Criolo',
        description: 'Poética e intensa (inspirada em Criolo)',
        pitch: 0.82,
        rate: 0.9,
        icon: 'flame',
    },
    pitty: {
        id: 'pitty',
        name: 'Pitty',
        description: 'Forte e emotiva (inspirada em Pitty)',
        pitch: 1.08,
        rate: 1.0,
        icon: 'thunderstorm',
    },
};

class VoiceService {
    constructor() {
        this.isEnabled = true;
        this.isSpeaking = false;
        this.currentPersona = 'default';
        this.loadSettings();
    }

    async loadSettings() {
        try {
            const settings = await AsyncStorage.getItem(VOICE_SETTINGS_KEY);
            if (settings !== null) {
                const parsed = JSON.parse(settings);
                this.isEnabled = parsed.isEnabled ?? true;
                this.currentPersona = parsed.currentPersona ?? 'default';
            }
        } catch (error) {
            console.error('Erro ao carregar configurações de voz:', error);
        }
    }

    async toggleVoice(enabled) {
        this.isEnabled = enabled;
        await this.saveSettings();
        if (!enabled) {
            this.stop();
        }
    }

    async setPersona(personaId) {
        if (VOICE_PERSONAS[personaId]) {
            this.currentPersona = personaId;
            await this.saveSettings();
        }
    }

    async saveSettings() {
        await AsyncStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify({
            isEnabled: this.isEnabled,
            currentPersona: this.currentPersona,
        }));
    }

    getPersonas() {
        return Object.values(VOICE_PERSONAS);
    }

    getCurrentPersona() {
        return VOICE_PERSONAS[this.currentPersona] || VOICE_PERSONAS.default;
    }

    /**
     * Fala o texto fornecido
     * @param {string} text - Texto para falar
     * @param {Object} options - Opções (pitch, rate, language)
     */
    async speak(text, options = {}) {
        if (!this.isEnabled || !text) return;

        try {
            this.isSpeaking = true;
            const persona = this.getCurrentPersona();

            // Opções padrão para português brasileiro com persona aplicada
            const defaultOptions = {
                language: 'pt-BR',
                pitch: persona.pitch,
                rate: persona.rate,
                onDone: () => { this.isSpeaking = false; },
                onError: () => { this.isSpeaking = false; },
                ...options
            };

            if (Platform.OS === 'web') {
                await Speech.speak(text, defaultOptions);
            } else {
                await Speech.speak(text, defaultOptions);
            }
        } catch (error) {
            console.error('Erro ao sintetizar voz:', error);
            this.isSpeaking = false;
        }
    }

    /**
     * Interrompe a fala atual
     */
    async stop() {
        try {
            await Speech.stop();
            this.isSpeaking = false;
        } catch (error) {
            console.error('Erro ao parar fala:', error);
        }
    }

    /**
     * Verifica se a IA está falando
     */
    isAIVoiceActive() {
        return this.isSpeaking;
    }
}

export const voiceService = new VoiceService();
export default voiceService;
