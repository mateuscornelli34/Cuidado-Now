/**
 * Cuidado-Now AI - Vídeo Chamada
 * Interface estilo Google Meet
 * Compatível com expo-camera v15+
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    Dimensions,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAudioMode } from 'expo-av/build/Audio';
import * as Clipboard from 'expo-clipboard';

const { width: SW, height: SH } = Dimensions.get('window');

// Gerar código de reunião aleatório
const generateMeetingCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const gen = (n) => Array(n).fill(0).map(() => chars[Math.floor(Math.random() * 26)]).join('');
    return `${gen(3)}-${gen(4)}-${gen(3)}`;
};

// Helper para alertas cross-platform
const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

// Componente de botão de controle
const ControlButton = memo(({ icon, active, onPress, danger }) => (
    <TouchableOpacity
        style={[
            styles.controlBtn,
            !active && styles.controlBtnOff,
            danger && styles.controlBtnDanger
        ]}
        onPress={onPress}
    >
        <Ionicons name={icon} size={24} color="#fff" />
    </TouchableOpacity>
));

export default function VideoCallScreen({ navigation }) {
    const { themeColors, isDark } = useTheme();

    // Permissões da câmera (nova API)
    const [permission, requestPermission] = useCameraPermissions();

    // Estados
    const [viewMode, setViewMode] = useState('home'); // 'home' | 'preview' | 'meeting'
    const [meetingCode, setMeetingCode] = useState('');
    const [currentMeetingCode, setCurrentMeetingCode] = useState('');
    const [userName, setUserName] = useState('Você');

    // Controles de mídia
    const [cameraOn, setCameraOn] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const [facing, setFacing] = useState('front'); // 'front' | 'back'
    const [isLoading, setIsLoading] = useState(false);

    // Participantes
    const [participants, setParticipants] = useState([]);

    // Chat
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');

    // Modal de informações
    const [showInfo, setShowInfo] = useState(false);

    const cameraRef = useRef(null);

    // Solicitar permissão ao entrar na tela
    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, []);

    // Criar nova reunião
    const handleNewMeeting = useCallback(() => {
        const code = generateMeetingCode();
        setCurrentMeetingCode(code);
        setViewMode('preview');
    }, []);

    // Entrar em reunião existente
    const handleJoinMeeting = useCallback(() => {
        if (!meetingCode.trim()) {
            showAlert('Código necessário', 'Digite o código da reunião');
            return;
        }
        setCurrentMeetingCode(meetingCode.trim().toLowerCase());
        setViewMode('preview');
    }, [meetingCode]);

    // Iniciar reunião
    const handleStartMeeting = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            setParticipants([
                { id: 'self', name: userName, isSelf: true, isMuted: !micOn, hasVideo: cameraOn }
            ]);
            setViewMode('meeting');
            setIsLoading(false);
        }, 1000);
    }, [userName, micOn, cameraOn]);

    // Encerrar chamada
    const endMeeting = useCallback(() => {
        setViewMode('home');
        setParticipants([]);
        setMessages([]);
        setCurrentMeetingCode('');
        setMeetingCode('');
        setCameraOn(true);
        setMicOn(true);
        setFacing('front');
        setShowChat(false);
        setShowInfo(false);
    }, []);

    const handleEndCall = useCallback(() => {
        if (Platform.OS === 'web') {
            // Na web, usa confirm nativo
            if (window.confirm('Deseja sair desta reunião?')) {
                endMeeting();
            }
        } else {
            // No mobile, usa Alert
            Alert.alert('Sair da reunião', 'Deseja sair desta reunião?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: endMeeting }
            ]);
        }
    }, [endMeeting]);

    // Copiar código
    const handleCopyCode = useCallback(async () => {
        await Clipboard.setStringAsync(currentMeetingCode);
        showAlert('Copiado!', 'Código da reunião copiado');
    }, [currentMeetingCode]);

    // Enviar mensagem no chat
    const handleSendMessage = useCallback(() => {
        if (!chatInput.trim()) return;
        setMessages(prev => [...prev, {
            id: Date.now(),
            user: userName,
            text: chatInput.trim(),
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }]);
        setChatInput('');
    }, [chatInput, userName]);

    // Alternar câmera frontal/traseira
    const toggleFacing = useCallback(() => {
        setFacing(prev => prev === 'front' ? 'back' : 'front');
    }, []);

    // Verificar permissão
    const hasPermission = permission?.granted;

    // ==================== HOME ====================
    if (viewMode === 'home') {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: themeColors.surface }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>
                        Vídeo Chamada
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Conteúdo */}
                <View style={styles.homeContent}>
                    <Ionicons name="videocam" size={80} color="#4285f4" />
                    <Text style={[styles.homeTitle, { color: themeColors.text.primary }]}>
                        Chamadas de vídeo seguras
                    </Text>
                    <Text style={[styles.homeSubtitle, { color: themeColors.text.secondary }]}>
                        Conecte-se com profissionais e grupos de apoio
                    </Text>

                    {/* Status de permissão */}
                    {!hasPermission && (
                        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                            <Ionicons name="camera-outline" size={20} color="#fff" />
                            <Text style={styles.permissionBtnText}>Permitir câmera</Text>
                        </TouchableOpacity>
                    )}

                    {/* Nova reunião */}
                    <TouchableOpacity style={styles.newMeetingBtn} onPress={handleNewMeeting}>
                        <Ionicons name="videocam" size={20} color="#fff" />
                        <Text style={styles.newMeetingText}>Nova reunião</Text>
                    </TouchableOpacity>

                    {/* Entrar em reunião */}
                    <View style={styles.joinSection}>
                        <TextInput
                            style={[styles.codeInput, {
                                backgroundColor: isDark ? '#333' : '#f5f5f5',
                                color: themeColors.text.primary
                            }]}
                            value={meetingCode}
                            onChangeText={setMeetingCode}
                            placeholder="Digite o código da reunião"
                            placeholderTextColor={themeColors.text.muted}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={[styles.joinBtn, !meetingCode && styles.joinBtnDisabled]}
                            onPress={handleJoinMeeting}
                            disabled={!meetingCode}
                        >
                            <Text style={styles.joinBtnText}>Participar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    // ==================== PREVIEW ====================
    if (viewMode === 'preview') {
        return (
            <View style={[styles.container, { backgroundColor: '#202124' }]}>
                {/* Preview da câmera */}
                <View style={styles.previewCamera}>
                    {hasPermission && cameraOn ? (
                        <CameraView
                            ref={cameraRef}
                            style={StyleSheet.absoluteFill}
                            facing={facing}
                        />
                    ) : (
                        <View style={styles.cameraOff}>
                            <View style={styles.avatarLarge}>
                                <Text style={styles.avatarText}>{userName[0].toUpperCase()}</Text>
                            </View>
                            {!hasPermission && (
                                <Text style={styles.permissionText}>Câmera sem permissão</Text>
                            )}
                        </View>
                    )}

                    {/* Controles de preview */}
                    <View style={styles.previewControls}>
                        <ControlButton
                            icon={micOn ? 'mic' : 'mic-off'}
                            active={micOn}
                            onPress={() => setMicOn(!micOn)}
                        />
                        <ControlButton
                            icon={cameraOn ? 'videocam' : 'videocam-off'}
                            active={cameraOn}
                            onPress={() => setCameraOn(!cameraOn)}
                        />
                        {cameraOn && hasPermission && (
                            <ControlButton
                                icon="camera-reverse"
                                active
                                onPress={toggleFacing}
                            />
                        )}
                    </View>
                </View>

                {/* Info e botões */}
                <View style={styles.previewInfo}>
                    <Text style={styles.previewTitle}>Pronto para participar?</Text>
                    <View style={styles.codeRow}>
                        <Text style={styles.codeLabel}>Código: </Text>
                        <Text style={styles.codeValue}>{currentMeetingCode}</Text>
                        <TouchableOpacity onPress={handleCopyCode}>
                            <Ionicons name="copy-outline" size={18} color="#8ab4f8" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.previewButtons}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => setViewMode('home')}
                        >
                            <Text style={styles.cancelBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.startBtn}
                            onPress={handleStartMeeting}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.startBtnText}>Participar agora</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    // ==================== MEETING ====================
    return (
        <View style={styles.meetingContainer}>
            {/* Área principal de vídeo */}
            <View style={styles.videoArea}>
                {cameraOn && hasPermission ? (
                    <CameraView
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        facing={facing}
                    />
                ) : (
                    <View style={styles.meetingCameraOff}>
                        <View style={styles.avatarMeeting}>
                            <Text style={styles.avatarMeetingText}>{userName[0].toUpperCase()}</Text>
                        </View>
                    </View>
                )}

                {/* Info da reunião */}
                <View style={styles.meetingHeader}>
                    <Text style={styles.meetingCode}>{currentMeetingCode}</Text>
                    <TouchableOpacity onPress={() => setShowInfo(true)}>
                        <Ionicons name="information-circle-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Indicador de status */}
                <View style={styles.statusIndicator}>
                    {!micOn && <Ionicons name="mic-off" size={16} color="#ea4335" />}
                    {!cameraOn && <Ionicons name="videocam-off" size={16} color="#ea4335" />}
                </View>
            </View>

            {/* Barra de controles */}
            <View style={styles.controlsBar}>
                <ControlButton
                    icon={micOn ? 'mic' : 'mic-off'}
                    active={micOn}
                    onPress={() => setMicOn(!micOn)}
                />
                <ControlButton
                    icon={cameraOn ? 'videocam' : 'videocam-off'}
                    active={cameraOn}
                    onPress={() => setCameraOn(!cameraOn)}
                />
                <ControlButton
                    icon="camera-reverse"
                    active
                    onPress={toggleFacing}
                />
                <ControlButton
                    icon="chatbubble-ellipses"
                    active
                    onPress={() => setShowChat(true)}
                />
                <ControlButton
                    icon="call"
                    danger
                    onPress={handleEndCall}
                />
            </View>

            {/* Chat Modal */}
            <Modal visible={showChat} animationType="slide" transparent>
                <View style={styles.chatModal}>
                    <View style={styles.chatContainer}>
                        <View style={styles.chatHeader}>
                            <Text style={styles.chatTitle}>Chat da reunião</Text>
                            <TouchableOpacity onPress={() => setShowChat(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.chatMessages}>
                            {messages.length === 0 ? (
                                <Text style={styles.chatEmpty}>Nenhuma mensagem ainda</Text>
                            ) : (
                                messages.map(msg => (
                                    <View key={msg.id} style={styles.chatMessage}>
                                        <Text style={styles.chatUser}>{msg.user} • {msg.time}</Text>
                                        <Text style={styles.chatText}>{msg.text}</Text>
                                    </View>
                                ))
                            )}
                        </ScrollView>

                        <View style={styles.chatInputRow}>
                            <TextInput
                                style={styles.chatInput}
                                value={chatInput}
                                onChangeText={setChatInput}
                                placeholder="Enviar mensagem..."
                                placeholderTextColor="#888"
                            />
                            <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendMessage}>
                                <Ionicons name="send" size={20} color="#8ab4f8" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Info Modal */}
            <Modal visible={showInfo} transparent animationType="fade">
                <View style={styles.infoModal}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>Informações da reunião</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Código:</Text>
                            <Text style={styles.infoValue}>{currentMeetingCode}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Participantes:</Text>
                            <Text style={styles.infoValue}>{participants.length}</Text>
                        </View>
                        <TouchableOpacity style={styles.infoCopyBtn} onPress={handleCopyCode}>
                            <Ionicons name="copy-outline" size={18} color="#8ab4f8" />
                            <Text style={styles.infoCopyText}>Copiar código</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.infoCloseBtn} onPress={() => setShowInfo(false)}>
                            <Text style={styles.infoCloseText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    headerBtn: { padding: 8 },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'center' },

    // Home
    homeContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    homeTitle: { fontSize: 24, fontWeight: '700', marginTop: 24, textAlign: 'center' },
    homeSubtitle: { fontSize: 16, marginTop: 8, textAlign: 'center', marginBottom: 32 },
    permissionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ea4335', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, gap: 8, marginBottom: 16 },
    permissionBtnText: { color: '#fff', fontWeight: '600' },
    newMeetingBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4285f4', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 24, gap: 8 },
    newMeetingText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    joinSection: { flexDirection: 'row', marginTop: 24, gap: 12 },
    codeInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, fontSize: 16 },
    joinBtn: { backgroundColor: '#34a853', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    joinBtnDisabled: { opacity: 0.5 },
    joinBtnText: { color: '#fff', fontWeight: '600' },

    // Preview
    previewCamera: { flex: 1, backgroundColor: '#000', justifyContent: 'flex-end' },
    cameraOff: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3c4043' },
    avatarLarge: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#5f6368', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 48, color: '#fff', fontWeight: '600' },
    permissionText: { color: '#fff', marginTop: 16, opacity: 0.7 },
    previewControls: { flexDirection: 'row', justifyContent: 'center', gap: 16, padding: 24 },
    previewInfo: { backgroundColor: '#202124', padding: 24, alignItems: 'center' },
    previewTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
    codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    codeLabel: { color: '#9aa0a6', fontSize: 14 },
    codeValue: { color: '#8ab4f8', fontSize: 14, fontWeight: '600' },
    previewButtons: { flexDirection: 'row', marginTop: 24, gap: 16 },
    cancelBtn: { paddingVertical: 12, paddingHorizontal: 24 },
    cancelBtnText: { color: '#8ab4f8', fontSize: 16, fontWeight: '600' },
    startBtn: { backgroundColor: '#8ab4f8', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 24 },
    startBtnText: { color: '#000', fontSize: 16, fontWeight: '600' },

    // Control buttons
    controlBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#3c4043', justifyContent: 'center', alignItems: 'center' },
    controlBtnOff: { backgroundColor: '#ea4335' },
    controlBtnDanger: { backgroundColor: '#ea4335' },

    // Meeting
    meetingContainer: { flex: 1, backgroundColor: '#202124' },
    videoArea: { flex: 1, backgroundColor: '#000' },
    meetingCameraOff: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3c4043' },
    avatarMeeting: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#5f6368', justifyContent: 'center', alignItems: 'center' },
    avatarMeetingText: { fontSize: 40, color: '#fff', fontWeight: '600' },
    meetingHeader: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    meetingCode: { color: '#fff', fontSize: 14, opacity: 0.8 },
    statusIndicator: { position: 'absolute', top: 50, right: 16, flexDirection: 'row', gap: 8 },
    controlsBar: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingVertical: 20, backgroundColor: '#202124' },

    // Chat
    chatModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    chatContainer: { height: SH * 0.6, backgroundColor: '#202124', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
    chatTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
    chatMessages: { flex: 1, padding: 16 },
    chatEmpty: { color: '#9aa0a6', textAlign: 'center', marginTop: 40 },
    chatMessage: { marginBottom: 16 },
    chatUser: { color: '#9aa0a6', fontSize: 12, marginBottom: 4 },
    chatText: { color: '#fff', fontSize: 14 },
    chatInputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#333', gap: 12 },
    chatInput: { flex: 1, backgroundColor: '#3c4043', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#fff' },
    chatSendBtn: { padding: 10 },

    // Info modal
    infoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    infoBox: { backgroundColor: '#2d2e30', borderRadius: 12, padding: 24, width: '100%', maxWidth: 360 },
    infoTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 20 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    infoLabel: { color: '#9aa0a6', fontSize: 14 },
    infoValue: { color: '#fff', fontSize: 14 },
    infoCopyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, padding: 12 },
    infoCopyText: { color: '#8ab4f8', fontSize: 14 },
    infoCloseBtn: { marginTop: 8, padding: 12, alignItems: 'center' },
    infoCloseText: { color: '#8ab4f8', fontSize: 16, fontWeight: '600' },
});
