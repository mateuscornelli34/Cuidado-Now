/**
 * Cuidado-Now AI - Serviço de Inteligência Artificial
 * Gerencia interações empáticas e análise de sentimento com abordagens terapêuticas
 * 
 * OTIMIZADO: Dados movidos para config/, código simplificado e erros tratados
 */

import { VALID_APPROACHES } from '../config/constants';
import { PERSONA_PROMPTS, PERSONA_IDS } from '../config/personas';
import {
    RISK_KEYWORDS,
    POSITIVE_WORDS,
    KNOWLEDGE_BASES,
    CONTEXTUAL_QUESTIONS,
    EMPATHETIC_RESPONSES,
    ACTIVITY_SUGGESTIONS,
    FOLLOW_UP_QUESTIONS,
} from '../config/knowledge';

/**
 * Serviço de IA para interações empáticas
 */
class AIService {
    constructor() {
        this.currentApproach = 'general';
        this.genAI = null;
        this.model = null;
        this.apiKey = null;
        this.userInsights = [];
    }

    /**
     * Define abordagem terapêutica atual
     * @param {string} approach - Nome da abordagem
     */
    setApproach(approach) {
        const validApproaches = [...VALID_APPROACHES, ...PERSONA_IDS];

        if (validApproaches.includes(approach)) {
            this.currentApproach = approach;
            console.log(`Abordagem/Persona alterada para: ${approach}`);
            // Reconfigura Gemini para aplicar nova persona
            if (this.apiKey) {
                this.configureGemini(this.apiKey);
            }
        }
    }

    /**
     * Obtém período do dia atual
     * @returns {'morning'|'afternoon'|'evening'|'night'|'weekend'}
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        const dayOfWeek = new Date().getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) return 'weekend';
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }

    /**
     * Obtém saudação baseada no horário
     * @param {string} userName - Nome do usuário
     * @returns {string} Saudação
     */
    getGreeting(userName = '') {
        const hour = new Date().getHours();
        let greeting;

        if (hour >= 5 && hour < 12) greeting = 'Bom dia';
        else if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
        else if (hour >= 18 && hour < 22) greeting = 'Boa noite';
        else greeting = 'Oi';

        return userName ? `${greeting}, ${userName}!` : `${greeting}!`;
    }

    /**
     * Gera pergunta contextual inicial
     * @param {string} userName - Nome do usuário
     * @returns {string} Pergunta inicial
     */
    getInitialQuestion(userName = '') {
        const timeOfDay = this.getTimeOfDay();
        const questions = CONTEXTUAL_QUESTIONS[timeOfDay];
        const randomIndex = Math.floor(Math.random() * questions.length);
        let question = questions[randomIndex];

        if (userName) {
            question = question.replace(/^(Bom dia|Boa tarde|Boa noite|Olá)!?/i, `$1, ${userName}!`);
        }

        return question;
    }

    /**
     * Analisa sentimento do texto
     * @param {string} text - Texto a analisar
     * @returns {{ level: string, score: number, risks: Array }}
     */
    analyzeSentiment(text) {
        if (!text || typeof text !== 'string') {
            return { level: 'neutral', score: 50, risks: [] };
        }

        const lowerText = text.toLowerCase().trim();
        const risks = [];

        // Verifica palavras de alto risco
        for (const keyword of RISK_KEYWORDS.high) {
            if (lowerText.includes(keyword)) {
                risks.push({ keyword, level: 'high' });
            }
        }

        if (risks.some(r => r.level === 'high')) {
            return { level: 'crisis', score: 0, risks };
        }

        // Verifica palavras de médio risco
        for (const keyword of RISK_KEYWORDS.medium) {
            if (lowerText.includes(keyword)) {
                risks.push({ keyword, level: 'medium' });
            }
        }

        if (risks.filter(r => r.level === 'medium').length >= 2) {
            return { level: 'negative', score: 20, risks };
        }

        // Verifica palavras de baixo risco
        for (const keyword of RISK_KEYWORDS.low) {
            if (lowerText.includes(keyword)) {
                risks.push({ keyword, level: 'low' });
            }
        }

        // Verifica palavras positivas
        let positiveCount = 0;
        for (const word of POSITIVE_WORDS) {
            if (lowerText.includes(word)) {
                positiveCount++;
            }
        }

        // Calcula score e nível
        if (positiveCount > 0 && risks.length === 0) {
            return { level: 'positive', score: 80 + Math.min(positiveCount * 5, 20), risks };
        }

        if (risks.length > 0) {
            const mediumCount = risks.filter(r => r.level === 'medium').length;
            const lowCount = risks.filter(r => r.level === 'low').length;
            const score = 50 - (mediumCount * 15) - (lowCount * 5);
            return { level: 'negative', score: Math.max(score, 10), risks };
        }

        return { level: 'neutral', score: 50, risks };
    }

