# Documentação Cuidado-Now

Bem-vindo à documentação técnica do **Cuidado-Now**, um aplicativo de assistente de saúde mental com IA.

## 📚 Índice de Documentos

### 🎯 Essenciais

1. **[ICON_GUIDE.md](./ICON_GUIDE.md)**
   - Guia de padronização de ícones
   - Convenções de uso do Ionicons
   - Tamanhos, cores e boas práticas

### ☁️ Integração Firebase (Cloud Storage & Auth)

2. **[FIREBASE_INTEGRATION.md](./FIREBASE_INTEGRATION.md)** ⭐ Recomendado
   - Documentação completa da integração Firebase
   - Firestore, Authentication e Hosting
   - Arquitetura local-first com sync opcional
   - Como configurar e usar

3. **[FIREBASE_INTEGRATION_DIAGRAM.md](./FIREBASE_INTEGRATION_DIAGRAM.md)**
   - Diagramas visuais e fluxogramas
   - Estrutura de dados no Firestore
   - Fluxos de autenticação e sync
   - Comparação com/sem Firebase

4. **[FIREBASE_QUICK_REF.md](./FIREBASE_QUICK_REF.md)** 🚀 Referência Rápida
   - API completa e exemplos
   - Padrões comuns de uso
   - Deploy e debugging
   - Solução de problemas

### 🎵 Sistema de Voz (Text-to-Speech)

5. **[VOICE_SYSTEM.md](./VOICE_SYSTEM.md)** ⭐ Recomendado
   - Documentação completa do sistema de voz
   - Explicação de personas inspiradas em artistas MPB
   - Como funciona o TTS com expo-speech
   - Exemplos de uso e integração

6. **[VOICE_SYSTEM_DIAGRAM.md](./VOICE_SYSTEM_DIAGRAM.md)**
   - Diagramas visuais e fluxogramas
   - Mapa de fluxo de dados
   - Comparações de personas
   - Cenários de teste

7. **[VOICE_SYSTEM_QUICK_REF.md](./VOICE_SYSTEM_QUICK_REF.md)** 🚀 Referência Rápida
   - Guia de referência rápida
   - API completa
   - Exemplos práticos
   - Solução de problemas

## 📖 Como Usar Esta Documentação

### Para Desenvolvedores Novos no Projeto

1. Comece pelo **[CLAUDE.md](../CLAUDE.md)** na raiz do projeto
2. Leia **[FIREBASE_INTEGRATION.md](./FIREBASE_INTEGRATION.md)** para entender cloud sync
3. Leia **[VOICE_SYSTEM.md](./VOICE_SYSTEM.md)** para entender o sistema de voz
4. Consulte **[ICON_GUIDE.md](./ICON_GUIDE.md)** ao trabalhar com UI

### Para Desenvolvedores Experientes

- Use **[FIREBASE_QUICK_REF.md](./FIREBASE_QUICK_REF.md)** ou **[VOICE_SYSTEM_QUICK_REF.md](./VOICE_SYSTEM_QUICK_REF.md)** para consultas rápidas
- **[FIREBASE_INTEGRATION_DIAGRAM.md](./FIREBASE_INTEGRATION_DIAGRAM.md)** ou **[VOICE_SYSTEM_DIAGRAM.md](./VOICE_SYSTEM_DIAGRAM.md)** para entender fluxos

### Para Designers

- **[ICON_GUIDE.md](./ICON_GUIDE.md)** - Padrões visuais de ícones
- **[VOICE_SYSTEM.md](./VOICE_SYSTEM.md)** seção "Interface do Usuário"

## 🗂️ Estrutura de Documentação

```
docs/
├── README.md                           # Este arquivo (índice)
├── ICON_GUIDE.md                      # Guia de ícones
│
├── FIREBASE_INTEGRATION.md            # Firebase (completo)
├── FIREBASE_INTEGRATION_DIAGRAM.md    # Firebase diagramas
├── FIREBASE_QUICK_REF.md              # Firebase ref. rápida
│
├── VOICE_SYSTEM.md                    # Voz (completo)
├── VOICE_SYSTEM_DIAGRAM.md            # Voz diagramas
├── VOICE_SYSTEM_QUICK_REF.md          # Voz ref. rápida
└── VOICE_SYSTEM_CHEATSHEET.md         # Voz cheat sheet
```

