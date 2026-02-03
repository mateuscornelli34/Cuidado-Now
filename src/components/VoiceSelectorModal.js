import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, shadows, typography } from '../styles/theme';
import voiceService from '../services/VoiceService';

export default function VoiceSelectorModal({ visible, onClose, currentVoice, onSelectVoice }) {
    const { themeColors } = useTheme();
    const styles = getStyles(themeColors);

    const handleSelect = async (persona) => {
        await voiceService.setPersona(persona.id);
        onSelectVoice(persona);
        voiceService.speak(`Olá, eu sou ${persona.name}.`);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.voiceModalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Escolha a Voz da IA</Text>
                        <TouchableOpacity onPress={onClose}>
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
                                onPress={() => handleSelect(persona)}
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
    );
}

const getStyles = (themeColors) => StyleSheet.create({
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
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: themeColors.text.primary,
    },
    voiceList: {
        marginBottom: spacing.md,
    },
    voiceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: themeColors.background,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: themeColors.border,
    },
    voiceItemActive: {
        borderColor: themeColors.primary.main,
        backgroundColor: `${themeColors.primary.main}10`,
    },
    voiceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: themeColors.surface,
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
        fontWeight: 'bold',
        color: themeColors.text.primary,
        marginBottom: 2,
    },
    voiceNameActive: {
        color: themeColors.primary.main,
    },
    voiceDescription: {
        fontSize: typography.fontSize.xs,
        color: themeColors.text.secondary,
    },
});
