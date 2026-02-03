/**
 * Cuidado-Now AI - ProactiveDialog Component
 * Caixa de diálogo proativa com respostas rápidas
 */

import React, { useEffect, useRef, memo } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography, shadows } from '../../styles/theme';
import { TIMING } from '../../config/constants';

const ProactiveDialog = memo(({
    message,
    onQuickReply,
    quickReplies = [],
    themeColors
}) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animação de entrada
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // Animação de pulso no avatar
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: TIMING.PULSE_DURATION,
                    useNativeDriver: true
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: TIMING.PULSE_DURATION,
                    useNativeDriver: true
                }),
            ])
        );
        pulseAnimation.start();

        return () => {
            pulseAnimation.stop();
        };
    }, []);

    const styles = getStyles(themeColors);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            {/* Avatar animado */}
            <Animated.View style={[styles.avatar, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="heart" size={28} color={themeColors.surface} />
            </Animated.View>

            {/* Respostas rápidas */}
            {quickReplies.length > 0 && (
                <View style={styles.repliesContainer}>
                    {quickReplies.map((reply, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.replyButton}
                            onPress={() => onQuickReply(reply.text)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={reply.icon || 'chatbubble'}
                                size={16}
                                color={themeColors.primary.main}
                            />
                            <Text style={styles.replyText}>{reply.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </Animated.View>
    );
});

const getStyles = (themeColors) => StyleSheet.create({
    container: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.round,
        backgroundColor: themeColors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        ...shadows.md,
    },
    repliesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
        borderWidth: 1,
        borderColor: themeColors.primary.light,
        ...shadows.sm,
    },
    replyText: {
        color: themeColors.primary.main,
        fontWeight: '500',
        marginLeft: spacing.xs,
        fontSize: typography.fontSize.sm,
    },
});

ProactiveDialog.displayName = 'ProactiveDialog';

export default ProactiveDialog;