## 🔗 Documentos Relacionados (Raiz do Projeto)

- **[CLAUDE.md](../CLAUDE.md)** - Guia para Claude Code com visão geral da arquitetura
- **[ICON_SYSTEM_REVIEW.md](../ICON_SYSTEM_REVIEW.md)** - Relatório de revisão do sistema de ícones
- **[README.md](../README.md)** - README principal do projeto (se existir)
- **[package.json](../package.json)** - Dependências e scripts npm

## 📝 Convenções de Documentação

### Formato
- Todos os documentos usam **Markdown** (.md)
- Títulos começam com emoji para fácil identificação
- Code blocks usam syntax highlighting

### Estrutura de Documento
```markdown
# Título Principal

## 📖 Visão Geral
(Resumo executivo)

## 🎯 Objetivo
(Por que isso existe)

## 🏗️ Arquitetura
(Como funciona)

## 💡 Exemplos
(Código prático)

## 🔧 API/Referência
(Detalhes técnicos)

## 🐛 Troubleshooting
(Problemas comuns)
```

### Emojis Usados
- 📖 Visão geral / Introdução
- 🎯 Objetivos / Metas
- 🏗️ Arquitetura / Estrutura
- 🔧 Configuração / API
- 💡 Exemplos / Dicas
- 🎨 UI/UX / Design
- 🎭 Personas / Variações
- 🔄 Fluxos / Processos
- 📊 Dados / Estruturas
- 🔐 Segurança / Privacidade
- 🐛 Bugs / Troubleshooting
- ✅ Boas práticas
- ❌ Más práticas
- ⚠️ Avisos importantes
- 🚀 Quick start / Início rápido
- 📚 Recursos / Referências
- 🧪 Testes
- 📱 Plataformas
- 🎵 Áudio / Voz
- 🎨 Ícones / Visual

## 🤝 Contribuindo com a Documentação

### Ao Adicionar Novo Documento

1. Crie o arquivo em `docs/` com nome descritivo
2. Use formato: `NOME_DO_RECURSO.md`
3. Adicione entrada neste README.md
4. Siga as convenções de formato
5. Inclua exemplos práticos
6. Adicione links para recursos relacionados

### Ao Atualizar Documento Existente

1. Mantenha estrutura consistente
2. Atualize data no rodapé
3. Incremente versão se mudança significativa
4. Documente breaking changes claramente

### Checklist de Qualidade

- [ ] Título claro e descritivo
- [ ] Seção de Visão Geral presente
- [ ] Exemplos de código funcionais
- [ ] Links internos funcionando
- [ ] Markdown válido (sem erros de sintaxe)
- [ ] Code blocks com linguagem especificada
- [ ] Diagramas/ASCII art alinhados corretamente
- [ ] Sem typos óbvios

## 📋 Templates

### Template para Novo Sistema/Feature

```markdown
# Nome do Sistema

## 📖 Visão Geral
[Descrição em 2-3 parágrafos]

## 🎯 Objetivo
[Por que isso existe]

## 🏗️ Arquitetura
[Como funciona - diagrama opcional]

## 🔧 Como Usar
[Exemplos práticos]

## 📚 API/Referência
[Métodos, propriedades, etc.]

## 🐛 Troubleshooting
[Problemas comuns e soluções]

## 🔗 Recursos
[Links úteis]
```

### Template para Guia/Tutorial

```markdown
# Como Fazer X

## 🎯 O que você vai aprender
[Objetivos do tutorial]

## 📋 Pré-requisitos
[O que é necessário saber/ter]

## 🚀 Passo a Passo

### Passo 1: [Nome]
[Instruções]

### Passo 2: [Nome]
[Instruções]

## ✅ Verificação
[Como confirmar que funcionou]

## 🔗 Próximos Passos
[Links para conteúdo relacionado]
```

