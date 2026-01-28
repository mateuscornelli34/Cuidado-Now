/**
 * Cuidado-Now AI - Voice Service
 * Gerencia síntese de voz (TTS) para App e Web
 * 
 * OTIMIZADO: Usa configs centralizadas, adicionado queue e callbacks
 */

import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';
import { VOICE_PERSONAS } from '../config/personas';

class VoiceService {
    constructor() {
        this.isEnabled = true;
        this.isSpeaking = false;
        this.currentPersona = 'default';
        this.speechQueue = [];
        this.isProcessingQueue = false;
        this.onSpeakStart = null;
        this.onSpeakComplete = null;
        this.onSpeakError = null;
        this.loadSettings();
    }

    /**
     * Carrega configurações salvas
     */
    async loadSettings() {
        try {
            const settings = await AsyncStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS);
            if (settings !== null) {
                const parsed = JSON.parse(settings);
                this.isEnabled = parsed.isEnabled ?? true;
                this.currentPersona = parsed.currentPersona ?? 'default';
            }
        } catch (error) {
            console.error('Erro ao carregar configurações de voz:', error);
        }
    }

    /**
     * Salva configurações
     */
    async saveSettings() {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.VOICE_SETTINGS, JSON.stringify({
                isEnabled: this.isEnabled,
                currentPersona: this.currentPersona,
            }));
        } catch (error) {
            console.error('Erro ao salvar configurações de voz:', error);
        }
    }

    /**
     * Ativa/desativa voz
     * @param {boolean} enabled - Se a voz está habilitada
     */
    async toggleVoice(enabled) {
        this.isEnabled = enabled;
        await this.saveSettings();
        if (!enabled) {
            this.stop();
            this.clearQueue();
        }
    }

    /**
     * Define a persona de voz atual
     * @param {string} personaId - ID da persona
     */
    async setPersona(personaId) {
        if (VOICE_PERSONAS[personaId]) {
            this.currentPersona = personaId;
            await this.saveSettings();
        }
    }

    /**
     * Retorna lista de todas as personas disponíveis
     * @returns {Array} Lista de personas
     */
    getPersonas() {
        return Object.values(VOICE_PERSONAS);
    }

    /**
     * Retorna a persona atual
     * @returns {Object} Persona atual
     */
    getCurrentPersona() {
        return VOICE_PERSONAS[this.currentPersona] || VOICE_PERSONAS.default;
    }

    /**
     * Limpa a fila de falas
     */
    clearQueue() {
        this.speechQueue = [];
        this.isProcessingQueue = false;
    }

    /**
     * Processa a próxima fala da fila
     * @private
     */
    async _processQueue() {
        if (this.isProcessingQueue || this.speechQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.speechQueue.length > 0) {
            const { text, options } = this.speechQueue.shift();
            await this._speakImmediate(text, options);
        }

        this.isProcessingQueue = false;
    }

    /**
     * Fala imediatamente (uso interno)
     * @private
     */
    async _speakImmediate(text, options = {}) {
        if (!this.isEnabled || !text) return;

        return new Promise((resolve) => {
            try {
                this.isSpeaking = true;
                const persona = this.getCurrentPersona();

                const speechOptions = {
                    language: 'pt-BR',
                    pitch: persona.pitch,
                    rate: persona.rate,
                    onDone: () => {
                        this.isSpeaking = false;
                        if (this.onSpeakComplete) this.onSpeakComplete(text);
                        resolve();
                    },
                    onError: (error) => {
                        this.isSpeaking = false;
                        console.error('Erro na síntese de voz:', error);
                        if (this.onSpeakError) this.onSpeakError(error);
                        resolve();
                    },
                    onStart: () => {
                        if (this.onSpeakStart) this.onSpeakStart(text);
                    },
                    ...options
                };

                Speech.speak(text, speechOptions);
            } catch (error) {
                console.error('Erro ao sintetizar voz:', error);
                this.isSpeaking = false;
                if (this.onSpeakError) this.onSpeakError(error);
                resolve();
            }
        });
    }

    /**
     * Fala o texto fornecido (adiciona à fila)
     * @param {string} text - Texto para falar
     * @param {Object} options - Opções adicionais
     */
    async speak(text, options = {}) {
        if (!this.isEnabled || !text) return;

        // Se já está falando, adiciona à fila
        if (this.isSpeaking) {
            this.speechQueue.push({ text, options });
            return;
        }

        // Fala imediatamente
        await this._speakImmediate(text, options);

        // Processa fila se houver mais itens
        this._processQueue();
    }

    /**
     * Interrompe a fala atual e limpa a fila
     */
    async stop() {
        try {
            await Speech.stop();
            this.isSpeaking = false;
            this.clearQueue();
        } catch (error) {
            console.error('Erro ao parar fala:', error);
        }
    }

    /**
     * Verifica se a IA está falando
     * @returns {boolean}
     */
    isAIVoiceActive() {
        return this.isSpeaking;
    }

    /**
     * Define callbacks para eventos de fala
     * @param {Object} callbacks - { onStart, onComplete, onError }
     */
    setCallbacks(callbacks) {
        if (callbacks.onStart) this.onSpeakStart = callbacks.onStart;
        if (callbacks.onComplete) this.onSpeakComplete = callbacks.onComplete;
        if (callbacks.onError) this.onSpeakError = callbacks.onError;
    }
}

export const voiceService = new VoiceService();
export default voiceService;
