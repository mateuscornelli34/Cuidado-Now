# Integração com Firebase - Cuidado-Now

## 📖 Visão Geral

O Cuidado-Now integra com **Google Firebase** para oferecer funcionalidades de nuvem opcionais, incluindo autenticação, armazenamento em nuvem (Firestore) e hospedagem web. A integração é **totalmente opcional** - o app funciona 100% localmente sem Firebase configurado.

## 🎯 Objetivo

Permitir que usuários (opcionalmente) sincronizem seus dados na nuvem para:
- 📱 **Backup automático** de conversas e perfil
- 🔄 **Sincronização multi-dispositivo** (mesma conta em vários devices)
- 🔐 **Autenticação segura** via Firebase Auth
- 🌐 **Versão Web** hospedada no Firebase Hosting

## 🏗️ Arquitetura

### Modelo: Local-First com Sync Opcional

```
┌──────────────────────────────────────────────┐
│           LOCAL STORAGE (Primário)           │
│                                              │
│  AsyncStorage                                │
│  ├─ Perfil do usuário                       │
│  ├─ Histórico de chat (500 msgs)            │
│  ├─ Contatos de emergência                  │
│  ├─ Histórico de humor (90 dias)            │
│  └─ Configurações                            │
│                                              │
└──────────────┬───────────────────────────────┘
               │
               │ (Sync opcional se Firebase configurado)
               ▼
┌──────────────────────────────────────────────┐
│        FIREBASE CLOUD (Secundário)           │
│                                              │
│  Firestore                                   │
│  └─ users/{userId}/                          │
│      ├─ profile (doc)                        │
│      └─ chats (collection)                   │
│          └─ {msgId} (doc)                    │
│                                              │
│  Firebase Auth                               │
│  └─ Email/Password authentication            │
│                                              │
│  Firebase Hosting                            │
│  └─ Web version (dist/)                      │
└──────────────────────────────────────────────┘
```

### Princípios

1. **Local-First**: App funciona mesmo sem Firebase
2. **Opt-in**: Usuário decide se quer configurar Firebase
3. **Graceful Degradation**: Falhas no Firebase não quebram o app
4. **Privacy-Aware**: Sync respeita configurações de privacidade

## 📦 Dependências

```json
{
  "firebase": "^12.8.0"
}
```

**Módulos usados:**
- `firebase/app` - Inicialização
- `firebase/firestore` - Banco de dados NoSQL
- `firebase/auth` - Autenticação

## 🔧 Estrutura do Código

### FirebaseService.js

```
src/services/FirebaseService.js  # 190 linhas
│
├─ Properties
│  ├─ app          # Firebase App instance
│  ├─ db           # Firestore database
│  ├─ auth         # Firebase Auth
│  ├─ config       # Configuração atual
│  ├─ isInitialized # Status de inicialização
│  └─ userId       # ID do usuário atual
│
├─ Configuration
│  ├─ initialize(config)     # Inicializa Firebase
│  ├─ loadConfig()          # Carrega do AsyncStorage
│  ├─ resetConfig()         # Remove configuração
│  └─ testConnection()      # Testa conectividade
│
├─ Authentication
│  ├─ login(email, password)
│  ├─ register(email, password)
│  └─ logout()
│
├─ Data Sync
│  ├─ saveUserProfile(profile)
│  └─ syncChatMessage(message)
│
└─ Utilities
   ├─ setUserId(id)
   └─ getHostingUrl()
```

## 🔐 Configuração do Firebase

### Formato da Configuração

```javascript
{
  apiKey: "AIzaSy...",              // Chave da API
  authDomain: "projeto.firebaseapp.com",
  projectId: "projeto-id",
  storageBucket: "projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
}
```

### Onde Obter

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie ou selecione projeto
3. Vá em **Project Settings** (⚙️)
4. Seção **Your apps** → **Web app**
5. Copie o objeto `firebaseConfig`

### Como Configurar no App

#### Opção 1: Via Settings Screen (Recomendado)

```
1. Abra o app
2. Vá em Settings (⚙️)
3. Role até "Configuração Firebase"
4. Cole o JSON da configuração
5. App valida e salva automaticamente
```

#### Opção 2: Via Código (Desenvolvimento)

```javascript
import firebaseService from './src/services/FirebaseService';

const config = {
  apiKey: "AIzaSy...",
  // ... demais campos
};

await firebaseService.initialize(config);
```

### Persistência

- Configuração é salva em `AsyncStorage`
- Chave: `@mindcare_firebase_config`
- Restaurada automaticamente ao abrir app
- UserData.init() chama `firebaseService.loadConfig()`

## 🔄 Fluxo de Inicialização

