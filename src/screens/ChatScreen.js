/**
 * MindCare AI - Tela de Conversa
 * Interface de chat empática com respostas de apoio emocional
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Animated,
    Alert,
    Modal,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, borderRadius, shadows, typography } from '../styles/theme';
import aiService from '../services/AIService';
import userData from '../storage/UserData';
import emergencyService from '../services/EmergencyService';
import { useTheme } from '../context/ThemeContext';
import voiceService from '../services/VoiceService';

const { width } = Dimensions.get('window');

// Componente de mensagem individual
const MessageBubble = ({ message, showEmergency, onEmergencyPress, aiFontSize, styles, themeColors }) => {
    const isUser = message.isUser;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.messageBubbleContainer,
                isUser ? styles.userBubbleContainer : styles.aiBubbleContainer,
                { opacity: fadeAnim },
            ]}
        >
            {!isUser && (
                <View style={styles.aiAvatar}>
                    <Ionicons name="heart" size={16} color={themeColors.surface} />
                </View>
            )}
            <View
                style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                ]}
            >
                <Text style={[styles.messageText, isUser ? styles.userMessageText : { fontSize: aiFontSize }]}>
                    {message.text}
                </Text>
                <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
                    {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>
            {showEmergency && !isUser && (
                <TouchableOpacity
                    style={styles.emergencyInlineButton}
                    onPress={onEmergencyPress}
                >
                    <Ionicons name="call" size={18} color={themeColors.surface} />
                    <Text style={styles.emergencyInlineText}>Preciso de ajuda</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

// Componente para contatos rápidos em crise
const CrisisContactChip = ({ contact, onPress, styles, themeColors }) => (
    <TouchableOpacity
        style={[styles.crisisContactChip, { borderColor: contact.color || themeColors.error }]}
        onPress={() => onPress(contact.phone)}
    >
        <Ionicons name={contact.icon || 'call'} size={18} color={contact.color || themeColors.error} />
        <View style={styles.crisisContactInfo}>
            <Text style={styles.crisisContactName}>{contact.name}</Text>
            <Text style={styles.crisisContactPhone}>{contact.phone}</Text>
        </View>
    </TouchableOpacity>
);

// Componente de sugestão
const SuggestionChip = ({ suggestion, onPress, styles, themeColors }) => (
    <TouchableOpacity style={styles.suggestionChip} onPress={onPress}>
        <Ionicons name={suggestion.icon || 'bulb'} size={16} color={themeColors.primary.main} />
        <Text style={styles.suggestionText}>{suggestion.title}</Text>
    </TouchableOpacity>
);

// Indicador de digitação
const TypingIndicator = ({ styles, themeColors }) => {
    const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

    useEffect(() => {
        const animations = dots.map((dot, index) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(index * 150),
                    Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
                ])
            )
        );
        Animated.parallel(animations).start();
    }, []);

    return (
        <View style={styles.typingContainer}>
            <View style={styles.aiAvatar}>
                <Ionicons name="heart" size={16} color={themeColors.surface} />
            </View>
            <View style={styles.typingBubble}>
                {dots.map((dot, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.typingDot,
                            { transform: [{ translateY: Animated.multiply(dot, -4) }] },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

// Caixa de Diálogo Proativa da IA - aparece automaticamente
const ProactiveDialog = ({ message, onQuickReply, quickReplies = [], styles, themeColors }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animação de entrada
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // Animação de pulso no avatar
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.proactiveDialogContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            {/* Avatar animado */}
            <Animated.View style={[styles.proactiveAvatar, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="heart" size={28} color={themeColors.surface} />
            </Animated.View>

            {/* Respostas rápidas */}
            {quickReplies.length > 0 && (
                <View style={styles.quickRepliesContainer}>
                    {quickReplies.map((reply, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.quickReplyButton}
                            onPress={() => onQuickReply(reply.text)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name={reply.icon || 'chatbubble'} size={16} color={themeColors.primary.main} />
                            <Text style={styles.quickReplyText}>{reply.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </Animated.View>
    );
};

export default function ChatScreen({ navigation, route }) {
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
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [currentVoice, setCurrentVoice] = useState(voiceService.getCurrentPersona());
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(voiceService.isEnabled);
    const flatListRef = useRef(null);

    const { themeColors, aiFontSize } = useTheme();
    const styles = useMemo(() => getStyles(themeColors), [themeColors]);

    useEffect(() => {
        // Sync voice state on mount
        setIsVoiceEnabled(voiceService.isEnabled);

        return () => {
            // Stop speaking when leaving chat
            voiceService.stop();
        };
    }, []);

    const toggleVoice = async () => {
        const newState = !isVoiceEnabled;
        setIsVoiceEnabled(newState);
        await voiceService.toggleVoice(newState);
    };

    const handleResetChat = async () => {
        const title = 'Resetar conversa?';
        const message = 'Eu vou "esquecer" o histórico visível desta conversa para começarmos de novo, mas vou tentar guardar o que aprendi sobre você.';

        const performReset = async () => {
            setIsResetting(true);
            try {
                console.log('Starting chat reset...');
                // 1. Generate and save summary (session learning)
                const summary = await aiService.generateSessionSummary(messages);
                if (summary) {
                    console.log('Generated summary for memory:', summary);
                    await userData.addInsight(summary);
                }

                // 2. Clear history
                await userData.clearChatHistory();

                // 3. Reset local state
                setMessages([]);
                setShowProactiveDialog(false);

                // 4. Start fresh
                const profile = await userData.getProfile();
                await startNewConversation(profile.name);
                console.log('Chat reset complete.');
            } catch (error) {
                console.error('Error resetting chat:', error);
                Alert.alert('Erro', 'Não foi possível resetar a conversa.');
            } finally {
                setIsResetting(false);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n\n${message}`)) {
                performReset();
            }
        } else {
            Alert.alert(title, message, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Resetar', style: 'destructive', onPress: performReset }
            ]);
        }
    };

    // Carrega dados do usuário e histórico
    const loadData = useCallback(async () => {
        try {
            const profile = await userData.getProfile();
            setUserName(profile.name || '');

            // Load and set insights for AI
            const insights = await userData.getInsights();
            aiService.setInsights(insights);

            // Verifica se é primeiro acesso (onboarding)
            const isOnboarded = await userData.isOnboardingComplete();

            if (!isOnboarded) {
                // Primeira vez - mostra diálogo proativo de boas-vindas
                setProactiveMessage(aiService.getWelcomeMessage().text);
                setQuickReplies([]);
                setShowProactiveDialog(true);
                voiceService.speak(aiService.getWelcomeMessage().text); // Falar boas vindas

                const welcome = aiService.getWelcomeMessage();
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
                // Se tiver histórico, não mostra diálogo proativo
                setShowProactiveDialog(false);
            } else {
                // Nova conversa do dia - IA inicia proativamente!
                const greeting = aiService.getInitialQuestion(profile.name);
                setProactiveMessage(greeting);
                voiceService.speak(greeting); // Falar saudação

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
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    // Verifica parâmetros da navegação
    useEffect(() => {
        if (route.params?.startWith) {
            handleQuickStart(route.params.startWith);
        }
    }, [route.params?.startWith]);

    const startNewConversation = async (name) => {
        const question = aiService.getInitialQuestion(name);
        const aiMsg = {
            id: `ai_${Date.now()}`,
            text: question,
            isUser: false,
            timestamp: new Date().toISOString(),
        };
        setMessages([aiMsg]);
        await userData.addChatMessage(question, false);
    };

    const handleQuickStart = (type) => {
        const prompts = {
            relaxar: 'Quero fazer exercícios de relaxamento',
            desabafar: 'Preciso desabafar sobre algo',
        };
        if (prompts[type]) {
            handleSendMessage(prompts[type]);
        }
    };

    const handleSendMessage = async (customText = null) => {
        const text = customText || inputText.trim();
        if (!text) return;

        // Limpa input
        setInputText('');
        voiceService.stop(); // Para fala anterior se houver

        // Adiciona mensagem do usuário
        const userMsg = {
            id: `user_${Date.now()}`,
            text,
            isUser: true,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMsg]);
        await userData.addChatMessage(text, true);

        // Verifica se é resposta de nome (onboarding)
        const isOnboarded = await userData.isOnboardingComplete();
        if (!isOnboarded) {
            await handleOnboardingResponse(text);
            return;
        }

        // Mostra indicador de digitação
        setIsTyping(true);

        // Simula delay de resposta (mais natural)
        setTimeout(async () => {
            // Gera resposta da IA (incluindo histórico para o Gemini)
            const response = await aiService.generateResponse(text, messages);

            // Salva humor se detectado
            if (response.sentiment) {
                const moodMap = {
                    positive: 'good',
                    neutral: 'okay',
                    negative: 'low',
                    crisis: 'struggling',
                };
                await userData.addMoodEntry(moodMap[response.sentiment.level] || 'okay', text);
            }

            // Adiciona resposta
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

            // FALA AUTOMÁTICA
            voiceService.speak(response.text);

            // Atualiza estado de emergência
            setShowEmergency(response.showEmergency);

            // Se for crise, oferece contatos e LIGA AUTOMATICAMENTE
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

                    // CHAMADA AUTOMÁTICA: Liga para o primeiro contato pessoal (Psico/Psi/Emergência)
                    // Se não houver pessoal, liga para o CVV
                    if (personalContacts.length > 0) {
                        const primary = personalContacts[0];
                        emergencyService.makeCall(primary.phone);
                    } else {
                        emergencyService.callCVV();
                    }
                }, 1000);
            }

            // Se não for crise, pode adicionar follow-up
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

                    // FALA DO FOLLOW-UP
                    voiceService.speak(response.followUp);

                    // Atualiza sugestões
                    const newSuggestions = aiService.getSuggestions(response.sentiment.level);
                    setSuggestions(newSuggestions);
                }, 1500);
            }

            setIsTyping(false);
        }, 800 + Math.random() * 700);
    };

    const handleOnboardingResponse = async (text) => {
        // Extrai nome da resposta
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
    };

    const handleSuggestionPress = (suggestion) => {
        handleSendMessage(`Quero fazer: ${suggestion.title}`);
        setSuggestions([]);
    };

    // Handler para respostas rápidas do diálogo proativo
    const handleQuickReply = (replyText) => {
        setShowProactiveDialog(false);
        setQuickReplies([]);
        handleSendMessage(replyText);
    };

    const scrollToEnd = () => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    };

    useEffect(() => {
        scrollToEnd();
    }, [messages, isTyping]);

    const renderMessage = ({ item }) => {
        if (item.isContactChip) {
            return (
                <CrisisContactChip
                    contact={item}
                    onPress={(phone) => emergencyService.makeCall(phone)}
                    styles={styles}
                    themeColors={themeColors}
                />
            );
        }
        return (
            <MessageBubble
                message={item}
                showEmergency={item.showEmergency}
                onEmergencyPress={() => navigation.navigate('Emergency')}
                aiFontSize={aiFontSize}
                styles={styles}
                themeColors={themeColors}
            />
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.headerAvatar}>
                        <Ionicons name="heart" size={20} color={themeColors.surface} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Lumina</Text>
                        <Text style={styles.headerSubtitle}>Sempre aqui para você</Text>
                    </View>
                </View>

                {/* Voice Toggle Button */}
                <TouchableOpacity onPress={toggleVoice} style={{ marginRight: spacing.sm }}>
                    <Ionicons
                        name={isVoiceEnabled ? "volume-high" : "volume-mute"}
                        size={24}
                        color={isVoiceEnabled ? themeColors.primary.main : themeColors.text.muted}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowVoiceModal(true)} style={{ marginRight: spacing.sm }}>
                    <Ionicons name={currentVoice.icon} size={22} color={themeColors.primary.main} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Emergency')} style={{ marginRight: spacing.sm }}>
                    <Ionicons name="call-outline" size={24} color={themeColors.error} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleResetChat} disabled={isResetting}>
                    <Ionicons name="trash-outline" size={24} color={isResetting ? themeColors.text.muted : themeColors.primary.main} />
                </TouchableOpacity>
            </View>

            {/* Diálogo Proativo da IA - aparece antes do usuário interagir */}
            {showProactiveDialog && proactiveMessage && (
                <ProactiveDialog
                    message={proactiveMessage}
                    quickReplies={quickReplies}
                    onQuickReply={handleQuickReply}
                    styles={styles}
                    themeColors={themeColors}
                />
            )}

            {/* Lista de mensagens */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={scrollToEnd}
                ListHeaderComponent={showProactiveDialog ? <View style={{ height: 20 }} /> : null}
            />

            {/* Indicador de digitação */}
            {isTyping && <TypingIndicator styles={styles} themeColors={themeColors} />}

            {/* Sugestões */}
            {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {suggestions.map((suggestion, index) => (
                        <SuggestionChip
                            key={index}
                            suggestion={suggestion}
                            onPress={() => handleSuggestionPress(suggestion)}
                            styles={styles}
                            themeColors={themeColors}
                        />
                    ))}
                </View>
            )}

            {/* Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Digite sua mensagem..."
                    placeholderTextColor={themeColors.text.muted}
                    multiline
                    maxLength={500}
                    onSubmitEditing={() => handleSendMessage()}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                >
                    <Ionicons
                        name="send"
                        size={20}
                        color={inputText.trim() ? themeColors.surface : themeColors.text.muted}
                    />
                </TouchableOpacity>
            </View>

            {/* Voice Selector Modal */}
            <Modal
                visible={showVoiceModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowVoiceModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.voiceModalContent}>
                        <View style={styles.voiceModalHeader}>
                            <Text style={styles.voiceModalTitle}>Escolha a Voz da IA</Text>
                            <TouchableOpacity onPress={() => setShowVoiceModal(false)}>
                                <Ionicons name="close" size={24} color={themeColors.text.secondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.voiceList} showsVerticalScrollIndicator={false}>
                            {voiceService.getPersonas().map((persona) => (
                                <TouchableOpacity
                                    key={persona.id}
                                    style={[
                                        styles.voiceItem,
                                        currentVoice.id === persona.id && styles.voiceItemActive
                                    ]}
                                    onPress={async () => {
                                        await voiceService.setPersona(persona.id);
                                        setCurrentVoice(persona);
                                        voiceService.speak(`Olá, eu sou ${persona.name}.`);
                                    }}
                                >
                                    <View style={[
                                        styles.voiceIcon,
                                        currentVoice.id === persona.id && styles.voiceIconActive
                                    ]}>
                                        <Ionicons
                                            name={persona.icon}
                                            size={24}
                                            color={currentVoice.id === persona.id ? '#FFFFFF' : themeColors.primary.main}
                                        />
                                    </View>
                                    <View style={styles.voiceInfo}>
                                        <Text style={[
                                            styles.voiceName,
                                            currentVoice.id === persona.id && styles.voiceNameActive
                                        ]}>{persona.name}</Text>
                                        <Text style={styles.voiceDescription}>{persona.description}</Text>
                                    </View>
                                    {currentVoice.id === persona.id && (
                                        <Ionicons name="checkmark-circle" size={24} color={themeColors.primary.main} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const getStyles = (themeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: themeColors.surface,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.round,
        backgroundColor: themeColors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: themeColors.text.primary,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.xs,
        color: themeColors.text.secondary,
    },
    messagesList: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    messageBubbleContainer: {
        marginBottom: spacing.md,
    },
    userBubbleContainer: {
        alignItems: 'flex-end',
    },
    aiBubbleContainer: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    aiAvatar: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.round,
        backgroundColor: themeColors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.xs,
    },
    messageBubble: {
        maxWidth: width * 0.75,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    userBubble: {
        backgroundColor: themeColors.primary.main,
        borderBottomRightRadius: spacing.xs,
    },
    aiBubble: {
        backgroundColor: themeColors.surface,
        borderBottomLeftRadius: spacing.xs,
        ...shadows.sm,
    },
    messageText: {
        fontSize: typography.fontSize.md,
        color: themeColors.text.primary,
        lineHeight: 22,
    },
    userMessageText: {
        color: themeColors.text.inverse,
    },
    messageTime: {
        fontSize: typography.fontSize.xs,
        color: themeColors.text.muted,
        marginTop: spacing.xs,
        textAlign: 'right',
    },
    userMessageTime: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    emergencyInlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.error,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
        marginTop: spacing.sm,
        marginLeft: 40,
    },
    emergencyInlineText: {
        color: themeColors.surface,
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        marginLeft: spacing.xs,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.lg,
        marginBottom: spacing.md,
    },
    typingBubble: {
        flexDirection: 'row',
        backgroundColor: themeColors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        borderBottomLeftRadius: spacing.xs,
        ...shadows.sm,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: themeColors.text.muted,
        marginHorizontal: 3,
    },
    crisisContactChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: themeColors.error,
    },
    crisisContactInfo: {
        marginLeft: spacing.md,
    },
    crisisContactName: {
        fontWeight: '600',
        color: themeColors.text.primary,
    },
    crisisContactPhone: {
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
    },
    suggestionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    suggestionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.surface,
        borderWidth: 1,
        borderColor: themeColors.primary.main,
        borderRadius: borderRadius.round,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    suggestionText: {
        fontSize: typography.fontSize.sm,
        color: themeColors.primary.main,
        marginLeft: spacing.xs,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.surface,
        padding: spacing.sm,
        paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.sm,
        borderTopWidth: 1,
        borderTopColor: themeColors.border,
    },
    input: {
        flex: 1,
        backgroundColor: themeColors.background,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        maxHeight: 100,
        marginRight: spacing.sm,
        color: themeColors.text.primary,
        fontSize: typography.fontSize.md,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: themeColors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: themeColors.surfaceVariant,
    },
    proactiveDialogContainer: {
        position: 'absolute',
        top: 100,
        left: spacing.lg,
        right: spacing.lg,
        backgroundColor: themeColors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        paddingTop: spacing.xl,
        zIndex: 10,
        ...shadows.lg,
        borderWidth: 1,
        borderColor: themeColors.primary.light,
    },
    proactiveAvatar: {
        position: 'absolute',
        top: -24,
        alignSelf: 'center',
        width: 48,
        height: 48,
        borderRadius: borderRadius.round,
        backgroundColor: themeColors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: themeColors.surface,
    },
    quickRepliesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: spacing.md,
    },
    quickReplyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${themeColors.primary.main}15`,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
        margin: 4,
    },
    quickReplyText: {
        marginLeft: spacing.xs,
        color: themeColors.primary.main,
        fontWeight: '600',
        fontSize: typography.fontSize.sm,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    voiceModalContent: {
        backgroundColor: themeColors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
        maxHeight: '80%',
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    voiceModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    voiceModalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '700',
        color: themeColors.text.primary,
    },
    voiceList: {
        maxHeight: 450,
    },
    voiceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        backgroundColor: themeColors.surfaceVariant,
    },
    voiceItemActive: {
        backgroundColor: `${themeColors.primary.main}15`,
        borderWidth: 1,
        borderColor: themeColors.primary.main,
    },
    voiceIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${themeColors.primary.main}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    voiceIconActive: {
        backgroundColor: themeColors.primary.main,
    },
    voiceInfo: {
        flex: 1,
    },
    voiceName: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: themeColors.text.primary,
    },
    voiceNameActive: {
        color: themeColors.primary.main,
    },
    voiceDescription: {
        fontSize: typography.fontSize.xs,
        color: themeColors.text.secondary,
        marginTop: 2,
    },
});
