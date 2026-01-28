/**
 * Cuidado-Now AI - MessageBubble Component
 * Componente de bolha de mensagem individual com animação
 */

import React, { useEffect, useRef, memo } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '../../styles/theme';
import { TIMING } from '../../config/constants';

const { width } = Dimensions.get('window');

const MessageBubble = memo(({
    message,
    showEmergency,
    onEmergencyPress,
    aiFontSize = 16,
    themeColors
}) => {
    const isUser = message.isUser;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: TIMING.ANIMATION_DURATION,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const styles = getStyles(themeColors);

    return (
        <Animated.View
            style={[
                styles.container,
                isUser ? styles.userContainer : styles.aiContainer,
                { opacity: fadeAnim },
            ]}
        >
            {!isUser && (
                <View style={styles.avatar}>
                    <Ionicons name="heart" size={16} color={themeColors.surface} />
                </View>
            )}
            <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[
                    styles.messageText,
                    isUser ? styles.userText : { fontSize: aiFontSize, color: themeColors.text.primary }
                ]}>
                    {message.text}
                </Text>
                <Text style={[styles.time, isUser && styles.userTime]}>
                    {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>
            {showEmergency && !isUser && (
                <TouchableOpacity style={styles.emergencyButton} onPress={onEmergencyPress}>
                    <Ionicons name="call" size={18} color={themeColors.surface} />
                    <Text style={styles.emergencyText}>Preciso de ajuda</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
});

const getStyles = (themeColors) => StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    userContainer: {
        alignItems: 'flex-end',
    },
    aiContainer: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
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
        maxWidth: width * 0.75,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    userBubble: {
        backgroundColor: themeColors.primary.main,
        borderBottomRightRadius: borderRadius.sm,
    },
    aiBubble: {
        backgroundColor: themeColors.surfaceVariant,
        borderBottomLeftRadius: borderRadius.sm,
    },
    messageText: {
        lineHeight: 22,
    },
    userText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.md,
    },
    time: {
        fontSize: typography.fontSize.xs,
        color: themeColors.text.muted,
        marginTop: spacing.xs,
    },
    userTime: {
        color: 'rgba(255,255,255,0.7)',
    },
    emergencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.error,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
        marginTop: spacing.sm,
        alignSelf: 'flex-start',
    },
    emergencyText: {
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: spacing.xs,
    },
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
