/**
 * Cuidado-Now AI - Tela de Configurações
 * Preferências do usuário, notificações e icones de emergência
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    TextInput,
    Alert,
    Modal,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, borderRadius, shadows, typography } from '../styles/theme';
import userData from '../storage/UserData';
import emergencyService from '../services/EmergencyService';
import aiService from '../services/AIService';
import linkHandler from '../utils/LinkHandler';
import { useTheme } from '../context/ThemeContext';
import voiceService from '../services/VoiceService';

const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, color, themeColors, styles }) => (
    <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
    >
        <View style={[styles.settingIcon, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {rightComponent || (onPress && (
            <Ionicons name="chevron-forward" size={20} color={themeColors.text.muted} />
        ))}
    </TouchableOpacity>
);

const SectionHeader = ({ title, styles }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

export default function SettingsScreen({ navigation, route }) {
    const [profile, setProfile] = useState({ name: '' });
    const [settings, setSettings] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddContact, setShowAddContact] = useState(false);
    const [showEditName, setShowEditName] = useState(false);
    const [newContactName, setNewContactName] = useState('');
    const [newContactPhone, setNewContactPhone] = useState('');
    const [newContactRelation, setNewContactRelation] = useState('');

    const [newName, setNewName] = useState('');
    const [showApproachSelector, setShowApproachSelector] = useState(false);

    // Theme hook
    const { isDark, themeMode, themeColors, aiFontSize, setThemeMode, setAiFontSize } = useTheme();

    // Generate dynamic styles
    const styles = useMemo(() => getStyles(themeColors), [themeColors]);

    const loadData = useCallback(async () => {
        try {
            const profileData = await userData.getProfile();
            setProfile(profileData);
            setNewName(profileData.name || '');

            const settingsData = await userData.getSettings();
            setSettings(settingsData);

            const contactsList = await emergencyService.getEmergencyContacts();
            setContacts(contactsList.filter(c => !c.isPermanent));
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    useEffect(() => {
        if (route.params?.addContact) {
            setShowAddContact(true);
        }
    }, [route.params?.addContact]);

    const handleToggleNotifications = async (value) => {
        const newNotifications = {
            ...settings.notifications,
            enabled: value,
        };
        const updatedSettings = {
            ...settings,
            notifications: newNotifications,
        };
        setSettings(updatedSettings);
        await userData.saveSettings({ notifications: newNotifications });
    };

    const handleToggleMorningCheckIn = async (value) => {
        const newNotifications = {
            ...settings.notifications,
            morningCheckIn: value,
        };
        const updatedSettings = {
            ...settings,
            notifications: newNotifications,
        };
        setSettings(updatedSettings);
        await userData.saveSettings({ notifications: newNotifications });
    };

    const handleToggleEveningCheckIn = async (value) => {
        const newNotifications = {
            ...settings.notifications,
            eveningCheckIn: value,
        };
        const updatedSettings = {
            ...settings,
            notifications: newNotifications,
        };
        setSettings(updatedSettings);
        await userData.saveSettings({ notifications: newNotifications });
    };

    const handleToggleSaveHistory = async (value) => {
        if (!value) {
            Alert.alert(
                'Desativar histórico?',
                'Suas conversas não serão mais salvas. Deseja continuar?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Desativar',
                        style: 'destructive',
                        onPress: async () => {
                            const newPrivacy = {
                                ...settings.privacy,
                                saveHistory: false,
                            };
                            setSettings({
                                ...settings,
                                privacy: newPrivacy,
                            });
                            await userData.saveSettings({ privacy: newPrivacy });
                        },
                    },
                ]
            );
        } else {
            const newPrivacy = {
                ...settings.privacy,
                saveHistory: true,
            };
            setSettings({
                ...settings,
                privacy: newPrivacy,
            });
            await userData.saveSettings({ privacy: newPrivacy });
        }
    };

    const handleToggleVoice = async (value) => {
        const updatedSettings = {
            ...settings,
            voice: {
                ...settings.voice,
                enabled: value,
            },
        };
        setSettings(updatedSettings);
        // CRITICAL FIX: Ensure the service itself is updated
        await voiceService.toggleVoice(value);
        await userData.saveSettings(updatedSettings);
    };

    const handleSaveName = async () => {
        if (newName.trim()) {
            await userData.updateProfile({ name: newName.trim() });
            setProfile({ ...profile, name: newName.trim() });
            setShowEditName(false);
        }
    };

    const handleAddContact = async () => {
        if (!newContactName.trim() || !newContactPhone.trim()) {
            Alert.alert('Erro', 'Nome e telefone são obrigatórios');
            return;
        }

        const result = await emergencyService.addPersonalContact(
            newContactName.trim(),
            newContactPhone.trim(),
            newContactRelation.trim()
        );

        if (result.success) {
            setNewContactName('');
            setNewContactPhone('');
            setNewContactRelation('');
            setShowAddContact(false);
            loadData();
        } else {
            Alert.alert('Erro', result.error || 'Não foi possível adicionar o contato');
        }
    };

    const handleRemoveContact = (contact) => {
        Alert.alert(
            'Remover contato?',
            `Deseja remover ${contact.name} dos contatos de emergência?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        await emergencyService.removePersonalContact(contact.id);
                        loadData();
                    },
                },
            ]
        );
    };

    const handleClearHistory = () => {
        Alert.alert(
            'Limpar histórico?',
            'Todas as suas conversas serão apagadas. Esta ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpar',
                    style: 'destructive',
                    onPress: async () => {
                        await userData.clearChatHistory();
                        Alert.alert('Pronto', 'Histórico de conversas foi limpo');
                    },
                },
            ]
        );
    };

    const handleSetApproach = async (approach) => {
        const updatedSettings = {
            ...settings,
            therapeuticApproach: approach,
        };
        setSettings(updatedSettings);
        await userData.saveSettings(updatedSettings);
        // Atualiza serviço de IA imediatamente
        aiService.setApproach(approach);
        setShowApproachSelector(false);
    };

    if (isLoading || !settings) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ color: themeColors.text.primary }}>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configurações</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <Image
                        source={require('../../assets/settings.png')}
                        style={styles.heroImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Perfil */}
                <SectionHeader title="PERFIL" styles={styles} />
                <View style={styles.section}>
                    <SettingItem
                        icon="person"
                        title="Seu nome"
                        subtitle={profile.name || 'Toque para configurar'}
                        color={themeColors.primary || '#4A90A4'}
                        onPress={() => setShowEditName(true)}
                        themeColors={themeColors}
                        styles={styles}
                    />
                </View>

                {/* Notificações */}
                <SectionHeader title="NOTIFICAÇÕES" styles={styles} />
                <View style={styles.section}>
                    <SettingItem
                        icon="notifications"
                        title="Ativar notificações"
                        subtitle="Receba lembretes de check-in"
                        color="#3498DB"
                        themeColors={themeColors}
                        styles={styles}
                        rightComponent={
                            <Switch
                                value={settings.notifications.enabled}
                                onValueChange={handleToggleNotifications}
                                trackColor={{ false: themeColors.border, true: '#7BB8C9' }}
                                thumbColor={settings.notifications.enabled ? '#4A90A4' : themeColors.surface}
                            />
                        }
                    />
                    {settings.notifications.enabled && (
                        <>
                            <SettingItem
                                icon="sunny"
                                title="Check-in da manhã"
                                subtitle="8:00"
                                color="#F39C12"
                                themeColors={themeColors}
                                styles={styles}
                                rightComponent={
                                    <Switch
                                        value={settings.notifications.morningCheckIn}
                                        onValueChange={handleToggleMorningCheckIn}
                                        trackColor={{ false: themeColors.border, true: '#7BB8C9' }}
                                        thumbColor={settings.notifications.morningCheckIn ? '#4A90A4' : themeColors.surface}
                                    />
                                }
                            />
                            <SettingItem
                                icon="moon"
                                title="Check-in da noite"
                                subtitle="20:00"
                                color="#B8D4E3"
                                themeColors={themeColors}
                                styles={styles}
                                rightComponent={
                                    <Switch
                                        value={settings.notifications.eveningCheckIn}
                                        onValueChange={handleToggleEveningCheckIn}
                                        trackColor={{ false: themeColors.border, true: '#7BB8C9' }}
                                        thumbColor={settings.notifications.eveningCheckIn ? '#4A90A4' : themeColors.surface}
                                    />
                                }
                            />
                        </>
                    )}
                    <SettingItem
                        icon="volume-high"
                        title="Voz da IA"
                        subtitle="A IA fala com você na tela inicial"
                        color="#4A90A4"
                        themeColors={themeColors}
                        styles={styles}
                        rightComponent={
                            <Switch
                                value={settings.voice?.enabled}
                                onValueChange={handleToggleVoice}
                                trackColor={{ false: themeColors.border, true: '#7BB8C9' }}
                                thumbColor={settings.voice?.enabled ? '#4A90A4' : themeColors.surface}
                            />
                        }
                    />
                    {settings.voice?.enabled && (
                        <>
                            <Text style={[styles.settingSubtitle, { marginLeft: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.xs }]}>Estilo de Voz</Text>
                            <View style={styles.voicePersonaContainer}>
                                {voiceService.getPersonas().map((persona) => (
                                    <TouchableOpacity
                                        key={persona.id}
                                        style={[
                                            styles.voicePersonaItem,
                                            voiceService.getCurrentPersona().id === persona.id && styles.voicePersonaItemActive
                                        ]}
                                        onPress={async () => {
                                            await voiceService.setPersona(persona.id);
                                            // Removed personality sync as per user request
                                            setSettings({ ...settings }); // Force re-render
                                        }}
                                    >
                                        <Ionicons name={persona.icon} size={20} color={voiceService.getCurrentPersona().id === persona.id ? '#4A90A4' : themeColors.text.secondary} />
                                        <Text style={[
                                            styles.voicePersonaName,
                                            voiceService.getCurrentPersona().id === persona.id && styles.voicePersonaNameActive
                                        ]}>{persona.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}
                </View>

                {/* Aparência */}
                <SectionHeader title="APARÊNCIA" styles={styles} />
                <View style={styles.section}>
                    <SettingItem
                        icon="contrast"
                        title="Tema Escuro"
                        subtitle={themeMode === 'auto' ? 'Seguindo o sistema' : (isDark ? 'Ativado' : 'Desativado')}
                        color="#B8D4E3"
                        themeColors={themeColors}
                        styles={styles}
                        rightComponent={
                            <Switch
                                value={themeMode === 'dark'}
                                onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
                                trackColor={{ false: themeColors.border, true: '#7BB8C9' }}
                                thumbColor={themeMode === 'dark' ? '#4A90A4' : themeColors.surface}
                            />
                        }
                    />
                    <View style={styles.settingItem}>
                        <View style={[styles.settingIcon, { backgroundColor: `#E8B89D15` }]}>
                            <Ionicons name="text" size={20} color="#E8B89D" />
                        </View>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Tamanho da Fonte da IA</Text>
                            <Text style={styles.settingSubtitle}>Ajuste o tamanho das mensagens</Text>
                        </View>
                    </View>
                    <View style={styles.sliderContainer}>
                        <Text style={[styles.sliderLabel, { fontSize: 12 }]}>A</Text>
                        <View style={styles.sliderTrack}>
                            {[12, 14, 16, 18, 20, 22, 24].map((size) => (
                                <TouchableOpacity
                                    key={size}
                                    style={[
                                        styles.sliderDot,
                                        aiFontSize === size && styles.sliderDotActive
                                    ]}
                                    onPress={() => setAiFontSize(size)}
                                />
                            ))}
                        </View>
                        <Text style={[styles.sliderLabel, { fontSize: 20 }]}>A</Text>
                    </View>
                    <View style={styles.fontPreview}>
                        <Text style={{ fontSize: aiFontSize, color: themeColors.text.primary }}>
                            Prévia: Olá! Como posso te ajudar?
                        </Text>
                    </View>
                </View>

                {/* Contatos de emergência */}
                <SectionHeader title="CONTATOS DE EMERGÊNCIA" styles={styles} />
                <View style={styles.section}>
                    {contacts.map((contact) => (
                        <SettingItem
                            key={contact.id}
                            icon="person"
                            title={contact.name}
                            subtitle={`${contact.phone}${contact.relationship ? ` • ${contact.relationship}` : ''}`}
                            color="#4A90A4"
                            themeColors={themeColors}
                            styles={styles}
                            onPress={() => handleRemoveContact(contact)}
                            rightComponent={
                                <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                            }
                        />
                    ))}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddContact(true)}
                    >
                        <Ionicons name="add-circle" size={24} color="#4A90A4" />
                        <Text style={styles.addButtonText}>Adicionar contato</Text>
                    </TouchableOpacity>
                </View>

                {/* Privacidade */}
                <SectionHeader title="PRIVACIDADE" styles={styles} />
                <View style={styles.section}>
                    <SettingItem
                        icon="save"
                        title="Salvar histórico"
                        subtitle="Manter conversas no dispositivo"
                        color="#98D4BB"
                        themeColors={themeColors}
                        styles={styles}
                        rightComponent={
                            <Switch
                                value={settings.privacy.saveHistory}
                                onValueChange={handleToggleSaveHistory}
                                trackColor={{ false: themeColors.border, true: '#7BB8C9' }}
                                thumbColor={settings.privacy.saveHistory ? '#4A90A4' : themeColors.surface}
                            />
                        }
                    />
                    <SettingItem
                        icon="trash"
                        title="Limpar histórico"
                        subtitle="Apagar todas as conversas"
                        color="#E74C3C"
                        themeColors={themeColors}
                        styles={styles}
                        onPress={handleClearHistory}
                    />
                </View>

                {/* Integração Google Gemini */}
                <SectionHeader title="INTELIGÊNCIA ONLINE (GEMINI)" styles={styles} />
                <View style={styles.section}>
                    <View style={styles.settingItem}>
                        <View style={[styles.settingIcon, { backgroundColor: `#98D4BB15` }]}>
                            <Ionicons name="cloud-upload" size={20} color="#98D4BB" />
                        </View>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Google API Key</Text>
                            <Text style={styles.settingSubtitle}>Conecte para conhecimento atualizado</Text>
                            <TextInput
                                style={{
                                    marginTop: 8,
                                    backgroundColor: themeColors.surfaceVariant,
                                    borderRadius: 8,
                                    padding: 8,
                                    fontSize: 14,
                                    color: themeColors.text.primary
                                }}
                                value={settings.apiKey || ''}
                                placeholder="Cole sua API Key aqui"
                                placeholderTextColor={themeColors.text.muted}
                                secureTextEntry
                                onChangeText={async (text) => {
                                    const updated = { ...settings, apiKey: text };
                                    setSettings(updated);
                                    await userData.saveApiKey(text);
                                    // Atualiza serviço
                                    aiService.configureGemini(text);
                                }}
                            />
                        </View>
                    </View>
                </View>

                {/* Database Connection */}
                <SectionHeader title="BANCO DE DADOS (FIREBASE)" styles={styles} />
                <View style={styles.section}>
                    <View style={styles.settingItem}>
                        <View style={[styles.settingIcon, { backgroundColor: `#F39C1215` }]}>
                            <Ionicons name="server" size={20} color="#F39C12" />
                        </View>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Conexão Nuvem</Text>
                            <Text style={styles.settingSubtitle}>Cole a configuração JSON do Firebase</Text>
                            <TextInput
                                style={{
                                    marginTop: 8,
                                    backgroundColor: themeColors.surfaceVariant,
                                    borderRadius: 8,
                                    padding: 8,
                                    fontSize: 12,
                                    color: themeColors.text.primary,
                                    minHeight: 80,
                                    textAlignVertical: 'top'
                                }}
                                multiline
                                placeholder='{"apiKey": "...", "projectId": "..."}'
                                placeholderTextColor={themeColors.text.muted}
                                secureTextEntry={false}
                                onChangeText={async (text) => {
                                    try {
                                        // Try to parse basic JSON
                                        if (text.trim().startsWith('{')) {
                                            const config = JSON.parse(text);
                                            await import('../services/FirebaseService').then(m => m.default.initialize(config));
                                            Alert.alert('Sucesso', 'Configuração válida e salva!');
                                        }
                                    } catch (e) {
                                        // Ignore parsing errors while typing
                                    }
                                }}
                            />
                        </View>
                    </View>
                </View>

                {/* Abordagem Terapêutica */}
                <SectionHeader title="ABORDAGEM TERAPÊUTICA" styles={styles} />
                <View style={styles.section}>
                    <SettingItem
                        icon="search"
                        title={
                            settings.therapeuticApproach === 'general' ? 'Geral (Padrão)' :
                                settings.therapeuticApproach === 'freud' ? 'Psicanálise (Freud)' :
                                    settings.therapeuticApproach === 'skinner' ? 'Behaviorismo (Skinner)' :
                                        settings.therapeuticApproach === 'deleuze_guattari' ? 'Esquizoanálise (Deleuze & Guattari)' :
                                            settings.therapeuticApproach === 'foucault' ? 'Analítica do Poder (Foucault)' :
                                                settings.therapeuticApproach === 'harm_reduction' ? 'Redução de Danos & Diálogo Aberto' :
                                                    'Poesia do Século XX/XXI'
                        }
                        subtitle="Escolha a perspectiva da IA"
                        color="#B8D4E3"
                        themeColors={themeColors}
                        styles={styles}
                        onPress={() => setShowApproachSelector(true)}
                    />
                </View>

                {/* Recursos Adicionais baseados em pesquisa do usuário */}
                <SectionHeader title="RECURSOS ADICIONAIS" styles={styles} />
                <View style={styles.section}>
                    <SettingItem
                        icon="book"
                        title="Open Dialogue"
                        subtitle="Entenda a abordagem de rede"
                        color="#98D4BB"
                        themeColors={themeColors}
                        styles={styles}
                        onPress={() => linkHandler.openResource('https://opendialogueapproach.com')}
                    />
                    <SettingItem
                        icon="shield"
                        title="Redução de Danos"
                        subtitle="Pilar do cuidado Cuidado Now"
                        color="#B8D4E3"
                        themeColors={themeColors}
                        styles={styles}
                        onPress={() => linkHandler.openResource('https://www.hri.global/what-is-harm-reduction')}
                    />
                </View>

                {/* Sobre */}
                <SectionHeader title="SOBRE" styles={styles} />
                <View style={styles.section}>
                    <SettingItem
                        icon="heart"
                        title="Cuidado-Now"
                        subtitle="Versão 1.2.0"
                        color="#E74C3C"
                        themeColors={themeColors}
                        styles={styles}
                    />
                    <SettingItem
                        icon="globe"
                        title="Website Oficial"
                        subtitle="Acesse o site vinculado ao Firebase"
                        color="#4A90A4"
                        themeColors={themeColors}
                        styles={styles}
                        onPress={() => linkHandler.openWebsite()}
                    />
                    <SettingItem
                        icon="shield-checkmark"
                        title="Privacidade"
                        subtitle="Seus dados ficam apenas no seu dispositivo"
                        color="#27AE60"
                        themeColors={themeColors}
                        styles={styles}
                    />
                </View>

                <View style={styles.bottomSpace} />
            </ScrollView>

            {/* Modal para editar nome */}
            <Modal
                visible={showEditName}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEditName(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Como você quer ser chamado(a)?</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="Seu nome"
                            placeholderTextColor={themeColors.text.muted}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setShowEditName(false)}
                            >
                                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSave]}
                                onPress={handleSaveName}
                            >
                                <Text style={styles.modalButtonSaveText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para adicionar contato */}
            <Modal
                visible={showAddContact}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAddContact(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Novo Contato de Emergência</Text>
                        <Text style={styles.modalSubtitle}>
                            Esta pessoa poderá ser contatada em momentos difíceis
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            value={newContactName}
                            onChangeText={setNewContactName}
                            placeholder="Nome *"
                            placeholderTextColor={themeColors.text.muted}
                        />
                        <TextInput
                            style={styles.modalInput}
                            value={newContactPhone}
                            onChangeText={setNewContactPhone}
                            placeholder="Telefone *"
                            placeholderTextColor={themeColors.text.muted}
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            style={styles.modalInput}
                            value={newContactRelation}
                            onChangeText={setNewContactRelation}
                            placeholder="Parentesco (ex: Mãe, Amigo)"
                            placeholderTextColor={themeColors.text.muted}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => {
                                    setShowAddContact(false);
                                    setNewContactName('');
                                    setNewContactPhone('');
                                    setNewContactRelation('');
                                }}
                            >
                                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSave]}
                                onPress={handleAddContact}
                            >
                                <Text style={styles.modalButtonSaveText}>Adicionar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para selecionar abordagem */}
            <Modal
                visible={showApproachSelector}
                transparent
                animationType="fade"
                onRequestClose={() => setShowApproachSelector(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Abordagem Terapêutica</Text>
                        <Text style={styles.modalSubtitle}>
                            Como você gostaria que a IA interagisse com você?
                        </Text>

                        <ScrollView style={{ maxHeight: 300 }}>
                            {[
                                { id: 'general', title: 'Geral (Padrão)', desc: 'Empática e acolhedora' },
                                { id: 'freud', title: 'Psicanálise (Freud)', desc: 'Foco no inconsciente e na infância' },
                                { id: 'skinner', title: 'Behaviorismo (Skinner)', desc: 'Foco em comportamento e hábitos' },
                                { id: 'deleuze_guattari', title: 'Esquizoanálise (D&G)', desc: 'Foco em desejos e conexões' },
                                { id: 'foucault', title: 'Analítica do Poder (Foucault)', desc: 'Foco em normas e cuidado de si' },
                                { id: 'harm_reduction', title: 'Redução de Danos & Open Dialog', desc: 'Substâncias e suporte em rede' },
                                { id: 'poetry', title: 'Poesia (Séc. XX/XXI)', desc: 'Pessoa, Drummond, Lispector...' },
                            ].map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.approachItem,
                                        settings?.therapeuticApproach === item.id && styles.activeApproachItem
                                    ]}
                                    onPress={() => handleSetApproach(item.id)}
                                >
                                    <View>
                                        <Text style={[
                                            styles.approachTitle,
                                            settings?.therapeuticApproach === item.id && styles.activeApproachText
                                        ]}>{item.title}</Text>
                                        <Text style={[
                                            styles.approachDesc,
                                            settings?.therapeuticApproach === item.id && styles.activeApproachText
                                        ]}>{item.desc}</Text>
                                    </View>
                                    {settings?.therapeuticApproach === item.id && (
                                        <Ionicons name="checkmark-circle" size={24} color="#4A90A4" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setShowApproachSelector(false)}
                            >
                                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: themeColors.background,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: themeColors.text.primary,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
    },
    heroContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    heroImage: {
        width: 180,
        height: 180,
    },
    sectionHeader: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: themeColors.text.secondary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
        letterSpacing: 1,
    },
    section: {
        backgroundColor: themeColors.surface,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
    },
    settingIcon: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    settingInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    settingTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '500',
        color: themeColors.text.primary,
    },
    settingSubtitle: {
        fontSize: typography.fontSize.xs,
        color: themeColors.text.secondary,
        marginTop: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
    },
    addButtonText: {
        marginLeft: spacing.sm,
        color: '#4A90A4',
        fontWeight: '600',
        fontSize: typography.fontSize.md,
    },
    // Styles for sliders and custom controls
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
    },
    sliderTrack: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        height: 4,
        backgroundColor: themeColors.border,
        borderRadius: 2,
    },
    sliderDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: themeColors.border,
    },
    sliderDotActive: {
        backgroundColor: '#4A90A4',
        transform: [{ scale: 1.2 }],
    },
    sliderLabel: {
        color: themeColors.text.secondary,
        fontWeight: 'bold',
    },
    fontPreview: {
        padding: spacing.md,
        backgroundColor: themeColors.surfaceVariant,
        borderRadius: borderRadius.md,
        margin: spacing.sm,
    },
    voicePersonaContainer: {
        paddingHorizontal: spacing.sm,
        paddingBottom: spacing.md,
    },
    voicePersonaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.xs,
        borderRadius: borderRadius.md,
        backgroundColor: themeColors.surfaceVariant,
    },
    voicePersonaItemActive: {
        backgroundColor: '#4A90A415',
        borderWidth: 1,
        borderColor: '#4A90A4',
    },
    voicePersonaName: {
        marginLeft: spacing.sm,
        fontSize: typography.fontSize.md,
        color: themeColors.text.primary,
    },
    voicePersonaNameActive: {
        color: '#4A90A4',
        fontWeight: '600',
    },
    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: themeColors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        ...shadows.lg,
    },
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: themeColors.text.primary,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    modalInput: {
        backgroundColor: themeColors.surfaceVariant,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: typography.fontSize.md,
        color: themeColors.text.primary,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: themeColors.border,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
    },
    modalButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginHorizontal: spacing.xs,
    },
    modalButtonCancel: {
        backgroundColor: themeColors.surfaceVariant,
    },
    modalButtonCancelText: {
        color: themeColors.text.primary,
        fontWeight: '600',
    },
    modalButtonSave: {
        backgroundColor: '#4A90A4',
    },
    modalButtonSaveText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    approachItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: themeColors.surfaceVariant,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeApproachItem: {
        backgroundColor: '#4A90A415',
        borderColor: '#4A90A4',
    },
    approachTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: themeColors.text.primary,
        marginBottom: 2,
    },
    activeApproachText: {
        color: '#4A90A4',
    },
    approachDesc: {
        fontSize: typography.fontSize.xs,
        color: themeColors.text.secondary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: themeColors.background,
    },
    bottomSpace: {
        height: 60,
    }
});
