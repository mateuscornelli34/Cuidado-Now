# Sistema de Voz - Cuidado-Now

## 📖 Visão Geral

O sistema de voz do Cuidado-Now transforma texto em fala (TTS - Text-to-Speech) para criar uma experiência mais humana e acolhedora. Cada resposta da IA pode ser ouvida com diferentes "personas" de voz inspiradas em artistas da música brasileira.

## 🎯 Objetivo

Tornar a interação com o assistente de saúde mental mais **natural, envolvente e acessível**, especialmente para:
- Usuários com dificuldade de leitura
- Momentos onde ler não é possível (dirigindo, cozinhando)
- Pessoas que preferem comunicação auditiva
- Criar conexão emocional através do tom de voz

## 🏗️ Arquitetura

### Tecnologia Base
- **Biblioteca**: `expo-speech`
- **Funcionalidade**: Síntese de voz nativa (iOS, Android, Web)
- **Idioma**: Português do Brasil (pt-BR)

### Estrutura do Código
```
src/services/VoiceService.js   # Serviço principal
  ↓
Usado por:
├── ChatScreen.js              # Fala respostas da IA automaticamente
├── HomeScreen.js             # Preview de vozes
└── SettingsScreen.js         # Configurações de voz
```

## 🎭 Personas de Voz

O sistema oferece **15 personas** inspiradas em artistas brasileiros, cada uma com características únicas de pitch (tom) e rate (velocidade):

### 1. **Padrão** (default)
- Tom: Normal (1.0)
- Velocidade: Normal (1.0)
- Uso: Voz equilibrada e neutra

### 2. **Elis** (Elis Regina)
- Tom: Agudo (1.15)
- Velocidade: Lenta (0.95)
- Característica: Intensa e emotiva

### 3. **Milton** (Milton Nascimento)
- Tom: Grave (0.6)
- Velocidade: Lenta (0.85)
- Característica: Profunda e acolhedora

### 4. **Gal** (Gal Costa)
- Tom: Levemente agudo (1.1)
- Velocidade: Normal (1.0)
- Característica: Suave e calorosa

### 5. **Caetano** (Caetano Veloso)
- Tom: Levemente grave (0.95)
- Velocidade: Lenta (0.85)
- Característica: Calma e poética

### 6. **Maria** (Maria Bethânia)
- Tom: Médio-agudo (1.05)
- Velocidade: Lenta (0.9)
- Característica: Doce e acolhedora

### 7. **Gilberto** (Gilberto Gil)
- Tom: Grave (0.88)
- Velocidade: Lenta (0.95)
- Característica: Serena e relaxante

### 8. **Rita** (Rita Lee)
- Tom: Muito agudo (1.3)
- Velocidade: Rápida (1.15)
- Característica: Irreverente e explosiva

### 9. **Dinho** (Mamonas Assassinas)
- Tom: Muito agudo (1.3)
- Velocidade: Rápida (1.15)
- Característica: Energética e divertida

### 10. **Raul** (Raul Seixas)
- Tom: Grave (0.7)
- Velocidade: Lenta (0.9)
- Característica: Rebelde e filosófica

### 11. **Chico** (Chico Science)
- Tom: Médio-grave (0.92)
- Velocidade: Rápida (1.05)
- Característica: Rítmica e inovadora

### 12. **Mano Brown** (Racionais MC's)
- Tom: Muito grave (0.55)
- Velocidade: Lenta (0.85)
- Característica: Profunda e impactante

### 13. **Emicida**
- Tom: Grave (0.9)
- Velocidade: Lenta (0.95)
- Característica: Eloquente e inspiradora

### 14. **Criolo**
- Tom: Grave (0.82)
- Velocidade: Lenta (0.9)
- Característica: Poética e intensa

### 15. **Pitty**
- Tom: Médio-agudo (1.08)
- Velocidade: Normal (1.0)
- Característica: Forte e emotiva

## 🔧 Como Funciona

### 1. Inicialização

Quando o app inicia, o `VoiceService` é criado como singleton:

```javascript
class VoiceService {
    constructor() {
        this.isEnabled = true;           // Voz ativada por padrão
        this.isSpeaking = false;          // Status atual
        this.currentPersona = 'default';  // Persona padrão
        this.loadSettings();              // Carrega preferências salvas
    }
}
```

