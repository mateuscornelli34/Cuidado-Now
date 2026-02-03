# Firebase Integration - Referência Rápida

## 🚀 Início Rápido

### Importar e Usar
```javascript
import firebaseService from '../services/FirebaseService';

// Inicializar com config
const config = {
  apiKey: "AIzaSy...",
  authDomain: "projeto.firebaseapp.com",
  projectId: "projeto-id",
  storageBucket: "projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
};
await firebaseService.initialize(config);

// Login
const result = await firebaseService.login(email, password);

// Sync dados
await firebaseService.saveUserProfile(profile);
await firebaseService.syncChatMessage(message);
```

## 📋 API Completa

### Configuração

| Método | Uso | Retorno |
|--------|-----|---------|
| `initialize(config)` | Inicializa Firebase | `Promise<Boolean>` |
| `loadConfig()` | Carrega do AsyncStorage | `Promise<Boolean>` |
| `resetConfig()` | Remove configuração | `Promise<Boolean>` |
| `testConnection()` | Testa conexão | `Promise<{success, error}>` |

**Exemplo:**
```javascript
// Inicializar
const success = await firebaseService.initialize(config);
if (success) {
  console.log('Firebase pronto!');
}

// Testar
const test = await firebaseService.testConnection();
if (test.success) {
  console.log('Conexão OK!');
} else {
  console.error('Erro:', test.error);
}

// Resetar
await firebaseService.resetConfig();
```

### Autenticação

| Método | Parâmetros | Retorno |
|--------|------------|---------|
| `login(email, password)` | `String, String` | `{success, user?, error?}` |
| `register(email, password)` | `String, String` | `{success, user?, error?}` |
| `logout()` | - | `Promise<Boolean>` |

**Exemplo:**
```javascript
// Login
const result = await firebaseService.login('user@email.com', 'senha123');
if (result.success) {
  console.log('Logado:', result.user.uid);
} else {
  console.error('Erro:', result.error);
}

// Registro
const reg = await firebaseService.register('novo@email.com', 'senha123');

// Logout
await firebaseService.logout();
```

### Sincronização de Dados

| Método | Parâmetro | Descrição |
|--------|-----------|-----------|
| `saveUserProfile(profile)` | `Object` | Salva perfil no Firestore |
| `syncChatMessage(message)` | `Object` | Salva mensagem no Firestore |

**Exemplo:**
```javascript
// Sync perfil
await firebaseService.saveUserProfile({
  name: "João Silva",
  phone: "+5511999999999",
  streak: 7
});

// Sync mensagem
await firebaseService.syncChatMessage({
  id: "msg_123",
  text: "Olá!",
  isUser: true,
  timestamp: new Date().toISOString()
});
```

### Utilities

| Método/Propriedade | Tipo | Descrição |
|-------------------|------|-----------|
| `setUserId(id)` | `Function` | Define user ID |
| `getHostingUrl()` | `Function` | Retorna URL hosting |
| `isInitialized` | `Boolean` | Status inicialização |
| `userId` | `String` | ID do usuário atual |

**Exemplo:**
```javascript
// Definir user ID
firebaseService.setUserId('user_123');

// Obter URL
const url = firebaseService.getHostingUrl();
// "https://cuidadonow.web.app"

// Verificar status
if (firebaseService.isInitialized) {
  console.log('Firebase ativo');
}
```

## 🏗️ Estrutura Firestore

### Collections e Paths

```
/users/{userId}                    # Documento do usuário
  - name: string
  - firstName: string
  - lastName: string
  - phone: string
  - streak: number
  - insights: array
  - createdAt: timestamp
  - updatedAt: timestamp

/users/{userId}/chats/{msgId}     # Mensagens
  - id: string
  - text: string
  - isUser: boolean
  - timestamp: string

/_connection_tests/{testId}        # Testes de conexão
  - timestamp: string
```

### Queries Úteis

