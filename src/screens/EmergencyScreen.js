/**
 * MindCare AI - Tela de Emergência
 * Contatos de emergência, recursos de ajuda e suporte em crise
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Linking,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, borderRadius, shadows, typography } from '../styles/theme';
import emergencyService from '../services/EmergencyService';
import linkHandler from '../utils/LinkHandler';
import { useTheme } from '../context/ThemeContext';

const ContactCard = ({ contact, onCall, styles, themeColors }) => {
    const isPermanent = contact.isPermanent;

    return (
        <TouchableOpacity
            style={[
                styles.contactCard,
                isPermanent && styles.contactCardEmergency,
            ]}
            onPress={() => onCall(contact)}
            activeOpacity={0.7}
        >
            <View style={[styles.contactIcon, { backgroundColor: `${contact.color}20` }]}>
                <Ionicons
                    name={contact.icon === 'heart' ? 'heart' : contact.icon === 'medical' ? 'medkit' : 'person'}
                    size={24}
                    color={contact.color}
                />
            </View>
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactDescription}>{contact.description}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
            <View style={[styles.callButton, { backgroundColor: contact.color }]}>
                <Ionicons name="call" size={20} color={themeColors.surface} />
            </View>
        </TouchableOpacity>
    );
};

const ResourceCard = ({ resource, styles, themeColors }) => {
    const handleOpen = async () => {
        if (resource.phone) {
            await emergencyService.makeCall(resource.phone);
        } else if (resource.website) {
            await linkHandler.openResource(resource.website);
        }
    };

    return (
        <TouchableOpacity style={styles.resourceCard} onPress={handleOpen} activeOpacity={0.8}>
            <View style={[styles.resourceIcon, { backgroundColor: `${resource.color}15` }]}>
                <Ionicons name={resource.icon} size={24} color={resource.color} />
            </View>
            <View style={styles.resourceInfo}>
                <Text style={styles.resourceName}>{resource.name}</Text>
                <Text style={styles.resourceDescription}>{resource.description}</Text>
                {resource.phone && (
                    <Text style={[styles.resourcePhone, { color: resource.color }]}>
                        📞 {resource.phone}
                    </Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeColors.text.muted} />
        </TouchableOpacity>
    );
};

export default function EmergencyScreen({ navigation }) {
    const [contacts, setContacts] = useState([]);
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const { themeColors } = useTheme();
    const styles = useMemo(() => getStyles(themeColors), [themeColors]);

    const loadData = useCallback(async () => {
        try {
            const contactsList = await emergencyService.getEmergencyContacts();
            setContacts(contactsList);

            const resourcesList = emergencyService.getHelpResources();
            setResources(resourcesList);
        } catch (error) {
            console.error('Erro ao carregar contatos:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleCall = async (contact) => {
        Alert.alert(
            `Ligar para ${contact.name}?`,
            `Número: ${contact.phone}`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Ligar',
                    onPress: async () => {
                        const result = await emergencyService.makeCall(contact.phone);
                        if (!result.success) {
                            Alert.alert('Erro', result.error || 'Não foi possível fazer a ligação');
                        }
                    },
                },
            ]
        );
    };

    const crisisMessage = emergencyService.getCrisisMessage();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajuda de Emergência</Text>
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
                        source={require('../../assets/emergency.png')}
                        style={styles.heroImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Banner de apoio */}
                <View style={styles.supportBanner}>
                    <Ionicons name="heart" size={32} color={themeColors.error} />
                    <Text style={styles.supportTitle}>{crisisMessage.primary}</Text>
                    <Text style={styles.supportText}>{crisisMessage.secondary}</Text>
                    <Text style={styles.supportAction}>{crisisMessage.action}</Text>
                </View>

                {/* Contatos de emergência */}
                <Text style={styles.sectionTitle}>🆘 Ligação de Emergência</Text>
                <Text style={styles.sectionSubtitle}>
                    Toque para ligar imediatamente
                </Text>

                {contacts.filter(c => c.isPermanent).map((contact) => (
                    <ContactCard key={contact.id} contact={contact} onCall={handleCall} styles={styles} themeColors={themeColors} />
                ))}

                {/* Contatos pessoais */}
                {contacts.filter(c => !c.isPermanent).length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
                            👥 Seus Contatos de Confiança
                        </Text>
                        {contacts.filter(c => !c.isPermanent).map((contact) => (
                            <ContactCard key={contact.id} contact={contact} onCall={handleCall} styles={styles} themeColors={themeColors} />
                        ))}
                    </>
                )}

                {/* Adicionar contato */}
                <TouchableOpacity
                    style={styles.addContactButton}
                    onPress={() => navigation.navigate('Settings', { addContact: true })}
                >
                    <Ionicons name="add-circle-outline" size={24} color={themeColors.primary.main} />
                    <Text style={styles.addContactText}>Adicionar contato de confiança</Text>
                </TouchableOpacity>

                {/* Recursos de ajuda */}
                <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
                    💙 Recursos de Ajuda
                </Text>
                <Text style={styles.sectionSubtitle}>
                    Serviços profissionais disponíveis
                </Text>

                {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} styles={styles} themeColors={themeColors} />
                ))}

                {/* Mensagem final */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Lembre-se: pedir ajuda é um sinal de força, não de fraqueza.
                        Você não está sozinho(a). 💙
                    </Text>
                </View>
            </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: themeColors.surface,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
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
    supportBanner: {
        backgroundColor: themeColors.emergency.background,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: themeColors.emergency.border,
    },
    heroContainer: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    heroImage: {
        width: 140,
        height: 140,
    },
    supportTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: themeColors.emergency.text,
        textAlign: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    supportText: {
        fontSize: typography.fontSize.md,
        color: themeColors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    supportAction: {
        fontSize: typography.fontSize.md,
        color: themeColors.primary.main,
        textAlign: 'center',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: themeColors.text.primary,
        marginBottom: spacing.xs,
    },
    sectionSubtitle: {
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
        marginBottom: spacing.md,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    contactCardEmergency: {
        borderWidth: 2,
        borderColor: themeColors.error,
    },
    contactIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    contactName: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: themeColors.text.primary,
        marginBottom: 2,
    },
    contactDescription: {
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
        marginBottom: 2,
    },
    contactPhone: {
        fontSize: typography.fontSize.md,
        fontWeight: '700',
        color: themeColors.primary.main,
    },
    callButton: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addContactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${themeColors.primary.main}10`,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 2,
        borderColor: themeColors.primary.main,
        borderStyle: 'dashed',
    },
    addContactText: {
        fontSize: typography.fontSize.md,
        fontWeight: '500',
        color: themeColors.primary.main,
        marginLeft: spacing.sm,
    },
    resourceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    resourceIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resourceInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    resourceName: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: themeColors.text.primary,
        marginBottom: 2,
    },
    resourceDescription: {
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
        marginBottom: 4,
    },
    resourcePhone: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
    },
    footer: {
        marginTop: spacing.xl,
        marginBottom: spacing.xxl,
        padding: spacing.lg,
        backgroundColor: `${themeColors.primary.main}10`,
        borderRadius: borderRadius.lg,
    },
    footerText: {
        fontSize: typography.fontSize.md,
        color: themeColors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
});
