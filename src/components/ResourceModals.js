import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../styles/theme';
import linkHandler from '../utils/LinkHandler';

export function ResourceModal({ visible, onClose, title, links }) {
    const { themeColors } = useTheme();
    const styles = useMemo(() => getStyles(themeColors), [themeColors]);

    return (
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
}

const getStyles = (themeColors) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: themeColors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: themeColors.text.primary,
    },
    resourceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: themeColors.background,
        marginBottom: spacing.sm,
    },
    resourceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
    },
    resourceSubtitle: {
        fontSize: typography.fontSize.xs,
        color: themeColors.text.secondary,
    }
});
