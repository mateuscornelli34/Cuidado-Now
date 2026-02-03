/**
 * Cuidado-Now AI - TypingIndicator Component
 * Indicador de digitação animado
 */

import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../styles/theme';

const TypingIndicator = memo(({ themeColors }) => {
    const dots = [
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
    ];

    useEffect(() => {
        const animations = dots.map((dot, index) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(index * 150),
                    Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
                ])
            )
        );
        Animated.parallel(animations).start();

        return () => {
            animations.forEach(anim => anim.stop());
        };
    }, []);

    const styles = getStyles(themeColors);

    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                <Ionicons name="heart" size={16} color={themeColors.surface} />
            </View>
            <View style={styles.bubble}>
                {dots.map((dot, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.dot,
                            { transform: [{ translateY: Animated.multiply(dot, -4) }] },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
});

const getStyles = (themeColors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.round,
        backgroundColor: themeColors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.xs,
    },
    bubble: {
        flexDirection: 'row',
        backgroundColor: themeColors.surfaceVariant,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        borderBottomLeftRadius: borderRadius.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: themeColors.text.muted,
        marginHorizontal: 2,
    },
});

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;
