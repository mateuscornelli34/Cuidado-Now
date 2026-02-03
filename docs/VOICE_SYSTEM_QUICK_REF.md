# Sistema de Voz - Referência Rápida

## 🚀 Início Rápido

### Importar e Usar
```javascript
import voiceService from '../services/VoiceService';

// Falar texto
await voiceService.speak('Olá! Como está?');

// Parar fala
await voiceService.stop();

// Mudar voz
await voiceService.setPersona('elis');

// Ligar/Desligar
await voiceService.toggleVoice(true);  // Liga
await voiceService.toggleVoice(false); // Desliga
```

## 📋 API Completa

### Métodos Principais

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| `speak()` | `text`, `options?` | `Promise<void>` | Fala o texto com TTS |
| `stop()` | - | `Promise<void>` | Interrompe fala atual |
| `setPersona()` | `personaId` | `Promise<void>` | Define persona de voz |
| `toggleVoice()` | `enabled` | `Promise<void>` | Liga/desliga voz |
| `getCurrentPersona()` | - | `Object` | Retorna persona ativa |
| `getPersonas()` | - | `Array` | Lista todas personas |
| `isAIVoiceActive()` | - | `Boolean` | Verifica se está falando |

### Propriedades

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `isEnabled` | `Boolean` | Voz ligada/desligada |
| `isSpeaking` | `Boolean` | Status atual de fala |
| `currentPersona` | `String` | ID da persona ativa |

## 🎭 Personas Disponíveis

### Padrão
```javascript
{ id: 'default', pitch: 1.0, rate: 1.0 }
```

### Vozes Agudas/Rápidas
```javascript
{ id: 'rita', pitch: 1.3, rate: 1.15 }    // Mais agudo e rápido
{ id: 'dinho', pitch: 1.3, rate: 1.15 }
{ id: 'elis', pitch: 1.15, rate: 0.95 }
{ id: 'gal', pitch: 1.1, rate: 1.0 }
{ id: 'pitty', pitch: 1.08, rate: 1.0 }
{ id: 'maria', pitch: 1.05, rate: 0.9 }
```

### Vozes Graves/Lentas
```javascript
{ id: 'mano', pitch: 0.55, rate: 0.85 }   // Mais grave e lento
{ id: 'milton', pitch: 0.6, rate: 0.85 }
{ id: 'raul', pitch: 0.7, rate: 0.9 }
{ id: 'criolo', pitch: 0.82, rate: 0.9 }
{ id: 'gilberto', pitch: 0.88, rate: 0.95 }
{ id: 'emicida', pitch: 0.9, rate: 0.95 }
{ id: 'chico', pitch: 0.92, rate: 1.05 }
{ id: 'caetano', pitch: 0.95, rate: 0.85 }
```

## 💡 Exemplos Práticos

### Exemplo 1: Falar Resposta da IA
```javascript
const handleAIResponse = async (responseText) => {
    // Para qualquer fala anterior
    await voiceService.stop();

    // Fala nova resposta
    await voiceService.speak(responseText);
};
```

### Exemplo 2: Preview de Voz
```javascript
const previewVoice = async (personaId) => {
    await voiceService.setPersona(personaId);

    const persona = voiceService.getCurrentPersona();
    await voiceService.speak(`Olá, eu sou ${persona.name}.`);
};
```

### Exemplo 3: Toggle com Feedback
```javascript
const toggleVoiceWithFeedback = async (enabled) => {
    await voiceService.toggleVoice(enabled);

    if (enabled) {
        await voiceService.speak('Voz ativada com sucesso!');
    }
};
```

### Exemplo 4: Verificar Estado
```javascript
// Antes de falar, verificar se já está falando
if (!voiceService.isAIVoiceActive()) {
    await voiceService.speak('Novo texto aqui');
}
```

### Exemplo 5: Fala com Opções Customizadas
```javascript
await voiceService.speak('Texto importante', {
    pitch: 1.2,    // Sobrescreve pitch da persona
    rate: 0.8,     // Sobrescreve rate da persona
    onDone: () => {
        console.log('Terminou de falar!');
    }
});
```

## 🎯 Padrões Comuns

### Pattern 1: Falar Automaticamente no Chat
```javascript
// ChatScreen.js
const handleSend = async () => {
    // 1. Para fala anterior
    voiceService.stop();

    // 2. Processa mensagem
    const response = await aiService.generateResponse(userMessage);

    // 3. Fala resposta
    voiceService.speak(response.text);
};
```

### Pattern 2: Modal de Seleção de Voz
```javascript
const VoiceSelector = () => {
    const personas = voiceService.getPersonas();

    return (
        <FlatList
            data={personas}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={async () => {
                        await voiceService.setPersona(item.id);
                        await voiceService.speak(`Olá, eu sou ${item.name}.`);
                    }}
                >
                    <Text>{item.name}</Text>
                    <Text>{item.description}</Text>
                </TouchableOpacity>
            )}
        />
    );
};
```

### Pattern 3: Cleanup ao Sair da Tela
```javascript
// Em qualquer tela que usa voz
useFocusEffect(
    useCallback(() => {
        return () => {
            // Cleanup: para fala ao sair
            voiceService.stop();
        };
    }, [])
);
```

