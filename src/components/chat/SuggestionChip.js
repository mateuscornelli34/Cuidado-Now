/**
 * Cuidado-Now AI - SuggestionChip Component
 * Chip de sugestão de atividade
 */

import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '../../styles/theme';

const SuggestionChip = memo(({ suggestion, onPress, themeColors }) => {
    const styles = getStyles(themeColors);

    return (
        <TouchableOpacity
            style={styles.chip}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons
                name={suggestion.icon || 'bulb'}
                size={16}
                color={themeColors.primary.main}
            />
            <Text style={styles.text}>{suggestion.title}</Text>
        </TouchableOpacity>
    );
});

const getStyles = (themeColors) => StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
        borderWidth: 1,
        borderColor: themeColors.primary.light,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    text: {
        color: themeColors.primary.main,
        fontWeight: '500',
        marginLeft: spacing.xs,
        fontSize: typography.fontSize.sm,
    },
});

SuggestionChip.displayName = 'SuggestionChip';

export default SuggestionChip;
