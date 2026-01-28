/**
 * Cuidado-Now AI - Serviço de Armazenamento de Dados do Usuário
 * Gerencia dados locais de forma segura
 * 
 * OTIMIZADO: Corrigida duplicação de chave, adicionado cache em memória
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    STORAGE_KEYS,
    LIMITS,
    DEFAULT_PROFILE,
    DEFAULT_SETTINGS,
    PERMANENT_CONTACTS
} from '../config/constants';
import firebaseService from '../services/FirebaseService';

/**
 * Classe para gerenciar dados do usuário
 * Inclui cache em memória para dados frequentes
 */
class UserDataService {
    constructor() {
        // Cache em memória
        this._cache = {
            profile: null,
            settings: null,
            lastCacheUpdate: null,
        };
        this._cacheExpiry = 5 * 60 * 1000; // 5 minutos

        this.init();
    }

    async init() {
        try {
            // Inicializa User ID
            let uid = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
            if (!uid) {
                uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, uid);
            }
            firebaseService.setUserId(uid);

            // Tenta carregar config do Firebase
            await firebaseService.loadConfig();
        } catch (error) {
            console.error('Erro ao inicializar UserData:', error);
        }
    }

    /**
     * Verifica se o cache ainda é válido
     * @private
     */
    _isCacheValid() {
        if (!this._cache.lastCacheUpdate) return false;
        return (Date.now() - this._cache.lastCacheUpdate) < this._cacheExpiry;
    }

    /**
     * Invalida o cache
     * @private
     */
    _invalidateCache() {
        this._cache.profile = null;
        this._cache.settings = null;
        this._cache.lastCacheUpdate = null;
    }

    /**
     * Salva dados com tratamento de erro
     * @param {string} key - Chave de armazenamento
     * @param {*} data - Dados a salvar
     */
    async saveData(key, data) {
        try {
            const jsonValue = JSON.stringify(data);
            await AsyncStorage.setItem(key, jsonValue);
            return { success: true };
        } catch (error) {
            console.error(`Erro ao salvar dados (${key}):`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Carrega dados com tratamento de erro e valor padrão
     * @param {string} key - Chave de armazenamento
     * @param {*} defaultValue - Valor padrão se não existir
     */
    async loadData(key, defaultValue = null) {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            if (jsonValue === null) {
                return defaultValue;
            }
            return JSON.parse(jsonValue);
        } catch (error) {
            console.error(`Erro ao carregar dados (${key}):`, error);
            return defaultValue;
        }
    }

    // ==================== PERFIL DO USUÁRIO ====================

    async getProfile() {
        // Tenta usar cache
        if (this._cache.profile && this._isCacheValid()) {
            return this._cache.profile;
        }

        const profile = await this.loadData(STORAGE_KEYS.USER_PROFILE, DEFAULT_PROFILE);

        // Atualiza cache
        this._cache.profile = profile;
        this._cache.lastCacheUpdate = Date.now();

        return profile;
    }

    async saveProfile(profile) {
        const currentProfile = await this.getProfile();
        const updatedProfile = {
            ...currentProfile,
            ...profile,
            updatedAt: new Date().toISOString(),
        };

        // Invalida cache
        this._cache.profile = updatedProfile;

        const result = await this.saveData(STORAGE_KEYS.USER_PROFILE, updatedProfile);

        // Sincroniza com Firebase se disponível
        if (result.success) {
            firebaseService.saveUserProfile(updatedProfile);
        }

        return result;
    }

    async updateProfile(data) {
        return await this.saveProfile(data);
    }

    async getApiKey() {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
        } catch (error) {
            console.error('Erro ao obter API key:', error);
            return null;
        }
    }

    async saveApiKey(key) {
        try {
            if (!key || typeof key !== 'string') {
                return false;
            }
            await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
            return true;
        } catch (error) {
            console.error('Erro ao salvar API key:', error);
            return false;
        }
    }

    async isOnboardingComplete() {
        return await this.loadData(STORAGE_KEYS.ONBOARDING_COMPLETE, false);
    }

    async setOnboardingComplete() {
        return await this.saveData(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    }

    // ==================== INSIGHTS DA IA ====================

    async getInsights() {
        const profile = await this.getProfile();
        return profile.insights || [];
    }

    async addInsight(insight) {
        if (!insight || typeof insight !== 'string') {
            return { success: false, error: 'Insight inválido' };
        }

        const profile = await this.getProfile();
        const insights = profile.insights || [];

        insights.push({
            text: insight.trim(),
            timestamp: new Date().toISOString()
        });

        // Mantém apenas os últimos N insights
        return await this.saveProfile({
            insights: insights.slice(-LIMITS.MAX_INSIGHTS),
            lastSummaryAt: new Date().toISOString()
        });
    }

    // ==================== CONTATOS DE EMERGÊNCIA ====================

    async getEmergencyContacts() {
        const savedContacts = await this.loadData(STORAGE_KEYS.EMERGENCY_CONTACTS, []);
        // Sempre inclui os contatos permanentes
        return [...PERMANENT_CONTACTS, ...savedContacts.filter(c => !c.isPermanent)];
    }

    async addEmergencyContact(contact) {
        if (!contact || !contact.name || !contact.phone) {
            return { success: false, error: 'Contato inválido' };
        }

        const contacts = await this.loadData(STORAGE_KEYS.EMERGENCY_CONTACTS, []);
        const newContact = {
            id: `contact_${Date.now()}`,
            ...contact,
            type: 'personal',
            createdAt: new Date().toISOString(),
        };
        contacts.push(newContact);
        return await this.saveData(STORAGE_KEYS.EMERGENCY_CONTACTS, contacts);
    }

    async removeEmergencyContact(contactId) {
        const contacts = await this.loadData(STORAGE_KEYS.EMERGENCY_CONTACTS, []);
        const filtered = contacts.filter(c => c.id !== contactId && !c.isPermanent);
        return await this.saveData(STORAGE_KEYS.EMERGENCY_CONTACTS, filtered);
    }

    // ==================== HISTÓRICO DE HUMOR ====================

    async getMoodHistory(limit = LIMITS.MOOD_HISTORY_LOAD) {
        const history = await this.loadData(STORAGE_KEYS.MOOD_HISTORY, []);
        return history.slice(-limit);
    }

    async addMoodEntry(mood, note = '') {
        if (!mood) {
            return { success: false, error: 'Humor inválido' };
        }

        const history = await this.loadData(STORAGE_KEYS.MOOD_HISTORY, []);
        const entry = {
            id: `mood_${Date.now()}`,
            mood,
            note: note ? note.substring(0, 200) : '', // Limita tamanho da nota
            timestamp: new Date().toISOString(),
        };
        history.push(entry);

        // Mantém apenas os últimos N dias
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - LIMITS.MAX_MOOD_HISTORY_DAYS);
        const filtered = history.filter(e => new Date(e.timestamp) > cutoffDate);

        return await this.saveData(STORAGE_KEYS.MOOD_HISTORY, filtered);
    }

    async getTodaysMood() {
        const history = await this.getMoodHistory();
        const today = new Date().toDateString();
        return history.find(e => new Date(e.timestamp).toDateString() === today);
    }

    // ==================== HISTÓRICO DE CHAT ====================

    async getChatHistory(limit = LIMITS.CHAT_HISTORY_LOAD) {
        const history = await this.loadData(STORAGE_KEYS.CHAT_HISTORY, []);
        return history.slice(-limit);
    }

    async addChatMessage(message, isUser = true) {
        const settings = await this.getSettings();
        if (!settings.privacy.saveHistory) {
            return { success: true };
        }

        if (!message || typeof message !== 'string') {
            return { success: false, error: 'Mensagem inválida' };
        }

        const history = await this.loadData(STORAGE_KEYS.CHAT_HISTORY, []);
        const entry = {
            id: `msg_${Date.now()}`,
            text: message,
            isUser,
            timestamp: new Date().toISOString(),
        };
        history.push(entry);

        // Mantém apenas as últimas N mensagens
        const limited = history.slice(-LIMITS.MAX_CHAT_HISTORY);

        const result = await this.saveData(STORAGE_KEYS.CHAT_HISTORY, limited);

        // Sincroniza com Firebase
        if (result.success) {
            firebaseService.syncChatMessage(entry);
        }

        return result;
    }

    async clearChatHistory() {
        return await this.saveData(STORAGE_KEYS.CHAT_HISTORY, []);
    }

    // ==================== CONFIGURAÇÕES ====================

    async getSettings() {
        // Tenta usar cache
        if (this._cache.settings && this._isCacheValid()) {
            return this._cache.settings;
        }

        const settings = await this.loadData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

        // Atualiza cache
        this._cache.settings = settings;

        return settings;
    }

    async saveSettings(settings) {
        const currentSettings = await this.getSettings();
        const updatedSettings = {
            ...currentSettings,
            ...settings,
        };

        // Atualiza cache
        this._cache.settings = updatedSettings;

        return await this.saveData(STORAGE_KEYS.SETTINGS, updatedSettings);
    }

    async updateNotificationSettings(notificationSettings) {
        const settings = await this.getSettings();
        return await this.saveSettings({
            ...settings,
            notifications: {
                ...settings.notifications,
                ...notificationSettings,
            },
        });
    }

    // ==================== UTILIDADES ====================

    async clearAllData() {
        try {
            const keys = Object.values(STORAGE_KEYS);
            await AsyncStorage.multiRemove(keys);
            this._invalidateCache();
            return { success: true };
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            return { success: false, error: error.message };
        }
    }

    async exportData() {
        try {
            const data = {
                profile: await this.getProfile(),
                contacts: await this.getEmergencyContacts(),
                moodHistory: await this.getMoodHistory(LIMITS.MAX_MOOD_HISTORY_DAYS),
                settings: await this.getSettings(),
                exportedAt: new Date().toISOString(),
            };
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            return { success: false, error: error.message };
        }
    }
}

// Exporta instância única
export const userData = new UserDataService();
export default userData;
