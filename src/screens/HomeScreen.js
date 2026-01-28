/**
 * Cuidado-Now AI - Tela Principal
 * Painel inicial com saudação personalizada e acesso rápido às funções
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Dimensions,
    Modal,
    FlatList,
    Alert,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, borderRadius, shadows, typography } from '../styles/theme';
import aiService from '../services/AIService';
import userData from '../storage/UserData';
import linkHandler from '../utils/LinkHandler';
import voiceService from '../services/VoiceService';
import EmergencyPermissionModal from '../components/EmergencyPermissionModal';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const [userName, setUserName] = useState('');
    const [greeting, setGreeting] = useState('');
    const [todayMood, setTodayMood] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [streak, setStreak] = useState(0);
    const [showProfessionalModal, setShowProfessionalModal] = useState(false);
    const [selectedProfession, setSelectedProfession] = useState(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [currentVoice, setCurrentVoice] = useState(voiceService.getCurrentPersona());
    const [showOpenDialogueModal, setShowOpenDialogueModal] = useState(false);
    const [showHarmReductionModal, setShowHarmReductionModal] = useState(false);

    // Theme hook
    const { themeColors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(themeColors), [themeColors]);

    const openDialogueLinks = [
        {
            title: 'Ministério da Saúde / Fiocruz',
            type: 'Governo / Institucional',
            url: 'https://portal.fiocruz.br/saude-mental',
            icon: 'business',
            color: themeColors.primary.main
        },
        {
            title: 'Artigos Científicos',
            type: 'Pesquisa Acadêmica',
            url: 'https://search.scielo.org/?q=open+dialogue+mental+health&lang=pt',
            icon: 'library',
            color: themeColors.accent.hope
        },
        {
            title: 'Vídeos e Palestras',
            type: 'Conteúdo Educativo',
            url: 'https://www.youtube.com/results?search_query=dialogo+aberto+saude+mental',
            icon: 'play-circle',
            color: themeColors.error
        }
    ];

    const harmReductionLinks = [
        {
            title: 'Ministério da Saúde',
            type: 'Portal Oficial',
            url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-z/a/alcool',
            icon: 'business',
            color: themeColors.primary.main
        },
        {
            title: 'Artigos SciELO',
            type: 'Pesquisa Acadêmica',
            url: 'https://search.scielo.org/?q=reducao+de+danos&lang=pt',
            icon: 'library',
            color: themeColors.accent.hope
        },
        {
            title: 'Vídeos Educativos',
            type: 'Conteúdo Multimídia',
            url: 'https://www.youtube.com/results?search_query=reducao+de+danos+ministerio+da+saude',
            icon: 'play-circle',
            color: themeColors.error
        }
    ];

    const loadUserData = useCallback(async () => {
        try {
            const profile = await userData.getProfile();
            setUserName(profile.name || '');
            setStreak(profile.streak || 0);

            const mood = await userData.getTodaysMood();
            setTodayMood(mood);

            const greetingText = aiService.getGreeting(profile.name);
            setGreeting(greetingText);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadUserData();
            checkPermissions();
        }, [loadUserData])
    );

    const checkPermissions = async () => {
        const profile = await userData.getProfile();
        if (profile.emergencyPermissionGranted === null) {
            setShowPermissionModal(true);
        }
    };

    const handleConfirmPermission = async () => {
        await userData.saveProfile({ emergencyPermissionGranted: true });
        setShowPermissionModal(false);
    };

    const handleDenyPermission = async () => {
        await userData.saveProfile({ emergencyPermissionGranted: false });
        setShowPermissionModal(false);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setGreeting(aiService.getGreeting(userName));
        }, 60000);

        return () => clearInterval(interval);
    }, [userName]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUserData();
        setRefreshing(false);
    };

    const getMoodIcon = (mood) => {
        const icons = {
            great: { name: 'happy', color: themeColors.mood.great },
            good: { name: 'happy-outline', color: themeColors.mood.good },
            okay: { name: 'remove-circle-outline', color: themeColors.mood.okay },
            low: { name: 'sad-outline', color: themeColors.mood.low },
            struggling: { name: 'sad', color: themeColors.mood.struggling },
        };
        return icons[mood] || icons.okay;
    };

    const QuickActionCard = ({ image, icon, title, subtitle, onPress, color = themeColors.primary.main }) => (
        <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
                {image ? (
                    <Image
                        source={image}
                        style={{ width: 48, height: 48 }}
                        resizeMode="contain"
                    />
                ) : (
                    <Ionicons name={icon || "help"} size={28} color={color} />
                )}
            </View>
            <Text style={styles.quickActionTitle}>{title}</Text>
            <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        </TouchableOpacity>
    );

    const ResourceModal = ({ visible, onClose, title, links }) => (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={themeColors.text.secondary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={{ marginBottom: spacing.lg, color: themeColors.text.secondary }}>
                        Selecione o tipo de conteúdo que deseja acessar:
                    </Text>
                    {links && links.map((link, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.resourceButton}
                            onPress={() => {
                                onClose();
                                linkHandler.openUrl(link.url);
                            }}
                        >
                            <View style={[styles.resourceIcon, { backgroundColor: link.color + '15' }]}>
                                <Ionicons name={link.icon} size={24} color={link.color} />
                            </View>
                            <View style={styles.resourceInfo}>
                                <Text style={styles.resourceTitle}>{link.title}</Text>
                                <Text style={styles.resourceSubtitle}>{link.type}</Text>
                            </View>
                            <Ionicons name="open-outline" size={20} color={themeColors.text.muted} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );

    const MoodCard = () => {
        if (todayMood) {
            const moodInfo = getMoodIcon(todayMood.mood);
            return (
                <TouchableOpacity
                    style={styles.moodCard}
                    onPress={() => navigation.navigate('Chat')}
                    activeOpacity={0.8}
                >
                    <View style={styles.moodCardContent}>
                        <Ionicons name={moodInfo.name} size={40} color={moodInfo.color} />
                        <View style={styles.moodCardText}>
                            <Text style={styles.moodCardTitle}>Seu humor hoje</Text>
                            <Text style={styles.moodCardSubtitle}>
                                Registrado às {new Date(todayMood.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={themeColors.text.muted} />
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={[styles.moodCard, styles.moodCardEmpty]}
                onPress={() => navigation.navigate('Chat')}
                activeOpacity={0.8}
            >
                <View style={styles.moodCardContent}>
                    <View style={styles.moodCardEmptyIcon}>
                        <Ionicons name="chatbubble-ellipses" size={32} color={themeColors.primary.main} />
                    </View>
                    <View style={styles.moodCardText}>
                        <Text style={styles.moodCardTitle}>Como você está hoje?</Text>
                        <Text style={styles.moodCardSubtitle}>Toque para conversar comigo</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={themeColors.primary.main} />
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="heart" size={50} color={themeColors.primary.main} />
                <Text style={styles.loadingText}>Preparando tudo pra você...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[themeColors.primary.main]} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header com saudação */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{greeting}</Text>
                        <Text style={styles.subtitle}>
                            {streak > 0
                                ? `🔥 ${streak} dias cuidando de você`
                                : 'Que bom te ver por aqui'}
                        </Text>
                    </View>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={styles.voiceButton}
                            onPress={() => setShowVoiceModal(true)}
                        >
                            <Ionicons name={currentVoice.icon} size={22} color={themeColors.primary.main} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Ionicons name="settings-outline" size={24} color={themeColors.text.secondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Card de humor */}
                <MoodCard />

                {/* Ações rápidas */}
                <View style={styles.quickActionsGrid}>
                    <QuickActionCard
                        image={require('../../assets/chat.png')}
                        title="Conversar"
                        subtitle="Fale comigo"
                        color={themeColors.primary.main}
                        onPress={() => navigation.navigate('Chat')}
                    />
                    <QuickActionCard
                        image={require('../../assets/emergency.png')}
                        title="Emergência"
                        subtitle="Ajuda agora"
                        color={themeColors.error}
                        onPress={() => navigation.navigate('Emergency')}
                    />
                </View>
                <View style={styles.quickActionsGrid}>
                    <QuickActionCard
                        image={require('../../assets/professional.png')}
                        title="Psicoterapeutas"
                        subtitle="Falar e ouvir"
                        color={themeColors.accent.hope}
                        onPress={() => {
                            linkHandler.searchProfessionals('psicoterapeuta');
                        }}
                    />
                    <QuickActionCard
                        image={require('../../assets/professional.png')}
                        title="Psiquiatras"
                        subtitle="Apoio médico"
                        color={themeColors.accent.calm} // Assuming calm exists, if not usage primary.light
                        onPress={() => {
                            linkHandler.searchProfessionals('psiquiatra');
                        }}
                    />
                </View>

                {/* Centro de Conhecimento */}
                <Text style={styles.sectionTitle}>Conhecimento e Cidadania</Text>
                <View style={styles.quickActionsGrid}>
                    <QuickActionCard
                        image={require('../../assets/open_dialogue.png')}
                        title="Diálogo Aberto"
                        subtitle="Abordagem humanizada"
                        color={themeColors.primary.main}
                        onPress={() => setShowOpenDialogueModal(true)}
                    />
                    <QuickActionCard
                        image={require('../../assets/harm_reduction.png')}
                        title="Redução de Danos"
                        subtitle="Cuidado e proteção"
                        color={themeColors.accent.warm}
                        onPress={() => setShowHarmReductionModal(true)}
                    />
                </View>

                {/* Modais de Recursos */}
                <ResourceModal
                    visible={showOpenDialogueModal}
                    onClose={() => setShowOpenDialogueModal(false)}
                    title="Diálogo Aberto"
                    links={openDialogueLinks}
                />
                <ResourceModal
                    visible={showHarmReductionModal}
                    onClose={() => setShowHarmReductionModal(false)}
                    title="Redução de Danos"
                    links={harmReductionLinks}
                />

                {/* Visite nosso Site */}
                <TouchableOpacity
                    style={styles.websiteLinkCard}
                    onPress={() => linkHandler.openWebsite()}
                >
                    <View style={styles.websiteLinkContent}>
                        <Ionicons name="globe-outline" size={24} color={themeColors.primary.main} />
                        <Text style={styles.websiteLinkText}>Acesse o site oficial Cuidado-Now</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={themeColors.primary.main} />
                </TouchableOpacity>

                <EmergencyPermissionModal
                    visible={showPermissionModal}
                    onConfirm={handleConfirmPermission}
                    onDeny={handleDenyPermission}
                />

                {/* Frase motivacional */}
                <View style={styles.quoteCard}>
                    <Ionicons name="sparkles" size={24} color={themeColors.primary.main} />
                    <Text style={styles.quoteText}>
                        "Cuidar da mente é um ato de coragem. Você está fazendo a coisa certa."
                    </Text>
                </View>

                {/* Espaço extra no final */}
                <View style={styles.bottomSpace} />

            </ScrollView>

            {/* Modal de Profissionais */}
            <Modal
                visible={showProfessionalModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowProfessionalModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedProfession === 'psicoterapeuta' ? 'Psicoterapeutas' : 'Psiquiatras'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowProfessionalModal(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color={themeColors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.modalSubtitle}>
                        Profissionais sugeridos (Demonstração)
                    </Text>

                    <ScrollView style={styles.professionalList}>
                        {/* Dummy Data */}
                        {[1, 2, 3].map((item) => (
                            <View key={item} style={styles.professionalCard}>
                                <View style={[styles.avatarPlaceholder, { backgroundColor: selectedProfession === 'psicoterapeuta' ? themeColors.accent.hope : themeColors.accent.soft }]}>
                                    <Text style={styles.avatarText}>Dr.</Text>
                                </View>
                                <View style={styles.professionalInfo}>
                                    <Text style={styles.professionalName}>Dr(a). Nome Sobrenome</Text>
                                    <Text style={styles.professionalSpecialty}>
                                        {selectedProfession === 'psicoterapeuta' ? 'Psicologia Clínica' : 'Psiquiatria Geral'}
                                    </Text>
                                    <TouchableOpacity style={styles.contactButton} onPress={() => Alert.alert('Contato', 'Funcionalidade em desenvolvimento')}>
                                        <Text style={styles.contactButtonText}>Entrar em contato</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </Modal>

            {/* Voice Selector Modal */}
            <Modal
                visible={showVoiceModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowVoiceModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.voiceModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Escolha a Voz da IA</Text>
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
        </View>
    );
}

const getStyles = (themeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColors.background,
    },
    contentContainer: {
        padding: spacing.lg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: themeColors.background,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: typography.fontSize.md,
        color: themeColors.text.secondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
        marginTop: spacing.md,
    },
    greeting: {
        fontSize: typography.fontSize.xxl,
        fontWeight: '700',
        color: themeColors.text.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: themeColors.text.secondary,
    },
    settingsButton: {
        padding: spacing.sm,
        borderRadius: borderRadius.round,
        backgroundColor: themeColors.surfaceVariant,
    },
    moodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: themeColors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        ...shadows.md,
    },
    moodCardEmpty: {
        borderWidth: 2,
        borderColor: themeColors.primary.light,
        borderStyle: 'dashed',
    },
    moodCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    moodCardEmptyIcon: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.round,
        backgroundColor: `${themeColors.primary.main}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moodCardText: {
        marginLeft: spacing.md,
        flex: 1,
    },
    moodCardTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: themeColors.text.primary,
        marginBottom: 2,
    },
    moodCardSubtitle: {
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: themeColors.text.primary,
        marginBottom: spacing.md,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    quickAction: {
        width: (width - spacing.lg * 2 - spacing.md) / 2,
        backgroundColor: themeColors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    quickActionTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: themeColors.text.primary,
        marginBottom: 2,
    },
    quickActionSubtitle: {
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
        textAlign: 'center',
    },
    quoteCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: `${themeColors.primary.main}10`,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: themeColors.primary.main,
    },
    quoteText: {
        flex: 1,
        marginLeft: spacing.md,
        fontSize: typography.fontSize.md,
        fontStyle: 'italic',
        color: themeColors.text.secondary,
        lineHeight: 24,
    },
    websiteLinkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: `${themeColors.primary.main}08`,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: `${themeColors.primary.main}20`,
    },
    websiteLinkContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    websiteLinkText: {
        marginLeft: spacing.sm,
        fontSize: typography.fontSize.sm,
        color: themeColors.primary.main,
        fontWeight: '600',
    },
    bottomSpace: {
        height: spacing.xxl,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: themeColors.background,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
        height: '70%',
        ...shadows.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '700',
        color: themeColors.text.primary,
    },
    closeButton: {
        padding: spacing.xs,
    },
    modalSubtitle: {
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
        marginBottom: spacing.lg,
    },
    professionalList: {
        flex: 1,
    },
    professionalCard: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: themeColors.surface,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: themeColors.surfaceVariant,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: typography.fontSize.sm,
    },
    professionalInfo: {
        flex: 1,
    },
    professionalName: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: themeColors.text.primary,
    },
    professionalSpecialty: {
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
        marginBottom: spacing.xs,
    },
    contactButton: {
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    contactButtonText: {
        fontSize: typography.fontSize.sm,
        color: themeColors.primary.main,
        fontWeight: '600',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    voiceButton: {
        padding: spacing.sm,
        marginRight: spacing.sm,
        backgroundColor: `${themeColors.primary.main}15`,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    voiceButtonLabel: {
        fontSize: typography.fontSize.xs,
        color: themeColors.primary.main,
        marginTop: 2,
        fontWeight: '500',
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
    resourceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: themeColors.surfaceVariant,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    resourceIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    resourceInfo: {
        flex: 1,
    },
    resourceTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: themeColors.text.primary,
        marginBottom: 2,
    },
    resourceSubtitle: {
        fontSize: typography.fontSize.xs,
        color: themeColors.text.secondary,
        fontWeight: '500',
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