### 2. Persistência de Configurações

As configurações são salvas em `AsyncStorage`:

```javascript
// Chave de armazenamento
const VOICE_SETTINGS_KEY = '@mindcare_voice_settings';

// Dados salvos
{
    isEnabled: true/false,           // Voz ligada/desligada
    currentPersona: 'elis'           // Persona selecionada
}
```

### 3. Fala Automática (speak)

Quando a IA responde no chat, o texto é automaticamente falado:

```javascript
async speak(text, options = {}) {
    if (!this.isEnabled || !text) return;

    const persona = this.getCurrentPersona();

    const defaultOptions = {
        language: 'pt-BR',
        pitch: persona.pitch,      // Tom da persona
        rate: persona.rate,        // Velocidade da persona
        onDone: () => { this.isSpeaking = false; },
        onError: () => { this.isSpeaking = false; }
    };

    await Speech.speak(text, defaultOptions);
}
```

### 4. Interrupção (stop)

Quando o usuário envia nova mensagem, a fala anterior é interrompida:

```javascript
async stop() {
    await Speech.stop();
    this.isSpeaking = false;
}
```

## 🎬 Fluxo de Uso

### No ChatScreen

```
1. Usuário envia mensagem
   ↓
2. voiceService.stop()  // Para fala anterior
   ↓
3. IA gera resposta
   ↓
4. voiceService.speak(response.text)  // Fala resposta
   ↓
5. Usuário ouve a resposta
```

### Exemplo Real (ChatScreen.js linha 398-449):

```javascript
const handleSend = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return;

    setInputText('');
    voiceService.stop(); // Para qualquer fala em andamento

    // Adiciona mensagem do usuário
    const userMsg = {
        id: `user_${Date.now()}`,
        text: trimmedText,
        isUser: true,
        timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    await userData.addChatMessage(trimmedText, true);

    // IA responde
    setIsTyping(true);
    const response = await aiService.generateResponse(
        trimmedText,
        messages,
        sentiment
    );

    const aiMsg = {
        id: `ai_${Date.now()}`,
        text: response.text,
        isUser: false,
        timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, aiMsg]);
    await userData.addChatMessage(response.text, false);

    // FALA AUTOMÁTICA - A mágica acontece aqui!
    voiceService.speak(response.text);

    setIsTyping(false);
};
```

## ⚙️ Configurações

### Ativar/Desativar Voz

```javascript
// No SettingsScreen ou ChatScreen
await voiceService.toggleVoice(true);  // Ativa
await voiceService.toggleVoice(false); // Desativa
```

### Mudar Persona

```javascript
// Selecionar uma persona
await voiceService.setPersona('elis');

// Testar com preview
voiceService.speak(`Olá, eu sou ${persona.name}.`);
```

### Obter Personas Disponíveis

```javascript
const personas = voiceService.getPersonas();
// Retorna array com todas as 15 personas
```

### Verificar Persona Atual

```javascript
const current = voiceService.getCurrentPersona();
// Retorna objeto: { id, name, description, pitch, rate, icon }
```

## 🎨 Interface do Usuário

### Seletor de Voz (Modal)

Aparece em:
- **HomeScreen**: Botão flutuante com ícone de voz
- **ChatScreen**: Botão de voz na interface
- **SettingsScreen**: Seção de configurações

Visual:
```
┌────────────────────────────┐
│  Escolher Voz da IA        │
├────────────────────────────┤
│  [🎵] Elis                 │
│  Intensa e emotiva         │
├────────────────────────────┤
│  [🎵] Milton               │
│  Grave e profunda          │
├────────────────────────────┤
│  [🎵] Gal                  │
│  Suave e calorosa          │
└────────────────────────────┘
```

Ao tocar em uma persona:
1. Salva a escolha
2. Reproduz um preview: "Olá, eu sou [nome]."
3. Fecha o modal

## 🔄 Ciclo de Vida

### Quando a voz é ativada:
1. **Primeiro acesso (onboarding)**:
   - Fala mensagem de boas-vindas
   - `"Olá! Como prefere ser chamado?"`

2. **Início de nova conversa**:
   - Fala saudação personalizada
   - `"Bom dia, [nome]! Como você está?"`

3. **Durante o chat**:
   - Fala cada resposta da IA automaticamente
   - Para fala anterior ao enviar nova mensagem

