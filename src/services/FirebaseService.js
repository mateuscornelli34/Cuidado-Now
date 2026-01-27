/**
 * MindCare AI - Firebase Service
 * Handles connection to Google's Firebase Firestore for cloud storage
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile as updateAuthProfile
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    FIREBASE_CONFIG: '@mindcare_firebase_config',
};

class FirebaseService {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.config = null;
        this.isInitialized = false;
        this.userId = null;
    }

    /**
     * Initializes Firebase with the provided configuration
     * @param {Object} config - Firebase configuration object
     */
    async initialize(config) {
        if (!config || !config.apiKey || !config.projectId) {
            console.warn('Invalid Firebase Configuration');
            return false;
        }

        try {
            this.config = config;
            this.app = initializeApp(config);
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);
            this.isInitialized = true;

            // Persist config
            await AsyncStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(config));
            console.log('Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Firebase:', error);
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * Auth Methods
     */
    async login(email, password) {
        if (!this.auth) return { success: false, error: 'Firebase not initialized' };
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async register(email, password) {
        if (!this.auth) return { success: false, error: 'Firebase not initialized' };
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async logout() {
        if (!this.auth) return;
        try {
            await signOut(this.auth);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Loads saved configuration from storage and attempts to initialize
     */
    async loadConfig() {
        try {
            const storedConfig = await AsyncStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
            if (storedConfig) {
                const config = JSON.parse(storedConfig);
                return await this.initialize(config);
            }
        } catch (error) {
            console.error('Error loading Firebase config:', error);
        }
        return false;
    }

    /**
     * Sets the user ID for data association
     * In a real app, this would come from Firebase Auth. 
     * Here we just use a simplified approach or we could implement Auth later.
     */
    setUserId(id) {
        this.userId = id;
    }

    /**
     * Saves user profile to Firestore
     */
    async saveUserProfile(profile) {
        if (!this.isInitialized || !this.db || !this.userId) return;

        try {
            const userRef = doc(this.db, 'users', this.userId);
            await setDoc(userRef, {
                ...profile,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving profile to Firebase:', error);
        }
    }

    /**
     * Syncs a chat message to Firestore
     */
    async syncChatMessage(message) {
        if (!this.isInitialized || !this.db || !this.userId) return;

        try {
            const chatsRef = collection(this.db, 'users', this.userId, 'chats');
            // Use the local ID as the document ID to prevent duplicates if feasible, 
            // or just let Firestore generate one. Here we use the local ID.
            const docId = message.id || `msg_${Date.now()}`;
            await setDoc(doc(chatsRef, docId), message);
        } catch (error) {
            console.error('Error syncing chat to Firebase:', error);
        }
    }

    async testConnection() {
        if (!this.isInitialized) return { success: false, error: 'Not Initialized' };
        try {
            // Write a test document
            const testRef = doc(this.db, '_connection_tests', 'test_' + Date.now());
            await setDoc(testRef, { timestamp: new Date().toISOString() });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async resetConfig() {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.FIREBASE_CONFIG);
            this.app = null;
            this.db = null;
            this.isInitialized = false;
            this.config = null;
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Retorna a URL provável do Firebase Hosting
     */
    getHostingUrl() {
        if (this.config && this.config.projectId) {
            return `https://${this.config.projectId}.web.app`;
        }
        return 'https://mindcare-ai.web.app'; // Fallback mais provável que o .com.br
    }
}

const firebaseService = new FirebaseService();
export default firebaseService;
