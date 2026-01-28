# Guia de Padronização de Ícones - Cuidado-Now

## Biblioteca Padrão
Este projeto utiliza **Ionicons** via `@expo/vector-icons` como biblioteca principal de ícones.

## Convenções de Uso

### Ícones de Navegação (Bottom Tabs)
- **Home**: `home` / `home-outline`
- **Chat**: `chatbubbles` / `chatbubbles-outline`
- **Emergency**: `call` / `call-outline`
- **Registration**: `person` / `person-outline`
- **Support**: `logo-whatsapp`
- **Settings**: `settings` / `settings-outline`

**Padrão**: Use versão `filled` quando focado, `outline` quando não focado.

### Ícones de Ação

#### Primárias (CTAs)
- **Enviar mensagem**: `send`
- **Ligar/Chamar**: `call`
- **Adicionar**: `add-circle`
- **Salvar**: `checkmark-circle`
- **Confirmar**: `checkmark`

#### Secundárias
- **Editar**: `create-outline` ou `pencil`
- **Deletar**: `trash-outline`
- **Fechar/Cancelar**: `close` ou `close-circle`
- **Voltar**: `arrow-back`
- **Avançar**: `arrow-forward` ou `chevron-forward`

### Ícones de Estado

#### Emocional/Mental
- **Bem-estar**: `heart`
- **Apoio**: `heart-circle`
- **Alerta**: `warning`
- **Emergência**: `alert-circle`
- **Positivo**: `happy`
- **Neutro**: `ellipse`
- **Negativo**: `sad`

#### Sistema
- **Carregando**: `hourglass`
- **Sucesso**: `checkmark-circle`
- **Erro**: `close-circle`
- **Info**: `information-circle`
- **Ajuda**: `help-circle`

### Ícones de Recursos

#### Comunicação
- **Chat**: `chatbubble-ellipses` ou `chatbubbles`
- **Voz**: `mic` ou `volume-high`
- **Notificação**: `notifications`
- **Email**: `mail`
- **Telefone**: `call`

#### Mídia
- **Imagem**: `image`
- **Câmera**: `camera`
- **Vídeo**: `videocam`
- **Áudio**: `musical-notes`
- **Play**: `play-circle`

#### Configurações
- **Perfil**: `person-circle`
- **Segurança**: `lock-closed`
- **Tema**: `moon` / `sunny`
- **Idioma**: `language`
- **Notificações**: `notifications`

### Ícones Contextuais

#### Saúde Mental
- **Meditação/Mindfulness**: `leaf` ou `flower`
- **Respiração**: `pulse` ou `fitness`
- **Apoio Profissional**: `medical`
- **Recursos**: `book` ou `library`
- **Comunidade**: `people`

#### Links e Navegação Externa
- **Website**: `globe-outline`
- **WhatsApp**: `logo-whatsapp`
- **Google**: `logo-google`
- **Documento**: `document-text`
- **Link externo**: `open-outline`

## Tamanhos Recomendados

### Por Contexto
- **Navigation Tabs**: 24-28px
- **Action Buttons**: 20-24px
- **List Items**: 20-22px
- **Avatar/Large Icons**: 32-48px
- **Inline Text Icons**: 16-18px
- **Small Indicators**: 12-16px

### Por Plataforma
- **iOS**: Preferencialmente 28px para tabs, 22px para conteúdo
- **Android**: Preferencialmente 24px para tabs, 20px para conteúdo
- **Web**: 24px como padrão universal

## Cores dos Ícones

### Por Estado
- **Ativo/Focado**: `colors.primary.main` (#4A90A4)
- **Inativo**: Tema light: `#888`, Tema dark: `gray`
- **Destaque Positivo**: `colors.mood.great` (#7ED399)
- **Destaque Negativo**: `colors.error` (#E74C3C)
- **Neutro/Secundário**: `themeColors.text.secondary`

### Por Contexto
- **Emergência**: `colors.emergency.border` (#E74C3C)
- **Sucesso**: `colors.success` (#27AE60)
- **Aviso**: `colors.warning` (#F39C12)
- **Info**: `colors.info` (#3498DB)

## Boas Práticas

1. **Consistência**: Use o mesmo ícone para a mesma ação em todo o app
2. **Clareza**: Prefira ícones universalmente reconhecidos
3. **Acessibilidade**: Nunca use ícone sem label/descrição em contextos críticos
4. **Performance**: Ícones do Ionicons são otimizados, evite imagens PNG para ícones simples
5. **Tema**: Sempre considere contraste em modo claro e escuro
6. **Touch Target**: Mantenha área de toque mínima de 44x44px (iOS) ou 48x48dp (Android)

## Exemplo de Uso

```jsx
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
    const { themeColors } = useTheme();

    return (
        <TouchableOpacity>
            <Ionicons
                name="heart"
                size={24}
                color={themeColors.primary.main}
            />
        </TouchableOpacity>
    );
}
```

## Migrações Futuras

Se necessário migrar para outra biblioteca de ícones:
- **React Native Vector Icons**: Alternativa com mais opções
- **Custom SVG**: Para ícones únicos da marca
- **Expo Vector Icons**: Já utilizado, suporta múltiplas famílias

## Recursos

- [Ionicons Official](https://ionic.io/ionicons)
- [Expo Vector Icons Directory](https://icons.expo.fyi/)
- [Material Design Icons](https://materialdesignicons.com/)
