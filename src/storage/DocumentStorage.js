/**
 * Document Storage Service
 * Gerencia pastas e documentos usando AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@CuidadoNow:Documents';

// Estrutura de dados:
// {
//   folders: [{ id, name, createdAt, documents: [docIds] }],
//   documents: { docId: { id, title, content, folderId, createdAt, updatedAt, formatting } }
// }

class DocumentStorage {
    constructor() {
        this.data = null;
        this.initialized = false;
    }

    // Inicializa o storage
    async init() {
        if (this.initialized) return this.data;

        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.data = JSON.parse(stored);
            } else {
                // Estrutura inicial
                this.data = {
                    folders: [
                        { id: 'root', name: 'Meus Documentos', createdAt: Date.now(), documents: [] }
                    ],
                    documents: {}
                };
                await this.save();
            }
            this.initialized = true;
            return this.data;
        } catch (error) {
            console.error('Erro ao inicializar DocumentStorage:', error);
            this.data = { folders: [{ id: 'root', name: 'Meus Documentos', createdAt: Date.now(), documents: [] }], documents: {} };
            return this.data;
        }
    }

    // Salva no AsyncStorage
    async save() {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar documentos:', error);
            return false;
        }
    }

    // ============ PASTAS ============

    // Lista todas as pastas
    async getFolders() {
        await this.init();
        return [...this.data.folders];
    }

    // Cria nova pasta
    async createFolder(name) {
        await this.init();
        const folder = {
            id: `folder_${Date.now()}`,
            name: name.trim(),
            createdAt: Date.now(),
            documents: []
        };
        this.data.folders.push(folder);
        await this.save();
        return folder;
    }

    // Renomeia pasta
    async renameFolder(folderId, newName) {
        await this.init();
        const folder = this.data.folders.find(f => f.id === folderId);
        if (folder && folder.id !== 'root') {
            folder.name = newName.trim();
            await this.save();
            return true;
        }
        return false;
    }

    // Deleta pasta (opcionalmente apaga conteúdos)
    async deleteFolder(folderId, deleteContents = false) {
        await this.init();
        if (folderId === 'root') return false;

        const folderIndex = this.data.folders.findIndex(f => f.id === folderId);
        if (folderIndex === -1) return false;

        const folder = this.data.folders[folderIndex];
        const rootFolder = this.data.folders.find(f => f.id === 'root');

        if (deleteContents) {
            // Apaga todos os documentos da pasta permanentemente
            for (const docId of folder.documents) {
                delete this.data.documents[docId];
            }
        } else {
            // Move documentos para root (comportamento padrão)
            folder.documents.forEach(docId => {
                if (this.data.documents[docId]) {
                    this.data.documents[docId].folderId = 'root';
                    rootFolder.documents.push(docId);
                }
            });
        }

        this.data.folders.splice(folderIndex, 1);
        await this.save();
        return true;
    }

    // ============ DOCUMENTOS ============

    // Lista documentos de uma pasta
    async getDocuments(folderId = 'root') {
        await this.init();
        const folder = this.data.folders.find(f => f.id === folderId);
        if (!folder) return [];

        return folder.documents
            .map(docId => this.data.documents[docId])
            .filter(doc => doc)
            .sort((a, b) => b.updatedAt - a.updatedAt);
    }

    // Lista todos os documentos
    async getAllDocuments() {
        await this.init();
        return Object.values(this.data.documents).sort((a, b) => b.updatedAt - a.updatedAt);
    }

    // Obtém um documento
    async getDocument(docId) {
        await this.init();
        return this.data.documents[docId] || null;
    }

    // Cria novo documento
    async createDocument(title, content = '', folderId = 'root', formatting = {}) {
        await this.init();

        const doc = {
            id: `doc_${Date.now()}`,
            title: title.trim() || 'Documento sem título',
            content,
            folderId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            formatting: {
                fontFamily: formatting.fontFamily || 'Arial',
                fontSize: formatting.fontSize || 11,
                textColor: formatting.textColor || '#000000',
                ...formatting
            }
        };

        this.data.documents[doc.id] = doc;

        const folder = this.data.folders.find(f => f.id === folderId);
        if (folder) {
            folder.documents.push(doc.id);
        }

        await this.save();
        return doc;
    }

    // Salva/atualiza documento
    async saveDocument(docId, updates) {
        await this.init();

        if (!this.data.documents[docId]) {
            return null;
        }

        this.data.documents[docId] = {
            ...this.data.documents[docId],
            ...updates,
            updatedAt: Date.now()
        };

        await this.save();
        return this.data.documents[docId];
    }

    // Move documento para outra pasta
    async moveDocument(docId, targetFolderId) {
        await this.init();

        const doc = this.data.documents[docId];
        if (!doc) return false;

        // Remove da pasta atual
        const currentFolder = this.data.folders.find(f => f.id === doc.folderId);
        if (currentFolder) {
            currentFolder.documents = currentFolder.documents.filter(id => id !== docId);
        }

        // Adiciona na nova pasta
        const targetFolder = this.data.folders.find(f => f.id === targetFolderId);
        if (targetFolder) {
            targetFolder.documents.push(docId);
            doc.folderId = targetFolderId;
            await this.save();
            return true;
        }

        return false;
    }

    // Deleta documento
    async deleteDocument(docId) {
        await this.init();

        const doc = this.data.documents[docId];
        if (!doc) return false;

        // Remove da pasta
        const folder = this.data.folders.find(f => f.id === doc.folderId);
        if (folder) {
            folder.documents = folder.documents.filter(id => id !== docId);
        }

        delete this.data.documents[docId];
        await this.save();
        return true;
    }

    // Pesquisa documentos
    async searchDocuments(query) {
        await this.init();
        const lowerQuery = query.toLowerCase();

        return Object.values(this.data.documents)
            .filter(doc =>
                doc.title.toLowerCase().includes(lowerQuery) ||
                doc.content.toLowerCase().includes(lowerQuery)
            )
            .sort((a, b) => b.updatedAt - a.updatedAt);
    }
}

export default new DocumentStorage();