```
┌─────────────────────────────────────────────────────┐
│              APP STARTUP                            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  UserDataService.init()                             │
│  ├─ Gera/carrega User ID                           │
│  └─ firebaseService.setUserId(uid)                 │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  firebaseService.loadConfig()                       │
│  ├─ Lê AsyncStorage('@mindcare_firebase_config')   │
│  ├─ Se existe config → initialize(config)          │
│  └─ Se não existe → App continua sem Firebase      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ├─ COM CONFIG ──────────────────┐
                  │                               │
                  ▼                               ▼
┌───────────────────────────┐   ┌──────────────────────────┐
│  Firebase Inicializado    │   │  Sem Firebase            │
│  ✅ Auth disponível       │   │  ✅ App funciona local   │
│  ✅ Firestore disponível  │   │  ⚠️ Sync desabilitado    │
│  ✅ Sync ativo            │   │  ⚠️ Auth desabilitado    │
└───────────────────────────┘   └──────────────────────────┘
```

## 💾 Estrutura de Dados no Firestore

### Collections e Documents

```
firestore/
│
├─ users/                              # Collection
│  └─ {userId}/                        # Document (auto-gerado)
│     │
│     ├─ (fields do perfil)
│     │  ├─ name: string
│     │  ├─ firstName: string
│     │  ├─ lastName: string
│     │  ├─ phone: string
│     │  ├─ dateOfBirth: string
│     │  ├─ streak: number
│     │  ├─ insights: array
│     │  ├─ emergencyPermissionGranted: boolean
│     │  ├─ createdAt: timestamp
│     │  └─ updatedAt: timestamp
│     │
│     └─ chats/                        # Sub-collection
│        ├─ msg_1234567890/            # Document
│        │  ├─ id: string
│        │  ├─ text: string
│        │  ├─ isUser: boolean
│        │  └─ timestamp: string
│        │
│        ├─ msg_1234567891/
│        └─ msg_1234567892/
│
└─ _connection_tests/                  # Collection (testes)
   └─ test_{timestamp}/                # Document
      └─ timestamp: string
```

### Exemplo de Documento de Perfil

```javascript
{
  name: "João Silva",
  firstName: "João",
  lastName: "Silva",
  phone: "+5511999999999",
  dateOfBirth: "1990-01-01",
  streak: 7,
  insights: [
    {
      text: "Usuário prefere conversar à noite",
      timestamp: "2026-01-27T22:00:00Z"
    }
  ],
  emergencyPermissionGranted: true,
  createdAt: "2026-01-20T10:00:00Z",
  updatedAt: "2026-01-27T22:30:00Z"
}
```

### Exemplo de Documento de Chat

```javascript
{
  id: "msg_1706390000000",
  text: "Como você está se sentindo hoje?",
  isUser: false,
  timestamp: "2026-01-27T22:30:00.000Z"
}
```

## 🔐 Autenticação (Firebase Auth)

### Métodos Disponíveis

#### 1. Login
```javascript
const result = await firebaseService.login(email, password);

if (result.success) {
  console.log('Usuário logado:', result.user);
} else {
  console.error('Erro:', result.error);
}
```

#### 2. Registro
```javascript
const result = await firebaseService.register(email, password);

if (result.success) {
  console.log('Conta criada:', result.user);
} else {
  console.error('Erro:', result.error);
}
```

#### 3. Logout
```javascript
const success = await firebaseService.logout();
```

### Fluxo de Autenticação

```
USUÁRIO ABRE LOGIN SCREEN
│
├─► Digite email/senha
│   └─► firebaseService.login(email, password)
│       │
│       ├─► SUCESSO
│       │   ├─► Retorna user object
│       │   ├─► Redireciona para app
│       │   └─► Sync automático inicia
│       │
│       └─► ERRO
│           ├─► Mostra mensagem de erro
│           └─► Usuário tenta novamente
│
└─► Ou registre nova conta
    └─► firebaseService.register(email, password)
        └─► Cria conta no Firebase Auth
```

### Estado Atual (Importante!)

**Atualmente NÃO implementado completamente:**
- ⚠️ Login/Register screens existem mas não são usados
- ⚠️ App usa User ID auto-gerado localmente
- ⚠️ Não há fluxo de login obrigatório
- ✅ Estrutura está preparada para implementar

**Para implementar futuramente:**
1. Adicionar tela de login no onboarding
2. Vincular User ID com Firebase UID
3. Implementar `onAuthStateChanged` listener
4. Sincronizar após login bem-sucedido

## 📤 Sincronização de Dados

### Quando Ocorre Sync

**Perfil do Usuário:**
- ❌ Não sincronizado automaticamente no momento
- ✅ Estrutura existe: `saveUserProfile(profile)`
- 💡 Pode ser chamado manualmente se necessário

