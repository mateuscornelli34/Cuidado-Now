/**
 * MindCare AI - Tela de Login
 * Autenticação segura compatível com Web e Mobile
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';
import firebaseService from '../services/FirebaseService';
import userData from '../storage/UserData';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);
        const result = await firebaseService.login(email, password);

        if (result.success) {
            // Sincroniza ID do usuário
            await userData.init();
            navigation.replace('Home');
        } else {
            Alert.alert('Falha no Login', 'Verifique suas credenciais ou a configuração do Firebase.');
        }
        setLoading(false);
    };

    const handleGoogleLogin = () => {
        Alert.alert('Google Login', 'A integração nativa com Google será configurada na próxima etapa.');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="heart" size={48} color={colors.primary.main} />
                    </View>
                    <Text style={styles.title}>MindCare AI</Text>
                    <Text style={styles.subtitle}>Seu espaço seguro de escuta e apoio.</Text>
                </View>

                <View style={[styles.formContainer, isWeb && styles.webCard]}>
                    <Text style={styles.sectionTitle}>Entrar</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="seu@email.com"
                            placeholderTextColor={colors.light.text.muted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Senha</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Sua senha"
                                placeholderTextColor={colors.light.text.muted}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={20}
                                    color={colors.light.text.muted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={handleGoogleLogin}
                    >
                        <Ionicons name="logo-google" size={20} color={colors.light.text.primary} />
                        <Text style={styles.googleButtonText}>Entrar com Google</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Ainda não tem conta?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
                            <Text style={styles.linkText}>Cadastre-se</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${colors.primary.main}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.primary.main,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.light.text.secondary,
        marginTop: spacing.xs,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    webCard: {
        backgroundColor: colors.light.surface,
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        ...shadows.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '600',
        color: colors.light.text.primary,
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.fontSize.sm,
        color: colors.light.text.primary,
        marginBottom: spacing.xs,
        fontWeight: '500',
    },
    input: {
        backgroundColor: colors.light.surfaceVariant,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: typography.fontSize.md,
        color: colors.light.text.primary,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.surfaceVariant,
        borderRadius: borderRadius.lg,
    },
    passwordInput: {
        flex: 1,
        padding: spacing.md,
        fontSize: typography.fontSize.md,
        color: colors.light.text.primary,
    },
    eyeButton: {
        padding: spacing.md,
    },
    loginButton: {
        backgroundColor: colors.primary.main,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.md,
        ...shadows.sm,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: colors.light.surface,
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.light.surface,
        borderWidth: 1,
        borderColor: colors.light.border,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginTop: spacing.md,
    },
    googleButtonText: {
        color: colors.light.text.primary,
        fontSize: typography.fontSize.md,
        fontWeight: '500',
        marginLeft: spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        color: colors.light.text.secondary,
        marginRight: spacing.xs,
    },
    linkText: {
        color: colors.primary.main,
        fontWeight: '600',
    },
});
