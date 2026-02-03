/**
 * Cuidado-Now AI - Tela de Conversa
 * Interface de chat empática com respostas de apoio emocional
 * 
 * OTIMIZADO: Usa componentes extraídos, hooks customizados, performance melhorada
 */

import React, { useEffect, useMemo, useCallback, useState } from 'react';
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
    Alert,
    Modal,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Styles
import { spacing, borderRadius, shadows, typography } from '../styles/theme';
import { useTheme } from '../context/ThemeContext';

// Hooks e serviços
import useChat from '../hooks/useChat';
import voiceService from '../services/VoiceService';
import emergencyService from '../services/EmergencyService';

// Componentes de chat
import {
    MessageBubble,
    TypingIndicator,
    ProactiveDialog,
    SuggestionChip,
    CrisisContactChip,
} from '../components/chat';

const { width } = Dimensions.get('window');

export default function ChatScreen({ navigation, route }) {
    const { themeColors, aiFontSize } = useTheme();
    const styles = useMemo(() => getStyles(themeColors), [themeColors]);

    // Estado de voz
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [currentVoice, setCurrentVoice] = useState(voiceService.getCurrentPersona());
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(voiceService.isEnabled);

    // Hook de chat com toda a lógica encapsulada
    const {
        messages,
        inputText,
        isTyping,
        suggestions,
        showProactiveDialog,
        proactiveMessage,
        quickReplies,
        isResetting,
        flatListRef,
        setInputText,
        loadData,
        sendMessage,
        resetChat,
        handleQuickReply,
        handleSuggestionPress,
        scrollToEnd,
    } = useChat();

    // Sincroniza estado de voz no mount
    useEffect(() => {
        setIsVoiceEnabled(voiceService.isEnabled);
        return () => voiceService.stop();
    }, []);

    // Carrega dados quando tela recebe foco
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    // Verifica parâmetros de navegação
    useEffect(() => {
        if (route.params?.startWith) {
            const prompts = {
                relaxar: 'Quero fazer exercícios de relaxamento',
                desabafar: 'Preciso desabafar sobre algo',
            };
            if (prompts[route.params.startWith]) {
                sendMessage(prompts[route.params.startWith]);
            }
        }
    }, [route.params?.startWith, sendMessage]);

    // Toggle de voz
    const toggleVoice = useCallback(async () => {
        const newState = !isVoiceEnabled;
        setIsVoiceEnabled(newState);
        await voiceService.toggleVoice(newState);
    }, [isVoiceEnabled]);

    // Confirma reset do chat
    const handleResetChat = useCallback(() => {
        const title = 'Resetar conversa?';
        const message = 'Vou "esquecer" o histórico visível para começarmos de novo, mas vou tentar guardar o que aprendi sobre você.';

        const performReset = async () => {
            try {
                await resetChat();
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível resetar a conversa.');
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
    }, [resetChat]);

    // Renderiza item da lista
    const renderMessage = useCallback(({ item }) => {
        if (item.isContactChip) {
            return (
                <CrisisContactChip
                    contact={item}
                    onPress={(phone) => emergencyService.makeCall(phone)}
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
                themeColors={themeColors}
            />
        );
    }, [themeColors, aiFontSize, navigation]);

    // Key extractor memoizado
    const keyExtractor = useCallback((item) => item.id, []);

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
                        <Text style={styles.headerTitle}>Cuidado Now</Text>
                        <Text style={styles.headerSubtitle}>Sempre aqui para você</Text>
                    </View>
                </View>

                {/* Botões do header */}
                <TouchableOpacity onPress={toggleVoice} style={styles.headerButton}>
                    <Ionicons
                        name={isVoiceEnabled ? "volume-high" : "volume-mute"}
                        size={24}
                        color={isVoiceEnabled ? themeColors.primary.main : themeColors.text.muted}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowVoiceModal(true)} style={styles.headerButton}>
                    <Ionicons name={currentVoice.icon} size={22} color={themeColors.primary.main} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Emergency')} style={styles.headerButton}>
                    <Ionicons name="call-outline" size={24} color={themeColors.error} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleResetChat} disabled={isResetting}>
                    <Ionicons
                        name="trash-outline"
                        size={24}
                        color={isResetting ? themeColors.text.muted : themeColors.primary.main}
                    />
                </TouchableOpacity>
            </View>

            {/* Diálogo Proativo */}
            {showProactiveDialog && proactiveMessage && (
                <ProactiveDialog
                    message={proactiveMessage}
                    quickReplies={quickReplies}
                    onQuickReply={handleQuickReply}
                    themeColors={themeColors}
                />
            )}

            {/* Lista de mensagens */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={scrollToEnd}
                ListHeaderComponent={showProactiveDialog ? <View style={{ height: 20 }} /> : null}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
            />

            {/* Indicador de digitação */}
            {isTyping && <TypingIndicator themeColors={themeColors} />}

            {/* Sugestões */}
            {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {suggestions.map((suggestion, index) => (
                        <SuggestionChip
                            key={index}
                            suggestion={suggestion}
                            onPress={() => handleSuggestionPress(suggestion)}
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
                    onSubmitEditing={() => sendMessage()}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={() => sendMessage()}
                    disabled={!inputText.trim()}
                >
                    <Ionicons
                        name="send"
                        size={20}
                        color={inputText.trim() ? themeColors.surface : themeColors.text.muted}
                    />
                </TouchableOpacity>
            </View>

            {/* Modal de seleção de voz */}
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
        flex: 1,
        marginLeft: spacing.sm,
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
    headerButton: {
        marginRight: spacing.sm,
    },
    messagesList: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    suggestionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: themeColors.surface,
        borderTopWidth: 1,
        borderTopColor: themeColors.border,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        backgroundColor: themeColors.surfaceVariant,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: typography.fontSize.md,
        color: themeColors.text.primary,
        marginRight: spacing.sm,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.round,
        backgroundColor: themeColors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: themeColors.surfaceVariant,
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
        maxHeight: '70%',
        paddingBottom: spacing.xl,
    },
    voiceModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
    },
    voiceModalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: themeColors.text.primary,
    },
    voiceList: {
        paddingHorizontal: spacing.lg,
    },
    voiceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
    },
    voiceItemActive: {
        backgroundColor: themeColors.primary.light + '20',
        marginHorizontal: -spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    voiceIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.round,
        backgroundColor: themeColors.surfaceVariant,
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
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
        marginTop: 2,
    },
});