### Pattern 4: Settings Toggle
```javascript
const SettingsVoiceToggle = () => {
    const [enabled, setEnabled] = useState(voiceService.isEnabled);

    const handleToggle = async (value) => {
        setEnabled(value);
        await voiceService.toggleVoice(value);
        await userData.saveSettings({ voice: { enabled: value }});
    };

    return (
        <Switch
            value={enabled}
            onValueChange={handleToggle}
        />
    );
};
```

## ⚠️ Avisos Importantes

### ❌ NÃO FAZER
```javascript
// NÃO esquecer de parar antes de nova fala
voiceService.speak(text1);
voiceService.speak(text2);  // Pode causar conflito!

// NÃO usar em loop sem controle
for (let i = 0; i < 100; i++) {
    voiceService.speak('texto');  // Vai criar 100 falas simultâneas!
}

// NÃO bloquear UI esperando fala terminar
await voiceService.speak(longText);  // OK, mas não bloqueia
// Usuário pode continuar interagindo

// NÃO assumir que voz está sempre ligada
voiceService.speak(text);  // Pode não fazer nada se desabilitada
```

### ✅ FAZER
```javascript
// Sempre pare antes de nova fala
await voiceService.stop();
await voiceService.speak(newText);

// Verifique se está habilitado
if (voiceService.isEnabled) {
    await voiceService.speak(text);
}

// Use callbacks para ações após fala
voiceService.speak(text, {
    onDone: () => {
        // Próxima ação aqui
    }
});

// Cleanup apropriado
useEffect(() => {
    return () => {
        voiceService.stop();
    };
}, []);
```

## 🔍 Debugging

### Verificar Estado Atual
```javascript
console.log('Voz habilitada?', voiceService.isEnabled);
console.log('Está falando?', voiceService.isSpeaking);
console.log('Persona atual:', voiceService.currentPersona);
console.log('Detalhes:', voiceService.getCurrentPersona());
```

### Testar Todas as Personas
```javascript
const testAllVoices = async () => {
    const personas = voiceService.getPersonas();

    for (const persona of personas) {
        await voiceService.setPersona(persona.id);
        await voiceService.speak(`Testando ${persona.name}`);

        // Aguarda 3 segundos antes da próxima
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
};
```

### Log de Operações
```javascript
// Wrap para debug
const debugSpeak = async (text) => {
    console.log('🔊 Falando:', text);
    console.log('Persona:', voiceService.getCurrentPersona().name);

    try {
        await voiceService.speak(text);
        console.log('✅ Fala concluída');
    } catch (error) {
        console.error('❌ Erro ao falar:', error);
    }
};
```

## 📱 Compatibilidade

| Plataforma | Status | Observações |
|------------|--------|-------------|
| iOS | ✅ | Excelente qualidade |
| Android | ✅ | Depende de vozes instaladas |
| Web Chrome | ✅ | Ótimo suporte |
| Web Safari | ✅ | Bom suporte |
| Web Firefox | ⚠️ | Suporte limitado |
| Web IE | ❌ | Não suportado |

## 🎓 Perguntas Frequentes

**Q: A voz da persona muda o que a IA fala?**
A: Não. A persona muda apenas o TOM e VELOCIDADE da fala, não o conteúdo.

**Q: Posso ter múltiplas falas simultâneas?**
A: Tecnicamente sim, mas não é recomendado. Use `stop()` antes de nova fala.

**Q: Como sei quando a fala terminou?**
A: Use o callback `onDone` nas options do `speak()`.

**Q: A configuração persiste ao fechar o app?**
A: Sim, é salva no AsyncStorage e restaurada na próxima abertura.

**Q: Funciona offline?**
A: Sim! Usa TTS nativo do dispositivo, não precisa de internet.

**Q: Posso ajustar volume?**
A: Não diretamente. O usuário controla via volume do sistema.

**Q: Por que a voz soa robótica?**
A: Depende das vozes instaladas no dispositivo. Qualidade varia.

**Q: Existe limite de tamanho do texto?**
A: Não formalmente, mas textos muito longos podem ter problemas. Recomendado < 500 palavras.

## 📚 Recursos Adicionais

- **Documentação Completa**: `VOICE_SYSTEM.md`
- **Diagramas Visuais**: `VOICE_SYSTEM_DIAGRAM.md`
- **Código Fonte**: `src/services/VoiceService.js`
- **Expo Speech Docs**: https://docs.expo.dev/versions/latest/sdk/speech/

## 🛠️ Solução de Problemas

| Problema | Possível Causa | Solução |
|----------|----------------|---------|
| Ícones não aparecem | Fontes não carregadas | Ver `App.js` linha 93 |
| Voz não toca | `isEnabled = false` | Verificar toggle em Settings |
| Voz robótica | Vozes ruins no device | Instalar vozes melhores no SO |
| Múltiplas falas | Não chamou `stop()` | Sempre parar antes de nova fala |
| Preview não funciona | Erro na persona | Verificar ID da persona |
| Crash ao falar | Texto inválido/vazio | Validar texto antes de `speak()` |

---

**Última atualização**: 2026-01-27
**Versão do documento**: 1.0
**Maintainer**: Equipe Cuidado-Now