```javascript
import { getFirestore, collection, query, where, orderBy, limit } from 'firebase/firestore';

const db = getFirestore(firebaseService.app);

// Buscar perfil
const userRef = doc(db, 'users', userId);
const userSnap = await getDoc(userRef);
const profile = userSnap.data();

// Listar mensagens
const chatsRef = collection(db, 'users', userId, 'chats');
const q = query(chatsRef, orderBy('timestamp', 'desc'), limit(50));
const snapshot = await getDocs(q);
snapshot.forEach(doc => {
  console.log(doc.id, doc.data());
});
```

## 🔐 Security Rules (Firestore)

### Rules Básicas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuário acessa apenas seus dados
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;

      match /chats/{chatId} {
        allow read, write: if request.auth != null
                           && request.auth.uid == userId;
      }
    }

    // Testes de conexão
    match /_connection_tests/{testId} {
      allow write: if true;
      allow read: if false;
    }
  }
}
```

### Como Aplicar

1. Firebase Console → Firestore Database
2. Aba "Rules"
3. Cole as rules acima
4. Publish

## 💡 Padrões Comuns

### Pattern 1: Local-First Save

```javascript
async function saveProfile(newData) {
  // 1. SEMPRE salva localmente primeiro
  await AsyncStorage.setItem('profile', JSON.stringify(newData));

  // 2. Tenta sync (best-effort)
  try {
    if (firebaseService.isInitialized) {
      await firebaseService.saveUserProfile(newData);
    }
  } catch (error) {
    // Falha silenciosa - dados já salvos localmente
    console.warn('Firebase sync failed:', error);
  }
}
```

### Pattern 2: Verificar Antes de Usar

```javascript
async function syncData(data) {
  // Sempre verificar se Firebase está pronto
  if (!firebaseService.isInitialized) {
    console.log('Firebase não configurado, usando apenas local');
    return;
  }

  if (!firebaseService.userId) {
    console.warn('User ID não definido');
    return;
  }

  // Agora sim, pode usar
  await firebaseService.saveUserProfile(data);
}
```

### Pattern 3: Configuração no Settings

```javascript
const SettingsFirebaseConfig = () => {
  const [configText, setConfigText] = useState('');

  const handleSave = async () => {
    try {
      const config = JSON.parse(configText);
      const success = await firebaseService.initialize(config);

      if (success) {
        Alert.alert('Sucesso', 'Firebase configurado!');
      } else {
        Alert.alert('Erro', 'Configuração inválida');
      }
    } catch (e) {
      Alert.alert('Erro', 'JSON inválido');
    }
  };

  return (
    <TextInput
      multiline
      placeholder='{"apiKey": "...", ...}'
      value={configText}
      onChangeText={setConfigText}
    />
    <Button title="Salvar Config" onPress={handleSave} />
  );
};
```

### Pattern 4: Login Flow

```javascript
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const result = await firebaseService.login(email, password);

    if (result.success) {
      // Sucesso - redireciona
      navigation.navigate('Home');
    } else {
      // Erro - mostra mensagem
      Alert.alert('Erro', result.error);
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
};
```

## ⚠️ Avisos Importantes

### ❌ NÃO FAZER

```javascript
// NÃO depender só do Firebase
async function saveData(data) {
  await firebaseService.saveUserProfile(data);
  // ❌ E se Firebase falhar? Dados perdidos!
}

// NÃO assumir que está inicializado
firebaseService.saveUserProfile(data);
// ❌ Pode lançar erro se não inicializado

// NÃO bloquear UI esperando sync
await firebaseService.syncChatMessage(msg);
// ❌ Latência de rede pode travar app
```

### ✅ FAZER

```javascript
// SEMPRE salve local primeiro
async function saveData(data) {
  await AsyncStorage.setItem('data', JSON.stringify(data));

  // Sync em background
  if (firebaseService.isInitialized) {
    firebaseService.saveUserProfile(data).catch(console.warn);
  }
}

// SEMPRE verifique antes de usar
if (firebaseService.isInitialized && firebaseService.userId) {
  await firebaseService.saveUserProfile(data);
}

