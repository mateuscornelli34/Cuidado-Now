/**
 * Cuidado-Now AI - Editor de Documentos Avançado
 * Com gerenciamento de pastas e salvamento local
 */

import React, { useState, useMemo, useRef, useCallback, memo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    Modal,
    ActivityIndicator,
    Dimensions,
    Alert,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, shadows, typography } from '../styles/theme';
import DocumentStorage from '../storage/DocumentStorage';

// Importações condicionais
let FileSystem, Sharing, Print;
if (Platform.OS !== 'web') {
    FileSystem = require('expo-file-system');
    Sharing = require('expo-sharing');
    Print = require('expo-print');
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import { FONTS, FONT_SIZES, TEXT_COLORS, HIGHLIGHT_COLORS, LINE_SPACINGS } from '../config/EditorConfig';

// ============ COMPONENTES ============
const ToolbarButton = memo(({ icon, label, isActive, onPress, disabled, size = 18 }) => {
    const { themeColors } = useTheme();
    return (
        <TouchableOpacity
            style={[styles.toolBtn, isActive && { backgroundColor: '#4285f420' }, disabled && { opacity: 0.4 }]}
            onPress={onPress}
            disabled={disabled}
        >
            {icon ? (
                <Ionicons name={icon} size={size} color={isActive ? '#4285f4' : themeColors.text.primary} />
            ) : (
                <Text style={[styles.toolBtnLabel, isActive && { color: '#4285f4' }]}>{label}</Text>
            )}
        </TouchableOpacity>
    );
});

// ============ COMPONENTE PRINCIPAL ============
export default function DocumentationScreen({ navigation }) {
    const { themeColors, isDark } = useTheme();

    // View mode: 'browser' | 'editor'
    const [viewMode, setViewMode] = useState('browser');

    // File browser state
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState('root');
    const [documents, setDocuments] = useState([]);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Editor state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [underline, setUnderline] = useState(false);
    const [strikethrough, setStrikethrough] = useState(false);
    const [fontSize, setFontSize] = useState(11);
    const [fontFamily, setFontFamily] = useState(FONTS[0]);
    const [textColor, setTextColor] = useState('#000000');
    const [highlightColor, setHighlightColor] = useState('transparent');
    const [textAlign, setTextAlign] = useState('left');
    const [lineSpacing, setLineSpacing] = useState(LINE_SPACINGS[1]); // 1.15 default

    // Modals
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showFontPicker, setShowFontPicker] = useState(false);
    const [showSizePicker, setShowSizePicker] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [showLineSpacingPicker, setShowLineSpacingPicker] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Delete Folder State
    const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState(null);

    // Carregar dados
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const allFolders = await DocumentStorage.getFolders();
            setFolders([...allFolders]);
            const docs = await DocumentStorage.getDocuments(currentFolder);
            setDocuments(docs);
        } catch (error) {
            console.error('Erro ao carregar:', error);
        }
        setIsLoading(false);
    }, [currentFolder]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Criar nova pasta
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        await DocumentStorage.createFolder(newFolderName);
        setNewFolderName('');
        setShowNewFolderModal(false);
        loadData();
    };

    // Iniciar exclusão de pasta
    const handleDeleteFolder = (folderId) => {
        setFolderToDelete(folderId);
        setShowDeleteFolderModal(true);
    };

    // Confirmar exclusão (Passo 1: Escolher modo)
    const handleConfirmDeleteChoice = (deleteContents) => {
        if (deleteContents) {
            // Se for apagar tudo, pede confirmação extra
            setShowDeleteFolderModal(false);
            setTimeout(() => setShowDeleteConfirmModal(true), 100); // Pequeno delay para transição suave
        } else {
            // Se for mover, executa direto
            executeDeleteFolder(false);
        }
    };

    // Executar exclusão final
    const executeDeleteFolder = async (deleteContents) => {
        if (!folderToDelete) return;

        try {
            await DocumentStorage.deleteFolder(folderToDelete, deleteContents);
            if (currentFolder === folderToDelete) setCurrentFolder('root');

            // Resetar estados
            setShowDeleteFolderModal(false);
            setShowDeleteConfirmModal(false);
            setFolderToDelete(null);

            // Recarregar dados
            loadData();
        } catch (error) {
            console.error('Erro ao excluir pasta:', error);
            Alert.alert('Erro', 'Não foi possível excluir a pasta.');
        }
    };

    // Criar novo documento
    const handleNewDocument = async () => {
        const doc = await DocumentStorage.createDocument('Documento sem título', '', currentFolder);
        setCurrentDoc(doc);
        setTitle(doc.title);
        setContent('');
        setViewMode('editor');
    };

    // Abrir documento
    const handleOpenDocument = (doc) => {
        setCurrentDoc(doc);
        setTitle(doc.title);
        setContent(doc.content || '');
        if (doc.formatting) {
            setFontSize(doc.formatting.fontSize || 11);
            setTextColor(doc.formatting.textColor || '#000000');
        }
        setViewMode('editor');
    };

    // Salvar documento
    const handleSaveDocument = async () => {
        if (!currentDoc) return;
        setIsSaving(true);
        await DocumentStorage.saveDocument(currentDoc.id, {
            title,
            content,
            formatting: { fontFamily: fontFamily.id, fontSize, textColor, bold, italic, underline, textAlign }
        });
        setLastSaved(new Date());
        setIsSaving(false);
    };

    // Auto-save
    useEffect(() => {
        if (viewMode === 'editor' && currentDoc && content) {
            const timer = setTimeout(handleSaveDocument, 2000);
            return () => clearTimeout(timer);
        }
    }, [content, title]);

    // Deletar documento
    const handleDeleteDocument = (docId) => {
        Alert.alert('Excluir Documento', 'Esta ação não pode ser desfeita.', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir', style: 'destructive', onPress: async () => {
                    await DocumentStorage.deleteDocument(docId);
                    loadData();
                }
            }
        ]);
    };

    // Deletar documento atual (do editor)
    const handleDeleteCurrentDocument = useCallback(async () => {
        if (!currentDoc) return;

        const confirmDelete = async () => {
            try {
                await DocumentStorage.deleteDocument(currentDoc.id);
                setCurrentDoc(null);
                setTitle('');
                setContent('');
                setViewMode('browser');
                loadData();
            } catch (error) {
                console.error('Erro ao deletar documento:', error);
            }
        };

        // Compatibilidade com web
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`Deseja realmente excluir "${title}"? Esta ação não pode ser desfeita.`);
            if (confirmed) {
                await confirmDelete();
            }
        } else {
            Alert.alert(
                'Excluir Documento',
                `Deseja realmente excluir "${title}"? Esta ação não pode ser desfeita.`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Excluir',
                        style: 'destructive',
                        onPress: confirmDelete
                    }
                ]
            );
        }
    }, [currentDoc, title, loadData]);

    // Voltar para browser
    const handleBackToBrowser = async () => {
        await handleSaveDocument();
        setViewMode('browser');
        loadData();
    };

    // Gerar HTML
    const generateHTML = useCallback(() => {
        const lines = content.split('\n').map(l => l ? `<p>${l}</p>` : '<p><br></p>').join('');
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>body{font-family:${fontFamily.family};font-size:${fontSize}pt;color:${textColor};line-height:1.6;max-width:800px;margin:40px auto;padding:20px;${bold ? 'font-weight:bold;' : ''}${italic ? 'font-style:italic;' : ''}text-align:${textAlign};}h1{border-bottom:2px solid #4285f4;padding-bottom:10px;}</style>
</head><body><h1>${title}</h1>${lines}</body></html>`;
    }, [title, content, fontFamily, fontSize, textColor, bold, italic, textAlign]);

    // Exportar
    const exportDocument = async (format) => {
        setIsSaving(true);
        try {
            const safeName = title.replace(/[^a-zA-Z0-9]/g, '_');
            if (format === 'pdf' && Platform.OS === 'web') {
                const win = window.open('', '_blank');
                win?.document.write(generateHTML());
                win?.document.close();
                setTimeout(() => win?.print(), 300);
            } else if (format === 'doc' && Platform.OS === 'web') {
                const blob = new Blob([generateHTML()], { type: 'application/msword' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${safeName}.doc`;
                a.click();
            } else if (format === 'txt' && Platform.OS === 'web') {
                const blob = new Blob([`${title}\n\n${content}`], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${safeName}.txt`;
                a.click();
            }
            setShowExportModal(false);
        } catch (e) {
            console.error(e);
        }
        setIsSaving(false);
    };

    const currentFolderData = folders.find(f => f.id === currentFolder);

    // ============ BROWSER VIEW ============
    if (viewMode === 'browser') {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
                {/* Header */}
                <View style={[styles.browserHeader, { backgroundColor: themeColors.surface }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.browserTitle, { color: themeColors.text.primary }]}>
                        {currentFolder === 'root' ? '📄 Meus Documentos' : `📂 ${currentFolderData?.name || 'Pasta'}`}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {currentFolder !== 'root' && (
                            <TouchableOpacity
                                onPress={() => handleDeleteFolder(currentFolder)}
                                style={[styles.newDocBtn, { backgroundColor: '#ea4335' }]}
                            >
                                <Ionicons name="trash-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={handleNewDocument} style={styles.newDocBtn}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Folders Row */}
                <View style={[styles.foldersRow, { backgroundColor: themeColors.surface }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foldersScroll}>
                        {folders.map(folder => (
                            <TouchableOpacity
                                key={folder.id}
                                style={[styles.folderChip, currentFolder === folder.id && styles.folderChipActive]}
                                onPress={() => setCurrentFolder(folder.id)}
                                onLongPress={() => folder.id !== 'root' && handleDeleteFolder(folder.id)}
                            >
                                <Ionicons name={folder.id === 'root' ? "home" : "folder"} size={16} color={currentFolder === folder.id ? '#fff' : '#fbbc04'} />
                                <Text style={[styles.folderChipText, currentFolder === folder.id && { color: '#fff' }]} numberOfLines={1}>
                                    {folder.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.addFolderBtn} onPress={() => setShowNewFolderModal(true)}>
                            <Ionicons name="add" size={18} color="#4285f4" />
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Documents List */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4285f4" />
                    </View>
                ) : documents.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-outline" size={64} color={themeColors.text.muted} />
                        <Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>
                            Nenhum documento nesta pasta
                        </Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={handleNewDocument}>
                            <Text style={styles.emptyBtnText}>Criar Documento</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={documents}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.docsList}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.docCard, { backgroundColor: themeColors.surface }]}
                                onPress={() => handleOpenDocument(item)}
                                onLongPress={() => handleDeleteDocument(item.id)}
                            >
                                <View style={styles.docIcon}>
                                    <Ionicons name="document-text" size={32} color="#4285f4" />
                                </View>
                                <View style={styles.docInfo}>
                                    <Text style={[styles.docTitle, { color: themeColors.text.primary }]} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <Text style={[styles.docMeta, { color: themeColors.text.muted }]}>
                                        {new Date(item.updatedAt).toLocaleDateString('pt-BR')} • {(item.content?.length || 0)} caracteres
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={themeColors.text.muted} />
                            </TouchableOpacity>
                        )}
                    />
                )}

                {/* New Folder Modal */}
                <Modal visible={showNewFolderModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalBox, { backgroundColor: themeColors.surface }]}>
                            <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>Nova Pasta</Text>
                            <TextInput
                                style={[styles.modalInput, { color: themeColors.text.primary, borderColor: themeColors.border }]}
                                value={newFolderName}
                                onChangeText={setNewFolderName}
                                placeholder="Nome da pasta"
                                placeholderTextColor={themeColors.text.muted}
                                autoFocus
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowNewFolderModal(false)}>
                                    <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleCreateFolder}>
                                    <Text style={styles.modalBtnConfirmText}>Criar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Delete Folder Choice Modal */}
                <Modal visible={showDeleteFolderModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalBox, { backgroundColor: themeColors.surface }]}>
                            <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>Excluir Pasta</Text>
                            <Text style={{ color: themeColors.text.secondary, marginBottom: 20 }}>
                                O que você deseja fazer com os arquivos desta pasta?
                            </Text>

                            <TouchableOpacity
                                style={[styles.modalBtnOption, { borderColor: themeColors.border }]}
                                onPress={() => handleConfirmDeleteChoice(false)}
                            >
                                <Ionicons name="folder-open-outline" size={24} color="#4285f4" />
                                <View>
                                    <Text style={[styles.modalOptionTitle, { color: themeColors.text.primary }]}>Mover para Início</Text>
                                    <Text style={[styles.modalOptionDesc, { color: themeColors.text.muted }]}>Mantém os arquivos</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtnOption, { borderColor: themeColors.border, marginTop: 10 }]}
                                onPress={() => handleConfirmDeleteChoice(true)}
                            >
                                <Ionicons name="trash-outline" size={24} color="#ea4335" />
                                <View>
                                    <Text style={[styles.modalOptionTitle, { color: themeColors.text.primary }]}>Apagar Tudo</Text>
                                    <Text style={[styles.modalOptionDesc, { color: themeColors.text.muted }]}>Exclui pasta e arquivos</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={[styles.modalButtons, { marginTop: 20 }]}>
                                <TouchableOpacity
                                    style={[styles.modalBtnCancel, { flex: 1 }]}
                                    onPress={() => { setShowDeleteFolderModal(false); setFolderToDelete(null); }}
                                >
                                    <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Delete Folder Confirmation Modal (Destructive) */}
                <Modal visible={showDeleteConfirmModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalBox, { backgroundColor: themeColors.surface }]}>
                            <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#ea433520', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                    <Ionicons name="warning-outline" size={28} color="#ea4335" />
                                </View>
                                <Text style={[styles.modalTitle, { color: themeColors.text.primary, textAlign: 'center' }]}>Tem certeza?</Text>
                            </View>

                            <Text style={{ color: themeColors.text.secondary, marginBottom: 24, textAlign: 'center' }}>
                                Isso apagará a pasta e todos os documentos dentro dela <Text style={{ fontWeight: 'bold', color: '#ea4335' }}>permanentemente</Text>. Esta ação não pode ser desfeita.
                            </Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalBtnCancel, { flex: 1 }]}
                                    onPress={() => { setShowDeleteConfirmModal(false); setShowDeleteFolderModal(true); }}
                                >
                                    <Text style={styles.modalBtnCancelText}>Voltar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtnConfirm, { backgroundColor: '#ea4335', flex: 1 }]}
                                    onPress={() => executeDeleteFolder(true)}
                                >
                                    <Text style={styles.modalBtnConfirmText}>Apagar Tudo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    // ============ EDITOR VIEW ============
    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: themeColors.surface }]}>
                <TouchableOpacity onPress={handleBackToBrowser} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
                </TouchableOpacity>
                <TextInput
                    style={[styles.titleInput, { color: themeColors.text.primary }]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Título do documento"
                    placeholderTextColor={themeColors.text.muted}
                />
                <TouchableOpacity style={styles.saveIndicator} onPress={handleSaveDocument}>
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#4285f4" />
                    ) : (
                        <Ionicons name="cloud-done" size={20} color="#34a853" />
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.exportBtn} onPress={() => setShowExportModal(true)}>
                    <Ionicons name="download-outline" size={20} color="#4285f4" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteCurrentDocument}>
                    <Ionicons name="trash-outline" size={20} color="#ea4335" />
                </TouchableOpacity>
            </View>

            {/* Toolbar */}
            <View style={[styles.toolbar, { backgroundColor: themeColors.surface }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
                    {/* Font Family Picker */}
                    <TouchableOpacity style={styles.fontPicker} onPress={() => { setShowFontPicker(!showFontPicker); setShowSizePicker(false); setShowColorPicker(false); setShowHighlightPicker(false); setShowLineSpacingPicker(false); }}>
                        <Text style={{ color: themeColors.text.primary, fontSize: 12, maxWidth: 100 }} numberOfLines={1}>{fontFamily.name}</Text>
                        <Ionicons name="chevron-down" size={12} color={themeColors.text.muted} />
                    </TouchableOpacity>

                    {/* Font Size Picker */}
                    <TouchableOpacity style={styles.sizePicker} onPress={() => { setShowSizePicker(!showSizePicker); setShowFontPicker(false); setShowColorPicker(false); setShowHighlightPicker(false); setShowLineSpacingPicker(false); }}>
                        <Text style={{ color: themeColors.text.primary, fontSize: 12 }}>{fontSize}</Text>
                        <Ionicons name="chevron-down" size={10} color={themeColors.text.muted} />
                    </TouchableOpacity>

                    <View style={styles.toolDivider} />

                    {/* Text Formatting */}
                    <ToolbarButton label="B" isActive={bold} onPress={() => setBold(!bold)} />
                    <ToolbarButton label="I" isActive={italic} onPress={() => setItalic(!italic)} />
                    <ToolbarButton label="U" isActive={underline} onPress={() => setUnderline(!underline)} />
                    <TouchableOpacity
                        style={[styles.toolBtn, strikethrough && { backgroundColor: '#4285f420' }]}
                        onPress={() => setStrikethrough(!strikethrough)}
                    >
                        <Text style={[styles.strikethroughLabel, strikethrough && { color: '#4285f4' }, { color: themeColors.text.primary }]}>S̶</Text>
                    </TouchableOpacity>

                    <View style={styles.toolDivider} />

                    {/* Text Color */}
                    <TouchableOpacity style={styles.colorBtn} onPress={() => { setShowColorPicker(!showColorPicker); setShowFontPicker(false); setShowSizePicker(false); setShowHighlightPicker(false); setShowLineSpacingPicker(false); }}>
                        <Text style={[styles.colorBtnA, { color: textColor }]}>A</Text>
                        <View style={[styles.colorBar, { backgroundColor: textColor }]} />
                    </TouchableOpacity>

                    {/* Highlight Color */}
                    <TouchableOpacity style={styles.highlightBtn} onPress={() => { setShowHighlightPicker(!showHighlightPicker); setShowFontPicker(false); setShowSizePicker(false); setShowColorPicker(false); setShowLineSpacingPicker(false); }}>
                        <Ionicons name="color-fill" size={16} color={highlightColor === 'transparent' ? themeColors.text.primary : highlightColor} />
                        <View style={[styles.colorBar, { backgroundColor: highlightColor === 'transparent' ? '#ffff00' : highlightColor }]} />
                    </TouchableOpacity>

                    <View style={styles.toolDivider} />

                    {/* Text Alignment */}
                    <ToolbarButton icon="reorder-four" isActive={textAlign === 'left'} onPress={() => setTextAlign('left')} />
                    <ToolbarButton icon="reorder-three" isActive={textAlign === 'center'} onPress={() => setTextAlign('center')} />
                    <ToolbarButton icon="reorder-four" isActive={textAlign === 'right'} onPress={() => setTextAlign('right')} />
                    <ToolbarButton icon="menu" isActive={textAlign === 'justify'} onPress={() => setTextAlign('justify')} />

                    <View style={styles.toolDivider} />

                    {/* Line Spacing */}
                    <TouchableOpacity style={styles.lineSpacingBtn} onPress={() => { setShowLineSpacingPicker(!showLineSpacingPicker); setShowFontPicker(false); setShowSizePicker(false); setShowColorPicker(false); setShowHighlightPicker(false); }}>
                        <Ionicons name="swap-vertical" size={16} color={themeColors.text.primary} />
                        <Text style={{ fontSize: 9, color: themeColors.text.muted }}>{lineSpacing.name}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Font Picker Dropdown */}
            {showFontPicker && (
                <View style={[styles.pickerDropdown, { backgroundColor: themeColors.surface }]}>
                    <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator>
                        {FONTS.map(f => (
                            <TouchableOpacity key={f.id} style={[styles.pickerItem, fontFamily.id === f.id && styles.pickerItemActive]} onPress={() => { setFontFamily(f); setShowFontPicker(false); }}>
                                <Text style={{ fontFamily: f.family, color: fontFamily.id === f.id ? '#4285f4' : themeColors.text.primary }}>{f.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Size Picker Dropdown */}
            {showSizePicker && (
                <View style={[styles.pickerDropdown, { backgroundColor: themeColors.surface, left: 130 }]}>
                    <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator>
                        {FONT_SIZES.map(s => (
                            <TouchableOpacity key={s} style={[styles.pickerItem, fontSize === s && styles.pickerItemActive]} onPress={() => { setFontSize(s); setShowSizePicker(false); }}>
                                <Text style={{ color: fontSize === s ? '#4285f4' : themeColors.text.primary }}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Color Picker Dropdown - Grid Style */}
            {showColorPicker && (
                <View style={[styles.colorPickerDropdown, { backgroundColor: themeColors.surface }]}>
                    <Text style={[styles.pickerLabel, { color: themeColors.text.secondary }]}>Cor do texto</Text>
                    <View style={styles.colorGrid}>
                        {TEXT_COLORS.map((c, i) => (
                            <TouchableOpacity
                                key={`${c}-${i}`}
                                style={[styles.colorSwatch, { backgroundColor: c }, textColor === c && styles.colorSwatchActive]}
                                onPress={() => { setTextColor(c); setShowColorPicker(false); }}
                            />
                        ))}
                    </View>
                </View>
            )}

            {/* Highlight Picker Dropdown */}
            {showHighlightPicker && (
                <View style={[styles.colorPickerDropdown, { backgroundColor: themeColors.surface, left: 220 }]}>
                    <Text style={[styles.pickerLabel, { color: themeColors.text.secondary }]}>Cor de destaque</Text>
                    <View style={styles.colorGrid}>
                        {HIGHLIGHT_COLORS.map((c, i) => (
                            <TouchableOpacity
                                key={`hl-${c}-${i}`}
                                style={[
                                    styles.colorSwatch,
                                    { backgroundColor: c === 'transparent' ? '#fff' : c },
                                    c === 'transparent' && styles.transparentSwatch,
                                    highlightColor === c && styles.colorSwatchActive
                                ]}
                                onPress={() => { setHighlightColor(c); setShowHighlightPicker(false); }}
                            >
                                {c === 'transparent' && <Ionicons name="close" size={12} color="#999" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Line Spacing Picker */}
            {showLineSpacingPicker && (
                <View style={[styles.pickerDropdown, { backgroundColor: themeColors.surface, left: 'auto', right: 10 }]}>
                    <Text style={[styles.pickerLabel, { color: themeColors.text.secondary }]}>Espaçamento</Text>
                    {LINE_SPACINGS.map(ls => (
                        <TouchableOpacity key={ls.id} style={[styles.pickerItem, lineSpacing.id === ls.id && styles.pickerItemActive]} onPress={() => { setLineSpacing(ls); setShowLineSpacingPicker(false); }}>
                            <Text style={{ color: lineSpacing.id === ls.id ? '#4285f4' : themeColors.text.primary }}>{ls.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Editor */}
            {/* Editor */}
            <ScrollView
                style={[styles.editorArea, { backgroundColor: isDark ? '#0d1117' : '#F0F2F5' }]}
                onTouchStart={() => { setShowFontPicker(false); setShowSizePicker(false); setShowColorPicker(false); setShowHighlightPicker(false); setShowLineSpacingPicker(false); }}
            >
                <View style={[
                    styles.paper,
                    highlightColor !== 'transparent' && { backgroundColor: highlightColor + '20' },
                    {
                        backgroundColor: '#FFFFFF', // Always white paper
                        borderWidth: 1,
                        borderColor: '#bfdbfe', // Static subtle blue border
                        shadowColor: 'transparent', // Remove shadow to focus on border or keep it subtle? Keeping subtle shadow from styles.paper but border takes precedence for visibility
                    }
                ]}>
                    <TextInput
                        multiline
                        textAlignVertical="top"
                        style={[
                            styles.editor,
                            {
                                fontSize,
                                color: textColor,
                                textAlign,
                                lineHeight: fontSize * lineSpacing.value,
                                ...Platform.select({ web: { outlineStyle: 'none' } })
                            },
                            bold && { fontWeight: 'bold' },
                            italic && { fontStyle: 'italic' },
                            underline && strikethrough
                                ? { textDecorationLine: 'underline line-through' }
                                : underline
                                    ? { textDecorationLine: 'underline' }
                                    : strikethrough
                                        ? { textDecorationLine: 'line-through' }
                                        : {},
                            highlightColor !== 'transparent' && { backgroundColor: highlightColor + '40' },
                        ]}
                        value={content}
                        onChangeText={setContent}
                        placeholder="Digite seu texto aqui..."
                        placeholderTextColor="#9aa0a6"
                    />
                </View>
            </ScrollView>

            {/* Status */}
            <View style={[styles.statusBar, { backgroundColor: themeColors.surface }]}>
                <Text style={{ fontSize: 11, color: themeColors.text.muted }}>
                    {content.split(/\s+/).filter(w => w).length} palavras • Salvo automático
                </Text>
                {lastSaved && (
                    <Text style={{ fontSize: 11, color: themeColors.text.muted }}>
                        Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                )}
            </View>

            {/* Export Modal */}
            <Modal visible={showExportModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { backgroundColor: themeColors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>Exportar</Text>
                            <TouchableOpacity onPress={() => setShowExportModal(false)}>
                                <Ionicons name="close" size={24} color={themeColors.text.muted} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.exportRow} onPress={() => exportDocument('pdf')}>
                            <Ionicons name="document-text" size={24} color="#ea4335" />
                            <Text style={[styles.exportRowText, { color: themeColors.text.primary }]}>PDF</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.exportRow} onPress={() => exportDocument('doc')}>
                            <Ionicons name="document" size={24} color="#4285f4" />
                            <Text style={[styles.exportRowText, { color: themeColors.text.primary }]}>Word (.doc)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.exportRow} onPress={() => exportDocument('txt')}>
                            <Ionicons name="document-outline" size={24} color="#34a853" />
                            <Text style={[styles.exportRowText, { color: themeColors.text.primary }]}>Texto (.txt)</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ============ ESTILOS GOOGLE DOCS ============
const styles = StyleSheet.create({
    container: { flex: 1 },

    // Browser
    browserHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    browserTitle: { flex: 1, fontSize: 18, fontWeight: '600', marginLeft: 12 },
    newDocBtn: { backgroundColor: '#4285f4', padding: 8, borderRadius: 20 },

    foldersRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    foldersScroll: { paddingHorizontal: 12, gap: 8 },
    folderChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff3cd', gap: 6 },
    folderChipActive: { backgroundColor: '#4285f4' },
    folderChipText: { fontSize: 13, color: '#333', maxWidth: 100 },
    addFolderBtn: { padding: 8, borderRadius: 16, borderWidth: 1, borderColor: '#4285f4', borderStyle: 'dashed' },

    modalBtnOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
    },
    modalOptionTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalOptionDesc: {
        fontSize: 12,
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { marginTop: 16, fontSize: 16 },
    emptyBtn: { marginTop: 20, backgroundColor: '#4285f4', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
    emptyBtnText: { color: '#fff', fontWeight: '600' },

    docsList: { padding: 12 },
    docCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 8, marginBottom: 8, ...shadows.sm },
    docIcon: { marginRight: 12 },
    docInfo: { flex: 1 },
    docTitle: { fontSize: 16, fontWeight: '500' },
    docMeta: { fontSize: 12, marginTop: 4 },

    // Editor Header
    header: { flexDirection: 'row', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    headerBtn: { padding: 8 },
    titleInput: { flex: 1, fontSize: 16, fontWeight: '500', marginHorizontal: 8 },
    saveIndicator: { padding: 8 },
    exportBtn: { padding: 8 },
    deleteBtn: { padding: 8, marginLeft: 4 },

    // Toolbar Google Docs Style
    toolbar: { borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingVertical: 4 },
    toolbarScroll: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 2 },
    toolBtn: { width: 32, height: 32, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    toolBtnLabel: { fontSize: 14, fontWeight: '700' },
    strikethroughLabel: { fontSize: 14, fontWeight: '700', textDecorationLine: 'line-through' },
    toolDivider: { width: 1, height: 24, backgroundColor: '#e0e0e0', marginHorizontal: 6 },

    // Pickers
    fontPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#dadce0',
        borderRadius: 4,
        minWidth: 120,
        marginRight: 4,
        gap: 4,
    },
    sizePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#dadce0',
        borderRadius: 4,
        marginRight: 4,
        gap: 4,
    },

    // Color Buttons
    colorBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    colorBtnA: { fontSize: 16, fontWeight: '700' },
    colorBar: { height: 3, width: 16, marginTop: -2, borderRadius: 2 },
    highlightBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    lineSpacingBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },

    // Dropdowns
    pickerDropdown: {
        position: 'absolute',
        top: 100,
        left: 8,
        zIndex: 1000,
        borderRadius: 8,
        padding: 8,
        minWidth: 150,
        ...shadows.lg,
    },
    pickerItem: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 4 },
    pickerItemActive: { backgroundColor: '#e8f0fe' },
    pickerLabel: { fontSize: 12, fontWeight: '500', paddingHorizontal: 8, paddingBottom: 8 },

    // Color Picker Grid
    colorPickerDropdown: {
        position: 'absolute',
        top: 100,
        left: 180,
        zIndex: 1000,
        borderRadius: 8,
        padding: 12,
        width: 230,
        ...shadows.lg,
    },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
    colorSwatch: {
        width: 20,
        height: 20,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#dadce0',
    },
    colorSwatchActive: {
        borderWidth: 2,
        borderColor: '#4285f4',
    },
    transparentSwatch: {
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Editor Area
    editorArea: { flex: 1, backgroundColor: '#f8f9fa' },
    paper: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginVertical: 20,
        borderRadius: 0,
        padding: 60,
        paddingTop: 40,
        minHeight: 800,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    editor: { minHeight: 700 },

    statusBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBox: { width: '100%', maxWidth: 360, borderRadius: 12, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '600' },
    modalInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    modalBtnCancel: { paddingHorizontal: 16, paddingVertical: 10 },
    modalBtnCancelText: { color: '#666' },
    modalBtnConfirm: { backgroundColor: '#4285f4', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
    modalBtnConfirmText: { color: '#fff', fontWeight: '600' },

    exportRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16, borderRadius: 8, marginBottom: 8, backgroundColor: 'rgba(0,0,0,0.03)' },
    exportRowText: { fontSize: 16, fontWeight: '500' },
});
