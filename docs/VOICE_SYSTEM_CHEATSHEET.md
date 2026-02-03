# Sistema de Voz - Cheat Sheet

## 🎯 O Que É
Sistema de Text-to-Speech (TTS) que fala as respostas da IA usando `expo-speech` com 15 personas inspiradas em artistas brasileiros.

## ⚡ Quick Start
```javascript
import voiceService from '../services/VoiceService';

// Falar
voiceService.speak('Olá!');

// Parar
voiceService.stop();

// Mudar voz
voiceService.setPersona('elis');
```

## 🎭 Personas (15 vozes)

| Persona | Pitch | Rate | Característica |
|---------|-------|------|----------------|
| **default** | 1.00 | 1.00 | Neutro |
| **elis** | 1.15 | 0.95 | Intensa |
| **milton** | 0.60 | 0.85 | Grave |
| **gal** | 1.10 | 1.00 | Suave |
| **mano** | 0.55 | 0.85 | Profundo |
| **rita** | 1.30 | 1.15 | Energética |
| _+ 9 outras_ | ... | ... | ... |

## 📍 Onde É Usado

```
ChatScreen
├─ Fala automática de respostas
├─ Preview ao selecionar voz
└─ Para ao enviar nova mensagem

HomeScreen
└─ Preview ao testar vozes

SettingsScreen
└─ Toggle liga/desliga
```

## 🔄 Fluxo Típico

```
1. Usuário envia mensagem
   ↓
2. voiceService.stop()
   ↓
3. IA gera resposta
   ↓
4. voiceService.speak(resposta)
   ↓
5. Áudio toca 🔊
```

## 🔧 API Essencial

| Método | Uso |
|--------|-----|
| `speak(text)` | Fala texto |
| `stop()` | Para fala |
| `setPersona(id)` | Muda voz |
| `toggleVoice(bool)` | Liga/desliga |
| `getCurrentPersona()` | Voz atual |
| `isEnabled` | Status (true/false) |

## ✅ DO's

```javascript
✅ await voiceService.stop();
   await voiceService.speak(newText);

✅ if (voiceService.isEnabled) {
       voiceService.speak(text);
   }

✅ useEffect(() => {
       return () => voiceService.stop();
   }, []);
```

## ❌ DON'Ts

```javascript
❌ voiceService.speak(text1);
   voiceService.speak(text2);  // Conflito!

❌ for (let i=0; i<100; i++) {
       voiceService.speak('oi'); // 100 falas!
   }

❌ // Esquecer cleanup
   // Sempre pare ao sair da tela
```

## 💾 Persistência

```javascript
// Salvo em AsyncStorage
{
    isEnabled: true,
    currentPersona: 'elis'
}

// Restaurado automaticamente
// ao abrir app
```

## 🎨 Seletor de Voz (UI Pattern)

```jsx
<TouchableOpacity
    onPress={async () => {
        await voiceService.setPersona('elis');
        voiceService.speak('Olá, eu sou Elis.');
    }}
>
    <Text>Elis - Intensa e emotiva</Text>
</TouchableOpacity>
```

## 🐛 Debug

```javascript
console.log(voiceService.isEnabled);
console.log(voiceService.isSpeaking);
console.log(voiceService.currentPersona);
```

## 📱 Suporte

| Plataforma | Status |
|------------|--------|
| iOS | ✅ Excelente |
| Android | ✅ Bom |
| Web Chrome | ✅ Ótimo |
| Web Safari | ✅ Bom |
| Web Firefox | ⚠️ Limitado |

## 🔗 Docs Completas

- **Detalhado**: [VOICE_SYSTEM.md](./VOICE_SYSTEM.md)
- **Diagramas**: [VOICE_SYSTEM_DIAGRAM.md](./VOICE_SYSTEM_DIAGRAM.md)
- **Referência**: [VOICE_SYSTEM_QUICK_REF.md](./VOICE_SYSTEM_QUICK_REF.md)

---
📅 **Atualizado**: 2026-01-27 | 📄 **Fonte**: `src/services/VoiceService.js`