4. **Ao sair do chat**:
   - `voiceService.stop()` é chamado no cleanup

### Quando a voz é desativada:
- Para imediatamente qualquer fala
- Não fala novas respostas
- Configuração é salva

## 🧩 Integração com Outras Funcionalidades

### Com AIService
O VoiceService é independente, mas trabalha em conjunto:
- AIService gera o texto
- VoiceService transforma em fala

### Com UserData
As preferências são persistidas:
```javascript
// Configurações em userData.getSettings()
{
    voice: {
        enabled: true
    }
}

// Persona em voiceService
{
    isEnabled: true,
    currentPersona: 'elis'
}
```

### Com Therapeutic Personas
**Importante**: A persona de voz é **independente** da abordagem terapêutica:
- Voz = Como fala (tom, velocidade)
- Abordagem = O que fala (Freud, Skinner, etc.)

Exemplo:
- Voz: Elis (aguda, emotiva)
- Abordagem: Freud (psicanálise)
- Resultado: Análise freudiana falada com tom de Elis Regina

## 📱 Compatibilidade de Plataforma

### iOS
- Usa vozes nativas do iOS (Siri TTS)
- Suporta ajuste de pitch e rate
- Qualidade excelente

### Android
- Usa vozes nativas do Android (Google TTS)
- Suporta ajuste de pitch e rate
- Qualidade depende das vozes instaladas

### Web
- Usa Web Speech API do navegador
- Suporte varia por navegador:
  - ✅ Chrome: Excelente
  - ✅ Safari: Bom
  - ⚠️ Firefox: Limitado
  - ❌ IE: Não suportado

## 🐛 Tratamento de Erros

```javascript
try {
    await voiceService.speak(text);
} catch (error) {
    console.error('Erro ao sintetizar voz:', error);
    // Falha silenciosa - não interrompe UX
}
```

Erros comuns:
1. **Permissões negadas**: App continua sem voz
2. **Texto vazio**: Ignora silenciosamente
3. **Voz desabilitada**: Não executa
4. **Plataforma não suporta**: Fallback gracioso

## 🎯 Boas Práticas

### Para Desenvolvedores

1. **Sempre pare a fala anterior antes de nova**:
   ```javascript
   voiceService.stop();
   await voiceService.speak(newText);
   ```

2. **Respeite a preferência do usuário**:
   ```javascript
   if (voiceService.isEnabled) {
       voiceService.speak(text);
   }
   ```

3. **Textos curtos são melhores**:
   - Evite textos > 200 palavras
   - Quebre em partes se necessário

4. **Teste em todas as plataformas**:
   - Comportamento pode variar
   - Ajuste pitch/rate se necessário

### Para UX

1. **Feedback visual**:
   - Mostre quando está falando
   - Permita pausar/parar facilmente

2. **Controle do usuário**:
   - Sempre permita desativar
   - Botão de parar visível

3. **Preview obrigatório**:
   - Deixe usuário testar antes de escolher
   - "Olá, eu sou [nome]" funciona bem

## 🔮 Possíveis Melhorias Futuras

1. **Controle de volume**:
   ```javascript
   await voiceService.speak(text, { volume: 0.8 });
   ```

2. **Pausar/Resumir**:
   ```javascript
   await voiceService.pause();
   await voiceService.resume();
   ```

3. **Fila de falas**:
   ```javascript
   voiceService.queue([text1, text2, text3]);
   ```

4. **Vozes customizadas**:
   - Upload de samples de voz
   - Treinamento personalizado

5. **Emojis para ênfase**:
   - Detectar emojis e ajustar entonação
   - 😊 = tom mais alegre
   - 😢 = tom mais suave

6. **Controle por gestos**:
   - Shake para parar
   - Double tap para repetir

## 📚 Referências

- [Expo Speech Documentation](https://docs.expo.dev/versions/latest/sdk/speech/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [iOS Speech Synthesis](https://developer.apple.com/documentation/avfoundation/speech_synthesis)
- [Android TextToSpeech](https://developer.android.com/reference/android/speech/tts/TextToSpeech)

## 🎵 Créditos

As personas de voz são uma homenagem aos grandes artistas da música brasileira que inspiram o tom acolhedor e humanizado do aplicativo.
