/**
 * MindCare AI - Serviço de Armazenamento de Dados do Usuário
 * Gerencia dados locais de forma segura
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves de armazenamento
const STORAGE_KEYS = {
    USER_PROFILE: '@mindcare_user_profile',
    EMERGENCY_CONTACTS: '@mindcare_emergency_contacts',
    MOOD_HISTORY: '@mindcare_mood_history',
    CHAT_HISTORY: '@mindcare_chat_history',
    SETTINGS: '@mindcare_settings',
    ONBOARDING_COMPLETE: '@mindcare_onboarding',
    ONBOARDING_COMPLETE: '@mindcare_onboarding',
    API_KEY: '@mindcare_api_key',
    USER_ID: '@mindcare_user_id',
};

import firebaseService from '../services/FirebaseService';

// Estrutura padrão do perfil
const DEFAULT_PROFILE = {
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: '', // Armazena apenas o número ou nome para referência rápida no perfil
    createdAt: null,
    lastCheckIn: null,
    streak: 0,
    insights: [], // Summarized insights from previous sessions
    lastSummaryAt: null,
    emergencyPermissionGranted: null, // null = not asked, true = granted, false = denied
};

// Configurações padrão
const DEFAULT_SETTINGS = {
    theme: 'auto', // 'light', 'dark', 'auto'
    therapeuticApproach: 'general', // 'general', 'freud', 'skinner', 'deleuze_guattari', 'foucault', 'poetry'
    notifications: {
        enabled: true,
        morningCheckIn: true,
        morningTime: '08:00',
        eveningCheckIn: true,
        eveningTime: '20:00',
        reminders: true,
    },
    privacy: {
        saveHistory: true,
        analyticsEnabled: false,
    },
    voice: {
        enabled: true,
    },
    aiFontSize: 16, // Default AI message font size (12-24)
};

/**
 * Classe para gerenciar dados do usuário
 * Inclui tratamento de erros robusto
 */
class UserDataService {
    constructor() {
        this.init();
    }

    async init() {
        // Initialize User ID
        let uid = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
        if (!uid) {
            uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, uid);
        }
        firebaseService.setUserId(uid);

        // Try to load firebase config
        await firebaseService.loadConfig();
    }

    /**
     * Salva dados com tratamento de erro
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
        return await this.loadData(STORAGE_KEYS.USER_PROFILE, DEFAULT_PROFILE);
    }

    async saveProfile(profile) {
        const currentProfile = await this.getProfile();
        const updatedProfile = {
            ...currentProfile,
            ...profile,
            updatedAt: new Date().toISOString(),
        };
        return await this.saveData(STORAGE_KEYS.USER_PROFILE, updatedProfile);
    }

    async updateProfile(data) {
        return await this.saveProfile(data);
    }

    async getApiKey() {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
        } catch (error) {
            return null;
        }
    }

    async saveApiKey(key) {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, key);
            return true;
        } catch (error) {
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
        const profile = await this.getProfile();
        const insights = profile.insights || [];

        // Add new insight with timestamp
        insights.push({
            text: insight,
            timestamp: new Date().toISOString()
        });

        // Keep last 10 insights to avoid bloating the prompt
        return await this.saveProfile({
            insights: insights.slice(-10),
            lastSummaryAt: new Date().toISOString()
        });
    }

    // ==================== CONTATOS DE EMERGÊNCIA ====================

    async getEmergencyContacts() {
        const defaultContacts = [
            {
                id: 'cvv',
                name: 'CVV - Centro de Valorização da Vida',
                phone: '188',
                type: 'emergency',
                description: 'Apoio emocional 24 horas',
                icon: 'heart',
                color: '#E74C3C',
                isPermanent: true,
            },
            {
                id: 'samu',
                name: 'SAMU',
                phone: '192',
                type: 'emergency',
                description: 'Serviço de Atendimento Móvel de Urgência',
                icon: 'medical',
                color: '#3498DB',
                isPermanent: true,
            },
        ];

        const savedContacts = await this.loadData(STORAGE_KEYS.EMERGENCY_CONTACTS, []);

        // Sempre inclui os contatos permanentes
        return [...defaultContacts, ...savedContacts.filter(c => !c.isPermanent)];
    }

    async addEmergencyContact(contact) {
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

    async getMoodHistory(limit = 30) {
        const history = await this.loadData(STORAGE_KEYS.MOOD_HISTORY, []);
        return history.slice(-limit);
    }

    async addMoodEntry(mood, note = '') {
        const history = await this.loadData(STORAGE_KEYS.MOOD_HISTORY, []);
        const entry = {
            id: `mood_${Date.now()}`,
            mood,
            note,
            timestamp: new Date().toISOString(),
        };
        history.push(entry);

        // Mantém apenas os últimos 90 dias
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const filtered = history.filter(
            e => new Date(e.timestamp) > ninetyDaysAgo
        );

        return await this.saveData(STORAGE_KEYS.MOOD_HISTORY, filtered);
    }

    async getTodaysMood() {
        const history = await this.getMoodHistory();
        const today = new Date().toDateString();
        return history.find(
            e => new Date(e.timestamp).toDateString() === today
        );
    }

    // ==================== HISTÓRICO DE CHAT ====================

    async getChatHistory(limit = 100) {
        const history = await this.loadData(STORAGE_KEYS.CHAT_HISTORY, []);
        return history.slice(-limit);
    }

    async addChatMessage(message, isUser = true) {
        const settings = await this.getSettings();
        if (!settings.privacy.saveHistory) {
            return { success: true }; // Não salva se desabilitado
        }

        const history = await this.loadData(STORAGE_KEYS.CHAT_HISTORY, []);
        const entry = {
            id: `msg_${Date.now()}`,
            text: message,
            isUser,
            timestamp: new Date().toISOString(),
        };
        history.push(entry);

        // Mantém apenas as últimas 500 mensagens
        const limited = history.slice(-500);

        return await this.saveData(STORAGE_KEYS.CHAT_HISTORY, limited);
    }

    async clearChatHistory() {
        return await this.saveData(STORAGE_KEYS.CHAT_HISTORY, []);
    }

    // ==================== CONFIGURAÇÕES ====================

    async getSettings() {
        return await this.loadData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }

    async saveSettings(settings) {
        const currentSettings = await this.getSettings();
        const updatedSettings = {
            ...currentSettings,
            ...settings,
        };
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
                moodHistory: await this.getMoodHistory(90),
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