## 🔍 Busca Rápida

### Por Tópico

**Firebase/Cloud:**
- Sistema completo → [FIREBASE_INTEGRATION.md](./FIREBASE_INTEGRATION.md)
- API rápida → [FIREBASE_QUICK_REF.md](./FIREBASE_QUICK_REF.md)
- Diagramas → [FIREBASE_INTEGRATION_DIAGRAM.md](./FIREBASE_INTEGRATION_DIAGRAM.md)

**Voz/TTS:**
- Sistema completo → [VOICE_SYSTEM.md](./VOICE_SYSTEM.md)
- API rápida → [VOICE_SYSTEM_QUICK_REF.md](./VOICE_SYSTEM_QUICK_REF.md)
- Diagramas → [VOICE_SYSTEM_DIAGRAM.md](./VOICE_SYSTEM_DIAGRAM.md)
- Cheat sheet → [VOICE_SYSTEM_CHEATSHEET.md](./VOICE_SYSTEM_CHEATSHEET.md)

**Ícones/UI:**
- Guia de ícones → [ICON_GUIDE.md](./ICON_GUIDE.md)
- Revisão do sistema → [ICON_SYSTEM_REVIEW.md](../ICON_SYSTEM_REVIEW.md)

**Arquitetura Geral:**
- Visão geral → [CLAUDE.md](../CLAUDE.md)

### Por Tipo de Informação

**Conceitos:** FIREBASE_INTEGRATION.md, VOICE_SYSTEM.md, CLAUDE.md
**Referência:** FIREBASE_QUICK_REF.md, VOICE_SYSTEM_QUICK_REF.md, ICON_GUIDE.md
**Visuais:** FIREBASE_INTEGRATION_DIAGRAM.md, VOICE_SYSTEM_DIAGRAM.md
**Histórico:** ICON_SYSTEM_REVIEW.md

## 📈 Status da Documentação

| Documento | Status | Última Atualização |
|-----------|--------|-------------------|
| ICON_GUIDE.md | ✅ Completo | 2026-01-27 |
| FIREBASE_INTEGRATION.md | ✅ Completo | 2026-01-27 |
| FIREBASE_INTEGRATION_DIAGRAM.md | ✅ Completo | 2026-01-27 |
| FIREBASE_QUICK_REF.md | ✅ Completo | 2026-01-27 |
| VOICE_SYSTEM.md | ✅ Completo | 2026-01-27 |
| VOICE_SYSTEM_DIAGRAM.md | ✅ Completo | 2026-01-27 |
| VOICE_SYSTEM_QUICK_REF.md | ✅ Completo | 2026-01-27 |
| VOICE_SYSTEM_CHEATSHEET.md | ✅ Completo | 2026-01-27 |

**Legenda:**
- ✅ Completo e atualizado
- 🔄 Em progresso
- 📝 Planejado
- ⚠️ Precisa atualização

## 💬 Dúvidas e Suporte

Para dúvidas sobre:
- **Código**: Consulte os comentários inline nos arquivos fonte
- **Arquitetura**: Veja [CLAUDE.md](../CLAUDE.md)
- **Sistemas específicos**: Consulte documentos desta pasta
- **Setup**: Veja [package.json](../package.json) scripts

## 🎓 Recursos de Aprendizado

### Tecnologias Principais
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/)
- [React Navigation](https://reactnavigation.org/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Ionicons](https://ionic.io/ionicons)

### Conceitos Importantes
- [Text-to-Speech (TTS)](https://en.wikipedia.org/wiki/Speech_synthesis)
- [Mental Health Apps Best Practices](https://www.apa.org/monitor/2021/07/mental-health-apps)
- [Harm Reduction](https://harmreduction.org/about-us/principles-of-harm-reduction/)
- [Open Dialogue](https://www.opendialogueapproach.co.uk/)

---

**Mantido por**: Equipe Cuidado-Now
**Última atualização**: 2026-01-27
**Feedback**: Contribuições são bem-vindas!