**Mensagens de Chat:**
- ❌ Não sincronizado automaticamente no momento
- ✅ Estrutura existe: `syncChatMessage(message)`
- 💡 Comentado no código, pode ser ativado

### Como Ativar Sync (Para Desenvolvedores)

No `UserData.js`:

```javascript
// Atualmente
async saveProfile(profile) {
  const updatedProfile = {
    ...currentProfile,
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  return await this.saveData(STORAGE_KEYS.USER_PROFILE, updatedProfile);
  // TODO: Descomentar para ativar sync
  // await firebaseService.saveUserProfile(updatedProfile);
}
```

```javascript
// Atualmente
async addChatMessage(message, isUser = true) {
  // ...salva localmente...

  // TODO: Descomentar para ativar sync
  // await firebaseService.syncChatMessage(entry);
}
```

### Pattern de Sync Implementado

```javascript
// Local-first pattern
async saveData(data) {
  // 1. Salva localmente PRIMEIRO
  await AsyncStorage.setItem(key, data);

  // 2. Tenta sync com Firebase (se disponível)
  if (firebaseService.isInitialized) {
    try {
      await firebaseService.syncData(data);
    } catch (error) {
      // Falha silenciosa - dados já estão salvos localmente
      console.warn('Firebase sync failed, data saved locally');
    }
  }
}
```

## 🌐 Firebase Hosting

### Configuração

Arquivo: `firebase.json`

```json
{
  "hosting": {
    "public": "dist",           // Pasta de build
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"  // SPA routing
      }
    ]
  }
}
```

### Projeto Firebase

Arquivo: `.firebaserc`

```json
{
  "projects": {
    "default": "cuidadonow"   // Nome do projeto
  }
}
```

### Deploy para Web

```bash
# 1. Build da versão web
npm run web -- --no-dev

# 2. Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# 3. Login no Firebase
firebase login

# 4. Deploy
firebase deploy --only hosting
```

### URL de Acesso

Após deploy, app estará disponível em:
- `https://cuidadonow.web.app`
- Ou `https://cuidadonow.firebaseapp.com`

**Helper no código:**
```javascript
const url = firebaseService.getHostingUrl();
// Retorna: "https://{projectId}.web.app"
```

## 🧪 Teste de Conexão

### Testar Conectividade

```javascript
const result = await firebaseService.testConnection();

if (result.success) {
  console.log('✅ Firebase conectado e funcionando!');
} else {
  console.error('❌ Erro:', result.error);
}
```

**O que faz:**
1. Verifica se Firebase está inicializado
2. Tenta escrever documento em `_connection_tests`
3. Retorna sucesso ou erro

**Onde usar:**
- Settings screen para validar configuração
- Debug durante desenvolvimento
- Health check da conexão

## 🔧 API Completa

### Configuração

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| `initialize(config)` | `Object` | `Promise<Boolean>` | Inicializa Firebase |
| `loadConfig()` | - | `Promise<Boolean>` | Carrega config do storage |
| `resetConfig()` | - | `Promise<Boolean>` | Remove configuração |
| `testConnection()` | - | `Promise<{success, error}>` | Testa conexão |

### Autenticação

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| `login(email, password)` | `String, String` | `Promise<{success, user?, error?}>` | Login |
| `register(email, password)` | `String, String` | `Promise<{success, user?, error?}>` | Registro |
| `logout()` | - | `Promise<Boolean>` | Logout |

### Sincronização

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| `saveUserProfile(profile)` | `Object` | `Promise<void>` | Salva perfil |
| `syncChatMessage(message)` | `Object` | `Promise<void>` | Salva mensagem |

### Utilities

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| `setUserId(id)` | `String` | `void` | Define user ID |
| `getHostingUrl()` | - | `String` | URL do hosting |

### Propriedades

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `app` | `FirebaseApp` | Instância do Firebase |
| `db` | `Firestore` | Database Firestore |
| `auth` | `Auth` | Firebase Auth |
| `config` | `Object` | Config atual |
| `isInitialized` | `Boolean` | Status inicialização |
| `userId` | `String` | ID do usuário |

## 🎯 Casos de Uso

### Caso 1: App Sem Firebase (Padrão Atual)

```
Usuário instala app
  ↓
UserData.init()
  ├─ Gera User ID local
  ├─ firebaseService.loadConfig() → Nenhuma config
  └─ App funciona 100% local

Dados salvos apenas em:
  ✅ AsyncStorage (device)
  ❌ Firebase Cloud
```

### Caso 2: Configurar Firebase Posteriormente

