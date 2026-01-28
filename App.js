/**
 * Lumina AI - Aplicativo Principal
 * Assistente de Saúde Mental para iOS e Android
 * Desenvolvido com React Native e Expo
 */

import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// Importação das telas do aplicativo
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import SupportScreen from './src/screens/SupportScreen';
import LoginScreen from './src/screens/LoginScreen';

// Sistema de cores e tema
import { colors } from './src/styles/theme';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Previne que o splash screen se esconda automaticamente
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

function MainTabs() {
    const { isDark, themeColors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Chat') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'Emergency') {
                        iconName = focused ? 'call' : 'call-outline';
                    } else if (route.name === 'Registration') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    } else if (route.name === 'Support') {
                        iconName = focused ? 'logo-whatsapp' : 'logo-whatsapp';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary.main,
                tabBarInactiveTintColor: isDark ? '#888' : 'gray',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: themeColors.border,
                    backgroundColor: themeColors.surface,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                }
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
            <Tab.Screen name="Chat" component={ChatScreen} options={{ title: 'Conversa' }} />
            <Tab.Screen name="Emergency" component={EmergencyScreen} options={{ title: 'Ajuda' }} />
            <Tab.Screen name="Registration" component={RegistrationScreen} options={{ title: 'Cadastro' }} />
            <Tab.Screen name="Support" component={SupportScreen} options={{ title: 'Suporte' }} />
            <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
        </Tab.Navigator>
    );
}

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Carrega as fontes dos ícones do Ionicons
                await Font.loadAsync({
                    ...Ionicons.font,
                });
            } catch (e) {
                console.warn('Erro ao carregar fontes:', e);
            } finally {
                // Indica que o app está pronto
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            // Esconde o splash screen quando o app estiver pronto
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <ThemeProvider>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <AppContent />
                    </NavigationContainer>
                </SafeAreaProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

function AppContent() {
    const { isDark } = useTheme();
    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <MainTabs />
        </>
    );
}
