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
    Image,
    Alert
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
import ProfessionalDirectory from '../components/ProfessionalDirectory';
import { ResourceModal } from '../components/ResourceModals';
import VoiceSelectorModal from '../components/VoiceSelectorModal';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const [userName, setUserName] = useState('');
    const [greeting, setGreeting] = useState('');
    const [todayMood, setTodayMood] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [streak, setStreak] = useState(0);
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    // UI State
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [currentVoice, setCurrentVoice] = useState(voiceService.getCurrentPersona());
    const [showOpenDialogueModal, setShowOpenDialogueModal] = useState(false);
    const [showHarmReductionModal, setShowHarmReductionModal] = useState(false);

    // Theme hook
    const { themeColors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(themeColors), [themeColors]);

    const openDialogueLinks = [
        {
            title: 'Dialogic Practice - EUA',
            type: 'Instituto Oficial',
            url: 'https://www.dialogicpractice.net/',
            icon: 'globe',
            color: themeColors.primary.main
        },
        {
            title: 'Developing Open Dialogue',
            type: 'Recursos e Treinamento',
            url: 'https://developingopendialogue.com/',
            icon: 'book',
            color: themeColors.accent.hope
        },
        {
            title: 'PubMed - Artigos Científicos',
            type: 'National Library of Medicine',
            url: 'https://pubmed.ncbi.nlm.nih.gov/?term=open+dialogue+psychiatry',
            icon: 'library',
            color: themeColors.success
        },
        {
            title: 'SciELO Brasil - Artigos',
            type: 'Experiências Brasileiras',
            url: 'https://search.scielo.org/?q=di%C3%A1logo+aberto+sa%C3%BAde+mental&lang=pt',
            icon: 'flag',
            color: themeColors.warning
        },
        {
            title: 'Vídeo: Open Dialogue Documentary',
            type: 'YouTube - Documentário',
            url: 'https://www.youtube.com/watch?v=aBjIvnRFja4',
            icon: 'play-circle',
            color: themeColors.error
        },
        {
            title: 'WHO - Saúde Mental',
            type: 'Organização Mundial da Saúde',
            url: 'https://www.who.int/health-topics/mental-health',
            icon: 'medkit',
            color: themeColors.info
        }
    ];

    const harmReductionLinks = [
        {
            title: 'Fiocruz - Portal de Boas Práticas',
            type: 'Fundação Oswaldo Cruz',
            url: 'https://portaldeboaspraticas.iff.fiocruz.br/',
            icon: 'medkit',
            color: themeColors.primary.main
        },
        {
            title: 'Relatos de Experiência em RD',
            type: 'Google Acadêmico - Artigos',
            url: 'https://scholar.google.com.br/scholar?q=relato+experiencia+reducao+danos+CAPS',
            icon: 'document-text',
            color: themeColors.success
        },
        {
            title: 'SciELO - Artigos Científicos',
            type: 'Pesquisa Acadêmica Brasil',
            url: 'https://search.scielo.org/?q=redu%C3%A7%C3%A3o+de+danos+drogas&lang=pt',
            icon: 'library',
            color: themeColors.accent.hope
        },
        {
            title: 'PubMed - Harm Reduction',
            type: 'National Library of Medicine',
            url: 'https://pubmed.ncbi.nlm.nih.gov/?term=harm+reduction+brazil',
            icon: 'globe',
            color: themeColors.warning
        },
        {
            title: 'Vídeo: O que é Redução de Danos?',
            type: 'YouTube - Canal Fiocruz',
            url: 'https://www.youtube.com/results?search_query=fiocruz+redu%C3%A7%C3%A3o+de+danos',
            icon: 'play-circle',
            color: themeColors.error
        },
        {
            title: 'CVV - Apoio Emocional',
            type: 'Centro de Valorização da Vida',
            url: 'https://www.cvv.org.br/',
            icon: 'heart',
            color: themeColors.info
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

    const handleSelectVoice = (voice) => {
        setCurrentVoice(voice);
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
                {/* Dashboard Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{greeting}</Text>
                        <Text style={styles.subtitle}>Painel Profissional • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                    </View>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={styles.voiceButton}
                            onPress={() => setShowVoiceModal(true)}
                        >
                            <Ionicons name={currentVoice.icon} size={20} color={themeColors.primary.main} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Ionicons name="settings-outline" size={20} color={themeColors.text.secondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Dashboard Highlights / Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Humor Atual</Text>
                        <View style={styles.statValueContainer}>
                            <Ionicons name={todayMood ? getMoodIcon(todayMood.mood).name : "analytics-outline"} size={22} color={todayMood ? getMoodIcon(todayMood.mood).color : themeColors.primary.main} />
                            <Text style={styles.statValue}>{todayMood ? "Registrado" : "Pendente"}</Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Sessões</Text>
                        <View style={styles.statValueContainer}>
                            <Ionicons name="calendar-outline" size={22} color={themeColors.primary.main} />
                            <Text style={styles.statValue}>3 Agendadas</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions Grid */}
                <Text style={styles.sectionTitle}>Acesso Rápido</Text>
                <View style={styles.quickActionsGrid}>
                    <QuickActionCard
                        icon="chatbubbles-outline"
                        title="Assistente AI"
                        subtitle="Sessão Virtual"
                        color={themeColors.primary.main}
                        onPress={() => navigation.navigate('Chat')}
                    />
                    <QuickActionCard
                        icon="document-text-outline"
                        title="Prontuários"
                        subtitle="Documentação"
                        color={themeColors.accent.info}
                        onPress={() => navigation.navigate('Documentation')}
                    />
                    <QuickActionCard
                        icon="calendar-outline"
                        title="Agenda"
                        subtitle="Compromissos"
                        color={themeColors.success}
                        onPress={() => navigation.navigate('Calendar')}
                    />
                    <QuickActionCard
                        icon="videocam-outline"
                        title="Teleconsulta"
                        subtitle="Sala Virtual"
                        color={themeColors.warning}
                        onPress={() => navigation.navigate('VideoCall')}
                    />
                </View>

                {/* Professional Directory Section */}
                <ProfessionalDirectory themeColors={themeColors} />

                {/* Professional Resources */}
                <Text style={styles.sectionTitle}>Base de Conhecimento</Text>
                <View style={styles.resourcesList}>
                    <TouchableOpacity style={styles.resourceRow} onPress={() => setShowOpenDialogueModal(true)}>
                        <View style={[styles.resourceIcon, { backgroundColor: themeColors.primary.light + '20' }]}>
                            <Ionicons name="library-outline" size={24} color={themeColors.primary.main} />
                        </View>
                        <View style={styles.resourceInfo}>
                            <Text style={styles.resourceTitle}>Diálogo Aberto</Text>
                            <Text style={styles.resourceSubtitle}>Protocolos e diretrizes clínicas</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={themeColors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.resourceRow} onPress={() => setShowHarmReductionModal(true)}>
                        <View style={[styles.resourceIcon, { backgroundColor: themeColors.accent.warm + '20' }]}>
                            <Ionicons name="medical-outline" size={24} color={themeColors.error} />
                        </View>
                        <View style={styles.resourceInfo}>
                            <Text style={styles.resourceTitle}>Redução de Danos</Text>
                            <Text style={styles.resourceSubtitle}>Manuais e práticas de intervenção</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={themeColors.text.muted} />
                    </TouchableOpacity>
                </View>

                {/* Emergency & Support */}
                <View style={styles.secondaryActions}>
                    <TouchableOpacity style={[styles.emergencyBtn, { borderColor: themeColors.error }]} onPress={() => navigation.navigate('Emergency')}>
                        <Ionicons name="alert-circle-outline" size={20} color={themeColors.error} />
                        <Text style={[styles.emergencyBtnText, { color: themeColors.error }]}>Protocolo de Emergência</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.websiteLinkCard} onPress={() => linkHandler.openWebsite()}>
                        <Text style={styles.websiteLinkText}>Portal do Profissional</Text>
                        <Ionicons name="open-outline" size={16} color={themeColors.primary.main} />
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpace} />

            </ScrollView>

            <ResourceModal
                visible={showOpenDialogueModal}
                onClose={() => setShowOpenDialogueModal(false)}
                title="Recursos Diálogo Aberto"
                links={openDialogueLinks}
            />

            <ResourceModal
                visible={showHarmReductionModal}
                onClose={() => setShowHarmReductionModal(false)}
                title="Recursos Redução de Danos"
                links={harmReductionLinks}
            />

            <VoiceSelectorModal
                visible={showVoiceModal}
                onClose={() => setShowVoiceModal(false)}
                currentVoice={currentVoice}
                onSelectVoice={handleSelectVoice}
            />

            {showPermissionModal && (
                <EmergencyPermissionModal
                    visible={showPermissionModal}
                    onConfirm={handleConfirmPermission}
                    onDeny={handleDenyPermission}
                />
            )}
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
        paddingBottom: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
        marginTop: spacing.sm,
    },
    greeting: {
        fontSize: typography.fontSize.xl,
        fontWeight: '700',
        color: themeColors.text.primary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
        marginTop: 4,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    settingsButton: {
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: themeColors.surface,
        borderWidth: 1,
        borderColor: themeColors.border,
    },
    voiceButton: {
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: themeColors.surface,
        borderWidth: 1,
        borderColor: themeColors.border,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: themeColors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: themeColors.border,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: themeColors.text.secondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: themeColors.text.primary,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: themeColors.text.primary,
        marginBottom: spacing.md,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    quickAction: {
        width: '47%',
        backgroundColor: themeColors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: themeColors.border,
        ...shadows.sm,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
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
        fontSize: typography.fontSize.xs,
        color: themeColors.text.secondary,
    },
    resourcesList: {
        marginBottom: spacing.xxl,
    },
    resourceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: themeColors.border,
    },
    resourceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
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
    },
    secondaryActions: {
        gap: spacing.md,
    },
    emergencyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderStyle: 'dashed',
        backgroundColor: 'transparent',
        gap: 8,
    },
    emergencyBtnText: {
        fontWeight: '600',
        fontSize: 14,
    },
    websiteLinkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        gap: 8,
    },
    websiteLinkText: {
        fontSize: 14,
        color: themeColors.primary.main,
        fontWeight: '500',
    },
    bottomSpace: {
        height: 80,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: themeColors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        color: themeColors.text.secondary,
        fontSize: typography.fontSize.md,
    },
});