// Use try-catch para erros
try {
  await firebaseService.login(email, password);
} catch (error) {
  console.error('Login failed:', error);
}
```

## 🔍 Debugging

### Verificar Estado Atual

```javascript
console.log('Inicializado?', firebaseService.isInitialized);
console.log('User ID:', firebaseService.userId);
console.log('Config:', firebaseService.config);
console.log('App:', firebaseService.app);
console.log('DB:', firebaseService.db);
console.log('Auth:', firebaseService.auth);
```

### Testar Conexão

```javascript
const test = async () => {
  console.log('Testando Firebase...');

  const result = await firebaseService.testConnection();

  if (result.success) {
    console.log('✅ Firebase OK!');
  } else {
    console.error('❌ Erro:', result.error);
  }
};

test();
```

### Ver Dados no Firestore

```javascript
import { getDoc, doc } from 'firebase/firestore';

const debugProfile = async () => {
  if (!firebaseService.isInitialized) {
    console.log('Firebase não inicializado');
    return;
  }

  const userRef = doc(firebaseService.db, 'users', firebaseService.userId);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    console.log('Perfil no Firestore:', snap.data());
  } else {
    console.log('Perfil não existe no Firestore');
  }
};
```

## 🌐 Deploy para Web

### Passo a Passo

```bash
# 1. Build
npm run web -- --no-dev

# 2. Login Firebase
npm install -g firebase-tools
firebase login

# 3. Inicializar (primeira vez)
firebase init hosting
# Escolha:
# - Projeto: cuidadonow
# - Public directory: dist
# - SPA: Yes
# - Overwrite: No

# 4. Deploy
firebase deploy --only hosting

# 5. Acesse
# https://cuidadonow.web.app
```

### Comandos Úteis

```bash
# Ver projetos
firebase projects:list

# Ver hosting atual
firebase hosting:sites:list

# Preview local
firebase serve --only hosting

# Ver logs
firebase hosting:logs
```

## 📱 Compatibilidade

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Firestore | ✅ | ✅ | ✅ |
| Auth | ✅ | ✅ | ✅ |
| Hosting | ❌ | ❌ | ✅ |
| Offline | ✅* | ✅* | ⚠️** |

\* Com persistence habilitada
\** Limitado no browser

## 🐛 Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| "Firebase not initialized" | Config não carregada | `await firebaseService.initialize(config)` |
| "Permission denied" | Security rules bloqueando | Revisar Firestore Rules |
| "Invalid API key" | Config incorreta | Verificar Firebase Console |
| "Network request failed" | Sem internet | Verificar conexão |
| "User not found" | Email não cadastrado | Usar `register()` primeiro |

## 🎓 Perguntas Frequentes

**Q: O app funciona sem Firebase?**
A: Sim! Totalmente. Firebase é opcional.

**Q: Dados são sincronizados automaticamente?**
A: Atualmente não. Sync deve ser implementado manualmente chamando os métodos.

**Q: Como migrar dados locais para Firebase?**
A: Leia do AsyncStorage e use `saveUserProfile()` + `syncChatMessage()` para cada item.

**Q: Firebase é grátis?**
A: Sim, até os limites do free tier. Depois, cobra por uso.

**Q: Como fazer backup dos dados?**
A: Use Firebase Console → Firestore → Export data

**Q: Preciso ter Firebase Auth para usar Firestore?**
A: Não, mas Security Rules podem exigir auth dependendo da configuração.

## 📚 Recursos

- **Doc Completa**: [FIREBASE_INTEGRATION.md](./FIREBASE_INTEGRATION.md)
- **Diagramas**: [FIREBASE_INTEGRATION_DIAGRAM.md](./FIREBASE_INTEGRATION_DIAGRAM.md)
- **Código**: `src/services/FirebaseService.js`
- **Firebase Docs**: https://firebase.google.com/docs

---

**Última atualização**: 2026-01-27
**Versão**: 1.0
