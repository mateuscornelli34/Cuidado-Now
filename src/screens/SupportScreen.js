/**
 * Cuidado-Now - Tela de Suporte
 * Redireciona para WhatsApp para suporte humano
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Linking,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';

const WHATSAPP_NUMBER = '5545999078628'; // Número formatado para WhatsApp API
const WHATSAPP_MESSAGE = 'Olá! Preciso de suporte com o app Cuidado-Now.';

export default function SupportScreen({ navigation }) {
    const handleWhatsAppRedirect = () => {
        const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        Linking.openURL(whatsappUrl).catch((err) => {
            console.error('Erro ao abrir WhatsApp:', err);
            // Fallback para o número de telefone
            Linking.openURL(`tel:+${WHATSAPP_NUMBER}`);
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Imagem de suporte */}
                <Image
                    source={require('../../assets/support.png')}
                    style={styles.heroImage}
                    resizeMode="contain"
                />

                {/* Título e descrição */}
                <Text style={styles.title}>Suporte Humano</Text>
                <Text style={styles.description}>
                    Precisa de ajuda? Nosso time está pronto para te atender via WhatsApp.
                </Text>

                {/* Botão de WhatsApp */}
                <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={handleWhatsAppRedirect}
                    activeOpacity={0.8}
                >
                    <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
                    <Text style={styles.whatsappButtonText}>Falar no WhatsApp</Text>
                </TouchableOpacity>

                {/* Informações adicionais */}
                <View style={styles.infoCard}>
                    <Ionicons name="time-outline" size={20} color={colors.primary.main} />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Horário de Atendimento</Text>
                        <Text style={styles.infoSubtitle}>Segunda a Sexta, 9h às 18h</Text>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent.hope} />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Atendimento Seguro</Text>
                        <Text style={styles.infoSubtitle}>Suas conversas são privadas</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroImage: {
        width: 200,
        height: 200,
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: '700',
        color: colors.light.text.primary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    description: {
        fontSize: typography.fontSize.md,
        color: colors.light.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
        lineHeight: 24,
    },
    whatsappButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#25D366',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        ...shadows.md,
    },
    whatsappButtonText: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: spacing.sm,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        width: '100%',
        ...shadows.sm,
    },
    infoTextContainer: {
        marginLeft: spacing.md,
    },
    infoTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.light.text.primary,
    },
    infoSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.light.text.secondary,
    },
});