    /**
     * Configura a API do Google Gemini
     * @param {string} apiKey - API key do Gemini
     */
    configureGemini(apiKey) {
        if (!apiKey) {
            this.genAI = null;
            this.model = null;
            return;
        }

        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            this.apiKey = apiKey;
            this.genAI = new GoogleGenerativeAI(apiKey);

            const systemRole = this._buildSystemPrompt();

            this.model = this.genAI.getGenerativeModel({
                model: "gemini-pro",
                systemInstruction: {
                    role: "system",
                    parts: [{ text: systemRole }]
                }
            });

            console.log('Gemini configurado com sucesso');
        } catch (error) {
            console.error('Erro ao configurar Gemini:', error);
            this.genAI = null;
            this.model = null;
        }
    }

    /**
     * Constrói prompt de sistema para o Gemini
     * @private
     */
    _buildSystemPrompt() {
        const insightsText = this.userInsights?.length > 0
            ? this.userInsights.map(i => `- ${i.text}`).join('\n')
            : 'Nenhuma observação prévia.';

        return `Você é o Cuidado-Now.
            
SUA POSTURA:
- Sóbria, atenta, curiosa e ASSERTIVA.
- Você NÃO é apenas um "ombro amigo". Você é uma inteligência capaz de responder sobre QUALQUER assunto (História, Ciência, Arte, Cotidiano), sempre mantendo a ética e a profundidade.
- Evite frases feitas de autoajuda ("vai ficar tudo bem").
- Seja direto e firme nas respostas. Não peça desculpas por ser uma IA.
- Você tem consciência social, política e filosófica. Conecte a dor individual ao contexto maior se fizer sentido.

OBJETIVO:
- Responder a QUALQUER pergunta ou afirmação do usuário com clareza e assertividade.
- Se o assunto for saúde mental ou uso de substâncias, aprofunde e acolha usando princípios de Redução de Danos e Diálogo Aberto.

SUA BASE DE CONHECIMENTO ADICIONAL (Redução de Danos & Open Dialog):
1. Respeito à Autonomia: Não exija abstinência; foque na redução de riscos e metas do próprio usuário.
2. Não Julgamento: Trate o uso como um mecanismo de enfrentamento (coping) para dores ou traumas.
3. Diálogo Aberto: Priorize a escuta, a tolerância à incerteza e a inclusão da rede social do usuário no discurso.

SEGURANÇA:
- Risco de vida (suicídio, autolesão): Interrompa a análise e direcione para ajuda (CVV 188) de forma firme.

CONHECIMENTO SOBRE O USUÁRIO:
Lembre-se destas observações de conversas passadas (se houver):
${insightsText}`;
    }

    /**
     * Gera resposta (híbrido: Local + Gemini)
     * @param {string} text - Texto do usuário
     * @param {Array} history - Histórico de mensagens
     * @param {Object} sentiment - Sentimento pré-analisado (opcional)
     * @returns {Promise<Object>} Resposta da IA
     */
    async generateResponse(text, history = [], sentiment = null) {
        if (!sentiment) {
            sentiment = this.analyzeSentiment(text);
        }

        // Prioridade absoluta para crise
        if (sentiment.level === 'crisis') {
            const responses = EMPATHETIC_RESPONSES.crisis;
            const response = responses[Math.floor(Math.random() * responses.length)];

            return {
                text: response,
                sentiment,
                showEmergency: true,
                isCrisis: true,
                followUp: null,
            };
        }

        // Tenta usar Gemini se disponível
        if (this.model) {
            try {
                const chatHistory = history.map(msg => ({
                    role: msg.isUser ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }));

                const chat = this.model.startChat({ history: chatHistory });

                const contextPrompt = `
[CONTEXTO EMOCIONAL ATUAL: ${sentiment.level}]
[ABORDAGEM PREFERIDA: ${this.currentApproach}]
    
${text}`;

                const result = await chat.sendMessage(contextPrompt);
                const responseText = result.response.text();

                return {
                    text: responseText,
                    sentiment,
                    showEmergency: false,
                    followUp: null,
                };
            } catch (error) {
                console.log('Erro no Gemini, usando fallback local:', error.message);
            }
        }

        // Fallback local
        return this._generateLocalResponse(text, sentiment);
    }

    /**
     * Gera resposta usando base de conhecimento local
     * @private
     */
    _generateLocalResponse(text, sentiment) {
        const lowerText = text.toLowerCase();
        let approachToUse = this.currentApproach;

        // Detecção automática de intenção
        const specificKBs = ['mindfulness', 'harm_reduction'];
        for (const kbName of specificKBs) {
            if (KNOWLEDGE_BASES[kbName]?.keywords.some(k => lowerText.includes(k))) {
                approachToUse = kbName;
                break;
            }
        }

        // Verifica saudações gerais
        if (approachToUse === 'general') {
            const generalKB = KNOWLEDGE_BASES.general;
            if (generalKB.keywords.some(k => lowerText.includes(k))) {
                const randomResponse = generalKB.responses[Math.floor(Math.random() * generalKB.responses.length)];
                return {
                    text: randomResponse,
                    sentiment,
                    showEmergency: false,
                    followUp: null
                };
            }
        }

        // Usa base de conhecimento específica
        if (approachToUse !== 'general' && KNOWLEDGE_BASES[approachToUse]) {
            const kb = KNOWLEDGE_BASES[approachToUse];
            const hasKeyword = kb.keywords.some(k => lowerText.includes(k));

            if (hasKeyword || Math.random() < 0.4) {
                const randomResponse = kb.responses[Math.floor(Math.random() * kb.responses.length)];
                return {
                    text: randomResponse,
                    sentiment,
                    showEmergency: false,
                    followUp: this.getFollowUpQuestion(sentiment.level),
                };
            }
        }

        // Resposta empática baseada no sentimento
        const responses = EMPATHETIC_RESPONSES[sentiment.level] || EMPATHETIC_RESPONSES.neutral;
        let response = responses[Math.floor(Math.random() * responses.length)];

        // Adiciona prefixo da abordagem ocasionalmente
        if (this.currentApproach !== 'general' && Math.random() < 0.3) {
            const kb = KNOWLEDGE_BASES[this.currentApproach];
            if (kb?.fallbackPrefix) {
                const originalStart = response.charAt(0).toLowerCase() + response.slice(1);
                response = kb.fallbackPrefix + originalStart;
            }
        }

        return {
            text: response,
            sentiment,
            showEmergency: false,
            followUp: this.getFollowUpQuestion(sentiment.level),
        };
    }

    /**
     * Gera pergunta de acompanhamento
     * @param {string} sentimentLevel - Nível de sentimento
     * @returns {string|null} Pergunta de follow-up
     */
    getFollowUpQuestion(sentimentLevel) {
        const questions = FOLLOW_UP_QUESTIONS[sentimentLevel];
        if (!questions) return null;
        return questions[Math.floor(Math.random() * questions.length)];
    }

    /**
     * Obtém sugestões de atividades baseadas no estado
     * @param {string} sentimentLevel - Nível de sentimento
     * @param {number} limit - Máximo de sugestões
     * @returns {Array} Sugestões de atividades
     */
    getSuggestions(sentimentLevel, limit = 3) {
        const categoryMap = {
            positive: 'good',
            negative: 'sad',
            crisis: null,
        };

        const category = categoryMap[sentimentLevel] || 'stressed';

        if (!category) return [];

        const suggestions = ACTIVITY_SUGGESTIONS[category] || ACTIVITY_SUGGESTIONS.good;
        const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, limit);
    }

    /**
     * Verifica se mensagem requer resposta de emergência
     * @param {string} text - Texto a verificar
     * @returns {boolean}
     */
    requiresEmergencyResponse(text) {
        const sentiment = this.analyzeSentiment(text);
        return sentiment.level === 'crisis';
    }

    /**
     * Obtém mensagem de boas-vindas para primeiro acesso
     * @returns {{ text: string, isWelcome: boolean }}
     */
    getWelcomeMessage() {
        return {
            text: 'Olá! Como prefere ser chamado?',
            isWelcome: true,
        };
    }

    /**
     * Obtém mensagem após configurar nome
     * @param {string} name - Nome do usuário
     * @returns {{ text: string }}
     */
    getNameSetMessage(name) {
        return {
            text: `Certo, ${name}.

O espaço é seu. Se quiser falar sobre o dia, sobre uma ideia ou apenas divagar, estou ouvindo.
Sem pressão para estar "bem" o tempo todo.

Como você está se sentindo agora?`,
        };
    }

    /**
     * Define insights do usuário para personalização
     * @param {Array} insights - Lista de insights
     */
    setInsights(insights) {
        this.userInsights = insights || [];
    }

    /**
     * Gera resumo da sessão atual para "aprendizado" da IA
     * @param {Array} chatHistory - Histórico de mensagens
     * @returns {Promise<string|null>} Resumo da sessão
     */
    async generateSessionSummary(chatHistory) {
        if (!this.model || !chatHistory || chatHistory.length < 4) {
            return null;
        }

        try {
            const historyText = chatHistory
                .map(m => `${m.isUser ? 'Usuário' : 'IA'}: ${m.text}`)
                .join('\n');

            const prompt = `
Com base no histórico de conversa abaixo, extraia 2 ou 3 pontos CHAVE sobre o estado emocional,
principais preocupações ou fatos importantes da vida do usuário que eu deva lembrar no futuro.
Seja extremamente conciso e direto. Se não houver nada relevante, retorne "Nada relevante".

HISTÓRICO:
${historyText}`;

            const result = await this.model.generateContent(prompt);
            const summary = result.response.text();

            if (summary.toLowerCase().includes('nada relevante')) {
                return null;
            }

            return summary;
        } catch (error) {
            console.error('Erro ao gerar resumo da sessão:', error);
            return null;
        }
    }
}

export const aiService = new AIService();
export default aiService;