```
Usuário usando app localmente
  ↓
Vai em Settings → Configuração Firebase
  ├─ Cola JSON da config
  └─ firebaseService.initialize(config)
      ├─ Salva config em AsyncStorage
      └─ Firebase agora disponível

Próxima vez:
  └─ loadConfig() restaura automaticamente
```

### Caso 3: Multi-Device (Futuro)

```
Device 1                    Firebase Cloud
  ├─ Login com conta     →  Autentica
  ├─ Sync dados          →  Salva no Firestore
  └─ Dados na nuvem

Device 2
  ├─ Login mesma conta   ←  Autentica
  └─ Baixa dados         ←  Lê do Firestore

Ambos sincronizados!
```

## ⚠️ Considerações Importantes

### Privacidade

**Respeita configurações do usuário:**
```javascript
const settings = await userData.getSettings();

if (!settings.privacy.saveHistory) {
  // NÃO sincroniza histórico de chat
  return;
}
```

**Dados sensíveis:**
- ⚠️ Contatos de emergência NÃO são sincronizados
- ⚠️ API keys NÃO são sincronizadas
- ✅ Apenas perfil e chat (se permitido)

### Performance

**Falhas silenciosas:**
- Erros no Firebase não quebram o app
- Dados sempre salvos localmente primeiro
- Sync é best-effort, não blocking

**Timeout:**
- Não há timeout configurado
- Firestore tem timeout padrão (~60s)
- Recomendado adicionar timeout custom

### Segurança

**Rules do Firestore (Importante!):**

Você DEVE configurar Security Rules no Firebase Console:

```javascript
// firestore.rules (EXEMPLO - AJUSTAR CONFORME NECESSIDADE)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuário só acessa seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;

      // Sub-collection de chats
      match /chats/{chatId} {
        allow read, write: if request.auth != null
                           && request.auth.uid == userId;
      }
    }

    // Connection tests públicos (opcional, apenas para debug)
    match /_connection_tests/{testId} {
      allow write: if true;
      allow read: if false;
    }
  }
}
```

**Importante:**
- ⚠️ Rules acima são exemplo básico
- 🔐 Configure auth antes de produção
- 🚫 Nunca deixe rules abertas (`allow read, write: if true`)

## 🐛 Troubleshooting

### Problema: "Firebase not initialized"

**Causa:** Config não foi carregada ou é inválida

**Solução:**
```javascript
// 1. Verificar se config existe
const hasConfig = await AsyncStorage.getItem('@mindcare_firebase_config');

// 2. Tentar reinicializar
await firebaseService.loadConfig();

// 3. Se não funcionar, reconfigurar
await firebaseService.initialize(validConfig);
```

### Problema: "Permission denied" no Firestore

**Causa:** Firestore Security Rules bloqueando acesso

**Solução:**
1. Vá no Firebase Console
2. Firestore Database → Rules
3. Ajuste rules conforme necessário
4. Publish changes

### Problema: Sync não está funcionando

**Causa:** Código de sync comentado

**Solução:**
1. Abra `UserData.js`
2. Descomente linhas de `firebaseService.saveUserProfile()`
3. Descomente linhas de `firebaseService.syncChatMessage()`

### Problema: "Invalid API key"

**Causa:** Config copiada incorretamente

**Solução:**
1. Verifique se todos os campos estão presentes
2. Certifique-se que é JSON válido
3. Não tem espaços extras ou quebras de linha
4. Copie novamente do Firebase Console

## 🔮 Roadmap / Melhorias Futuras

### Curto Prazo
1. ✅ Estrutura básica (FEITO)
2. 📝 Ativar sync automático de perfil
3. 📝 Ativar sync automático de mensagens
4. 📝 Implementar fluxo de login completo
5. 📝 Adicionar loading states durante sync

### Médio Prazo
1. 🔄 Sync bidirecional (pull + push)
2. 🔔 Notificações push via FCM
3. 📊 Analytics com Firebase Analytics
4. 🎯 Remote Config para feature flags
5. ⚡ Performance monitoring

### Longo Prazo
1. 🤝 Compartilhamento de dados com terapeuta
2. 📱 Sync em tempo real (onSnapshot)
3. 💾 Storage para arquivos (áudio, imagens)
4. 🔐 MFA (autenticação multi-fator)
5. 🌍 Multi-idioma com Remote Config

## 📚 Recursos e Links

### Documentação Oficial
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

### Tutoriais
- [Get started with Firebase](https://firebase.google.com/docs/web/setup)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

### SDK
- [Firebase JS SDK](https://github.com/firebase/firebase-js-sdk)
- [Modular API](https://firebase.google.com/docs/web/modular-upgrade)

---

**Autor**: Equipe Cuidado-Now
**Última atualização**: 2026-01-27
**Versão**: 1.0
**Código fonte**: `src/services/FirebaseService.js`
