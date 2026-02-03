/**
 * Cuidado-Now AI - useChat Hook
 * Hook customizado que encapsula toda a lógica de chat
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import aiService from '../services/AIService';
import userData from '../storage/UserData';
import emergencyService from '../services/EmergencyService';
import voiceService from '../services/VoiceService';
import { TIMING, MOOD_MAP } from '../config/constants';

/**
 * Hook que gerencia todo o estado e lógica do chat
 */
export default function useChat() {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [userName, setUserName] = useState('');
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [showEmergency, setShowEmergency] = useState(false);
    const [showProactiveDialog, setShowProactiveDialog] = useState(false);
    const [proactiveMessage, setProactiveMessage] = useState('');
    const [quickReplies, setQuickReplies] = useState([]);
    const [isResetting, setIsResetting] = useState(false);

    const flatListRef = useRef(null);

    /**
     * Inicia nova conversa com saudação da IA
     */
    const startNewConversation = useCallback(async (name) => {
        const question = aiService.getInitialQuestion(name);
        const aiMsg = {
            id: `ai_${Date.now()}`,
            text: question,
            isUser: false,
            timestamp: new Date().toISOString(),
        };
        setMessages([aiMsg]);
        await userData.addChatMessage(question, false);
    }, []);

    /**
     * Carrega dados do usuário e histórico
     */
    const loadData = useCallback(async () => {
        try {
            const profile = await userData.getProfile();
            setUserName(profile.name || '');

            // Carrega insights para personalização da IA
            const insights = await userData.getInsights();
            aiService.setInsights(insights);

            // Verifica onboarding
            const isOnboarded = await userData.isOnboardingComplete();

            if (!isOnboarded) {
                const welcome = aiService.getWelcomeMessage();
                setProactiveMessage(welcome.text);
                setQuickReplies([]);
                setShowProactiveDialog(true);
                voiceService.speak(welcome.text);

                const welcomeMsg = {
                    id: `ai_${Date.now()}`,
                    text: welcome.text,
                    isUser: false,
                    timestamp: new Date().toISOString(),
                    isWelcome: true,
                };
                setMessages([welcomeMsg]);
                setIsFirstLoad(false);
                return;
            }

            // Carrega histórico ou inicia nova conversa
            const history = await userData.getChatHistory(50);

            if (history.length > 0) {
                setMessages(history);
                setShowProactiveDialog(false);
            } else {
                const greeting = aiService.getInitialQuestion(profile.name);
                setProactiveMessage(greeting);
                voiceService.speak(greeting);

                setQuickReplies([
                    { label: '😊 Estou bem!', text: 'Estou bem, obrigado por perguntar!', icon: 'happy' },
                    { label: '😐 Mais ou menos', text: 'Estou mais ou menos hoje...', icon: 'remove-circle-outline' },
                    { label: '😔 Não muito bem', text: 'Não estou me sentindo muito bem...', icon: 'sad-outline' },
                    { label: '💬 Quero conversar', text: 'Quero conversar sobre algo', icon: 'chatbubbles' },
                ]);
                setShowProactiveDialog(true);
                await startNewConversation(profile.name);
            }

            setIsFirstLoad(false);
        } catch (error) {
            console.error('Erro ao carregar chat:', error);
            setIsFirstLoad(false);
        }
    }, [startNewConversation]);

    /**
     * Handler para resposta de onboarding (nome)
     */
    const handleOnboardingResponse = useCallback(async (text) => {
        const name = text.trim().split(' ')[0];
        await userData.saveProfile({ name, createdAt: new Date().toISOString() });
        await userData.setOnboardingComplete();
        setUserName(name);

        setIsTyping(true);
        setTimeout(async () => {
            const response = aiService.getNameSetMessage(name);
            const aiMsg = {
                id: `ai_${Date.now()}`,
                text: response.text,
                isUser: false,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, aiMsg]);
            await userData.addChatMessage(response.text, false);
            voiceService.speak(response.text);
            setIsTyping(false);
        }, 1000);
    }, []);

    /**
     * Envia mensagem e processa resposta da IA
     */
    const sendMessage = useCallback(async (customText = null) => {
        const text = customText || inputText.trim();
        if (!text) return;

        setInputText('');
        voiceService.stop();

        // Adiciona mensagem do usuário
        const userMsg = {
            id: `user_${Date.now()}`,
            text,
            isUser: true,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMsg]);
        await userData.addChatMessage(text, true);

        // Verifica onboarding
        const isOnboarded = await userData.isOnboardingComplete();
        if (!isOnboarded) {
            await handleOnboardingResponse(text);
            return;
        }

        setIsTyping(true);

        // Delay natural antes da resposta
        const delay = TIMING.TYPING_DELAY_MIN + Math.random() * (TIMING.TYPING_DELAY_MAX - TIMING.TYPING_DELAY_MIN);

        setTimeout(async () => {
            try {
                const response = await aiService.generateResponse(text, messages);

                // Salva humor detectado
                if (response.sentiment) {
                    const mood = MOOD_MAP[response.sentiment.level] || 'okay';
                    await userData.addMoodEntry(mood, text);
                }

                // Adiciona resposta da IA
                const aiMsg = {
                    id: `ai_${Date.now()}`,
                    text: response.text,
                    isUser: false,
                    timestamp: new Date().toISOString(),
                    showEmergency: response.showEmergency,
                    isCrisis: response.isCrisis,
                };
                setMessages(prev => [...prev, aiMsg]);
                await userData.addChatMessage(response.text, false);
                voiceService.speak(response.text);

                setShowEmergency(response.showEmergency);

                // Tratamento de crise
                if (response.isCrisis) {
                    const healthContacts = await emergencyService.getEmergencyContacts();
                    const personalContacts = healthContacts.filter(c => !c.isPermanent);
                    const crisisChoices = healthContacts.map(c => ({
                        ...c,
                        id: `crisis_contact_${c.id}_${Date.now()}`,
                        isContactChip: true,
                    }));

                    setTimeout(() => {
                        setMessages(prev => [...prev, ...crisisChoices]);

                        // Chamada automática
                        if (personalContacts.length > 0) {
                            emergencyService.makeCall(personalContacts[0].phone);
                        } else {
                            emergencyService.callCVV();
                        }
                    }, TIMING.CRISIS_CONTACT_DELAY);
                }

                // Follow-up se não for crise
                if (!response.showEmergency && response.followUp) {
                    setTimeout(async () => {
                        const followUpMsg = {
                            id: `ai_${Date.now()}`,
                            text: response.followUp,
                            isUser: false,
                            timestamp: new Date().toISOString(),
                        };
                        setMessages(prev => [...prev, followUpMsg]);
                        await userData.addChatMessage(response.followUp, false);
                        voiceService.speak(response.followUp);

                        const newSuggestions = aiService.getSuggestions(response.sentiment.level);
                        setSuggestions(newSuggestions);
                    }, TIMING.FOLLOW_UP_DELAY);
                }
            } catch (error) {
                console.error('Erro ao gerar resposta:', error);
            } finally {
                setIsTyping(false);
            }
        }, delay);
    }, [inputText, messages, handleOnboardingResponse]);

    /**
     * Reseta o chat, salvando insights antes de limpar
     */
    const resetChat = useCallback(async () => {
        setIsResetting(true);
        try {
            // Gera e salva resumo da sessão
            const summary = await aiService.generateSessionSummary(messages);
            if (summary) {
                await userData.addInsight(summary);
            }

            // Limpa histórico
            await userData.clearChatHistory();
            setMessages([]);
            setShowProactiveDialog(false);

            // Inicia nova conversa
            const profile = await userData.getProfile();
            await startNewConversation(profile.name);
        } catch (error) {
            console.error('Erro ao resetar chat:', error);
            throw error;
        } finally {
            setIsResetting(false);
        }
    }, [messages, startNewConversation]);

    /**
     * Handler para resposta rápida do diálogo proativo
     */
    const handleQuickReply = useCallback((replyText) => {
        setShowProactiveDialog(false);
        setQuickReplies([]);
        sendMessage(replyText);
    }, [sendMessage]);

    /**
     * Handler para sugestão pressionada
     */
    const handleSuggestionPress = useCallback((suggestion) => {
        sendMessage(`Quero fazer: ${suggestion.title}`);
        setSuggestions([]);
    }, [sendMessage]);

    /**
     * Scroll para o final da lista
     */
    const scrollToEnd = useCallback(() => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages.length]);

    // Scroll automático quando mensagens mudam
    useEffect(() => {
        scrollToEnd();
    }, [messages, isTyping, scrollToEnd]);

    // Cleanup ao desmontar
    useEffect(() => {
        return () => {
            voiceService.stop();
        };
    }, []);

    return {
        // Estado
        messages,
        inputText,
        isTyping,
        suggestions,
        userName,
        isFirstLoad,
        showEmergency,
        showProactiveDialog,
        proactiveMessage,
        quickReplies,
        isResetting,
        flatListRef,

        // Setters
        setInputText,

        // Actions
        loadData,
        sendMessage,
        resetChat,
        handleQuickReply,
        handleSuggestionPress,
        scrollToEnd,
    };
}
