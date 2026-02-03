/**
 * Cuidado-Now AI - CrisisContactChip Component
 * Chip de contato de crise para situações de emergência
 */

import React, { memo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography, shadows } from '../../styles/theme';

const CrisisContactChip = memo(({ contact, onPress, themeColors }) => {
    const styles = getStyles(themeColors, contact.color);

    return (
        <TouchableOpacity
            style={styles.chip}
            onPress={() => onPress(contact.phone)}
            activeOpacity={0.7}
        >
            <Ionicons
                name={contact.icon || 'call'}
                size={18}
                color={contact.color || themeColors.error}
            />
            <View style={styles.info}>
                <Text style={styles.name}>{contact.name}</Text>
                <Text style={styles.phone}>{contact.phone}</Text>
            </View>
        </TouchableOpacity>
    );
});

const getStyles = (themeColors, contactColor) => StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: contactColor || themeColors.error,
        marginHorizontal: spacing.lg,
        marginVertical: spacing.xs,
        ...shadows.sm,
    },
    info: {
        marginLeft: spacing.md,
        flex: 1,
    },
    name: {
        color: themeColors.text.primary,
        fontWeight: '600',
        fontSize: typography.fontSize.md,
    },
    phone: {
        color: themeColors.text.secondary,
        fontSize: typography.fontSize.sm,
        marginTop: 2,
    },
});

CrisisContactChip.displayName = 'CrisisContactChip';

export default CrisisContactChip;
