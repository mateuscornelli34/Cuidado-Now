/**
 * Cuidado-Now AI - Constantes e Configurações
 * Centralizou todas as constantes utilizadas no aplicativo
 */

// ==================== STORAGE KEYS ====================
export const STORAGE_KEYS = {
    USER_PROFILE: '@mindcare_user_profile',
    EMERGENCY_CONTACTS: '@mindcare_emergency_contacts',
    MOOD_HISTORY: '@mindcare_mood_history',
    CHAT_HISTORY: '@mindcare_chat_history',
    SETTINGS: '@mindcare_settings',
    ONBOARDING_COMPLETE: '@mindcare_onboarding',
    API_KEY: '@mindcare_api_key',
    USER_ID: '@mindcare_user_id',
    VOICE_SETTINGS: '@mindcare_voice_settings',
    FIREBASE_CONFIG: '@mindcare_firebase_config',
};

// ==================== LIMITES E CONFIGURAÇÕES ====================
export const LIMITS = {
    MAX_CHAT_HISTORY: 500,
    MAX_MOOD_HISTORY_DAYS: 90,
    MAX_INSIGHTS: 10,
    MAX_MESSAGE_LENGTH: 500,
    CHAT_HISTORY_LOAD: 50,
    MOOD_HISTORY_LOAD: 30,
};

// ==================== TIMING ====================
export const TIMING = {
    TYPING_DELAY_MIN: 800,
    TYPING_DELAY_MAX: 1500,
    FOLLOW_UP_DELAY: 1500,
    CRISIS_CONTACT_DELAY: 1000,
    ANIMATION_DURATION: 300,
    PULSE_DURATION: 1000,
};

// ==================== CONFIGURAÇÕES PADRÃO ====================
export const DEFAULT_SETTINGS = {
    theme: 'auto',
    therapeuticApproach: 'general',
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
    aiFontSize: 16,
};

// ==================== PERFIL PADRÃO ====================
export const DEFAULT_PROFILE = {
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: '',
    createdAt: null,
    lastCheckIn: null,
    streak: 0,
    insights: [],
    lastSummaryAt: null,
    emergencyPermissionGranted: null,
};

// ==================== CONTATOS PERMANENTES ====================
export const PERMANENT_CONTACTS = [
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

// ==================== ABORDAGENS TERAPÊUTICAS VÁLIDAS ====================
export const VALID_APPROACHES = [
    'general',
    'freud',
    'skinner',
    'deleuze_guattari',
    'foucault',
    'poetry',
    'harm_reduction',
    'mindfulness',
];

// ==================== MAPEAMENTO DE HUMOR ====================
export const MOOD_MAP = {
    positive: 'good',
    neutral: 'okay',
    negative: 'low',
    crisis: 'struggling',
};

export default {
    STORAGE_KEYS,
    LIMITS,
    TIMING,
    DEFAULT_SETTINGS,
    DEFAULT_PROFILE,
    PERMANENT_CONTACTS,
    VALID_APPROACHES,
    MOOD_MAP,
};
