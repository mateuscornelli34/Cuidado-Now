/**
 * Lumina AI - Tela de Registro/Cadastro
 * Coleta de dados essenciais para personalização e segurança
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, shadows, typography } from '../styles/theme';
import userData from '../storage/UserData';
import emergencyService from '../services/EmergencyService';
import { useTheme } from '../context/ThemeContext';

export default function RegistrationScreen({ navigation }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '', // Format: DD/MM/AAAA
        emergencyName: '',
        emergencyPhone: '',
    });

    const [loading, setLoading] = useState(false);

    const { themeColors } = useTheme();
    const styles = useMemo(() => getStyles(themeColors), [themeColors]);

    const formatPhone = (phone) => {
        // Simple mask logic could live here or be applied on change
        return phone;
    };

    const validateForm = () => {
        if (!formData.email.includes('@') || formData.password.length < 6) {
            Alert.alert('Atenção', 'Email inválido ou senha muito curta (min 6 caracteres).');
            return false;
        }
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            Alert.alert('Atenção', 'Por favor, preencha seu nome completo.');
            return false;
        }
        if (!formData.phone.trim()) {
            Alert.alert('Atenção', 'Seu telefone é importante para segurança.');
            return false;
        }
        if (!formData.dateOfBirth.trim() || formData.dateOfBirth.length < 10) {
            Alert.alert('Atenção', 'Data de nascimento inválida (DD/MM/AAAA).');
            return false;
        }
        if (!formData.emergencyPhone.trim() || !formData.emergencyName.trim()) {
            Alert.alert('Atenção', 'Adicione um contato de emergência.');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // 0. Create Auth Account
            const authResult = await import('../services/FirebaseService').then(m => m.default.register(formData.email, formData.password));
            if (!authResult.success) {
                if (authResult.error.includes('email-already-in-use')) {
                    throw new Error('Email já cadastrado.');
                }
                throw new Error(authResult.error);
            }

            // 1. Save Profile Data
            const profileData = {
                email: formData.email.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                name: formData.firstName.trim(), // Keep legacy 'name' support
                phone: formData.phone.trim(),
                dateOfBirth: formData.dateOfBirth.trim(),
                emergencyContact: formData.emergencyPhone.trim(),
            };

            await userData.saveProfile(profileData);

            // 2. Save Emergency Contact
            await emergencyService.addPersonalContact(
                formData.emergencyName.trim(),
                formData.emergencyPhone.trim(),
                'Contato de Registro'
            );

            // 3. Mark Onboarding as Complete
            await userData.setOnboardingComplete();

            Alert.alert(
                'Bem-vindo(a)!',
                'Seu cadastro foi realizado com sucesso.',
                [{ text: 'Ok', onPress: () => { } }]
            );
        } catch (error) {
            console.error('Registration Error:', error);
            Alert.alert('Erro', 'Houve uma falha ao salvar seus dados. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/registration.png')}
                        style={styles.heroImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Criar Cadastro</Text>
                    <Text style={styles.subtitle}>
                        Para oferecermos o melhor suporte, precisamos te conhecer um pouco.
                    </Text>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Dados de Acesso</Text>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="seu@email.com"
                        placeholderTextColor={themeColors.text.muted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.email}
                        onChangeText={(t) => setFormData({ ...formData, email: t })}
                    />
                    <Text style={styles.label}>Senha</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Mínimo 6 caracteres"
                        placeholderTextColor={themeColors.text.muted}
                        secureTextEntry
                        value={formData.password}
                        onChangeText={(t) => setFormData({ ...formData, password: t })}
                    />
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Dados Pessoais</Text>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>Nome</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Seu nome"
                                placeholderTextColor={themeColors.text.muted}
                                value={formData.firstName}
                                onChangeText={(t) => setFormData({ ...formData, firstName: t })}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.label}>Sobrenome</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Sobrenome"
                                placeholderTextColor={themeColors.text.muted}
                                value={formData.lastName}
                                onChangeText={(t) => setFormData({ ...formData, lastName: t })}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Data de Nascimento</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="DD/MM/AAAA"
                        placeholderTextColor={themeColors.text.muted}
                        keyboardType="numbers-and-punctuation"
                        maxLength={10}
                        value={formData.dateOfBirth}
                        onChangeText={(t) => setFormData({ ...formData, dateOfBirth: t })}
                    />

                    <Text style={styles.label}>Seu Telefone</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="(00) 00000-0000"
                        placeholderTextColor={themeColors.text.muted}
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(t) => setFormData({ ...formData, phone: t })}
                    />
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Contato de Emergência</Text>
                    <Text style={styles.sectionContext}>
                        Essencial para sua segurança em momentos de crise.
                    </Text>

                    <Text style={styles.label}>Nome do Contato</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Mãe, Amigo, Irmão"
                        placeholderTextColor={themeColors.text.muted}
                        value={formData.emergencyName}
                        onChangeText={(t) => setFormData({ ...formData, emergencyName: t })}
                    />

                    <Text style={styles.label}>Telefone de Emergência</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="(00) 00000-0000"
                        placeholderTextColor={themeColors.text.muted}
                        keyboardType="phone-pad"
                        value={formData.emergencyPhone}
                        onChangeText={(t) => setFormData({ ...formData, emergencyPhone: t })}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Salvando...' : 'Finalizar Cadastro'}
                    </Text>
                    {!loading && <Ionicons name="arrow-forward" size={20} color={themeColors.text.inverse} style={{ marginLeft: 8 }} />}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const getStyles = (themeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColors.background,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.xl,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: `${themeColors.primary.main}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    heroImage: {
        width: 150,
        height: 150,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: '700',
        color: themeColors.primary.main,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: spacing.md,
    },
    formSection: {
        backgroundColor: themeColors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    sectionTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: themeColors.text.primary,
        marginBottom: spacing.md,
    },
    sectionContext: {
        fontSize: typography.fontSize.xs,
        color: themeColors.text.secondary,
        marginBottom: spacing.md,
        fontStyle: 'italic',
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: typography.fontSize.xs,
        fontWeight: '500',
        color: themeColors.text.secondary,
        marginBottom: 4,
        marginTop: 8,
    },
    input: {
        backgroundColor: themeColors.surfaceVariant,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: typography.fontSize.md,
        color: themeColors.text.primary,
    },
    button: {
        backgroundColor: themeColors.primary.main,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
        ...shadows.md,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: themeColors.text.inverse,
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
});
