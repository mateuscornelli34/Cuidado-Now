import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';

const EmergencyPermissionModal = ({ visible, onConfirm, onDeny }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDeny}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="shield-checkmark" size={48} color={colors.error} />
                    </View>

                    <Text style={styles.title}>Sua segurança em primeiro lugar</Text>

                    <Text style={styles.description}>
                        O Cuidado-Now AI monitora situações de risco eminente. Você permite que a IA inicie uma ligação para seus contatos de emergência caso perceba que você está em perigo?
                    </Text>

                    <View style={styles.noteContainer}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.light.text.secondary} />
                        <Text style={styles.note}>
                            Isso só será usado em casos extremos e você sempre terá o controle.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={onConfirm}
                    >
                        <Text style={styles.confirmButtonText}>Sim, eu permito</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.denyButton}
                        onPress={onDeny}
                    >
                        <Text style={styles.denyButtonText}>Agora não</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    container: {
        backgroundColor: colors.light.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
        ...shadows.lg,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${colors.error}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.light.text.primary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    description: {
        fontSize: typography.fontSize.md,
        color: colors.light.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing.lg,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.surfaceVariant,
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.xl,
    },
    note: {
        fontSize: typography.fontSize.xs,
        color: colors.light.text.secondary,
        marginLeft: spacing.xs,
        flex: 1,
    },
    confirmButton: {
        backgroundColor: colors.primary.main,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
    },
    denyButton: {
        paddingVertical: spacing.md,
        width: '100%',
        alignItems: 'center',
    },
    denyButtonText: {
        color: colors.light.text.muted,
        fontSize: typography.fontSize.sm,
    },
});

export default EmergencyPermissionModal;
