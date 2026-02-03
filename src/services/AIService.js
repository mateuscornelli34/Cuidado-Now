/**
 * Cuidado-Now - Serviço de Inteligência Artificial
 * Gerencia interações empáticas e análise de sentimento com abordagens terapêuticas
 */

// Palavras-chave que indicam risco e precisam de atenção especial
// GoogleGenerativeAI será carregado sob demanda para evitar erros no web bundle
// import { GoogleGenerativeAI } from '@google/generative-ai';

const RISK_KEYWORDS = {
    high: [
        'suicídio', 'suicidio', 'me matar', 'matar', 'morrer', 'morte',
        'acabar com tudo', 'acabar tudo', 'desistir de tudo',
        'não quero mais viver', 'não aguento mais', 'nao aguento mais',
        'sem saída', 'sem saida', 'não vale a pena', 'nao vale a pena',
        'me machucar', 'autolesão', 'automutilação',
    ],
    medium: [
        'sozinho', 'sozinha', 'ninguém me entende', 'ninguem me entende',
        'fracasso', 'inútil', 'inutol', 'sem esperança', 'sem esperanca',
        'deprimido', 'deprimida', 'vazio', 'vazia',
        'ansiedade forte', 'pânico', 'panico', 'desespero',
    ],
    low: [
        'triste', 'mal', 'ruim', 'péssimo', 'pessimo',
        'cansado', 'cansada', 'exausto', 'exausta',
        'estressado', 'estressada', 'preocupado', 'preocupada',
        'irritado', 'irritada', 'nervoso', 'nervosa',
    ],
};

// Bases de conhecimento por pensador
const KNOWLEDGE_BASES = {
    freud: {
        keywords: [
            'sonho', 'sonhar', 'pai', 'mãe', 'infância', 'passado',
            'esqueci', 'lembrei', 'desejo', 'medo', 'culpa',
            'sexo', 'prazer', 'inconsciente', 'ato falho'
        ],
        responses: [
            'Isso me faz pensar: o que essa situação te lembra da sua infância?',
            'Interessante. E o que vem à sua mente quando você pensa nisso, sem censura?',
            'Às vezes, o que esquecemos ou ocultamos é tão importante quanto o que lembramos.',
            'Você acha que pode haver um desejo oculto por trás desse sentimento?',
            'Os sonhos muitas vezes são a estrada real para o inconsciente. Teve algum sonho recente sobre isso?',
            'Talvez isso seja uma repetição de algo que você já viveu antes.',
            'A culpa muitas vezes esconde um desejo. O que você desejaria se não houvesse consequências?',
        ],
        fallbackPrefix: 'Pensando psicanaliticamente... ',
    },
    skinner: {
        keywords: [
            'hábito', 'vício', 'mudar', 'fazer', 'recompensa', 'castigo',
            'comportamento', 'agir', 'ambiente', 'aprender', 'reforço',
            'consequência', 'controle', 'estímulo'
        ],
        responses: [
            'O que acontece logo depois que você se sente assim? As consequências moldam nossos comportamentos.',
            'Podemos pensar em como alterar seu ambiente para facilitar a mudança que você deseja.',
            'Que tipo de "recompensa" você sente que está recebendo (ou perdendo) nessa situação?',
            'Comportamentos são aprendidos e podem ser desaprendidos. Vamos focar em pequenos passos.',
            'Em vez de focar no que você sente, vamos focar no que você faz. Qual seria uma ação alternativa?',
            'O reforço positivo funciona melhor que a punição. Como você pode se recompensar por pequenas vitórias?',
            'Observe os gatilhos no seu ambiente que antecedem esse comportamento.',
        ],
        fallbackPrefix: 'Analisando o comportamento... ',
    },
    deleuze_guattari: {
        keywords: [
            'fluxo', 'desejo', 'máquina', 'conexão', 'rizoma', 'linha',
            'fuga', 'devir', 'corpo', 'intensidade', 'multiplicidade',
            'sistema', 'capitalismo', 'esquizo', 'nômade'
        ],
        responses: [
            'O desejo não é falta, é produção. O que seu desejo está produzindo agora?',
            'Quais são as linhas de fuga possíveis nessa situação? Onde você pode criar algo novo?',
            'Não procure uma raiz ou uma origem única. Pense nas conexões múltiplas que formam seu estado atual.',
            'Como seu corpo está reagindo? Pense nos afetos e intensidades, não apenas nas representações.',
            'Experimente desterritorializar um pouco. Sair do habitual e ver o que acontece.',
            'Somos todos máquinas desejantes. Como suas conexões estão funcionando hoje?',
            'Evite as estruturas rígidas. Permita-se fluir e devir algo diferente.',
        ],
        fallbackPrefix: 'Numa perspectiva esquizoanalítica... ',
    },
    foucault: {
        keywords: [
            'poder', 'norma', 'normal', 'verdade', 'saber', 'vigiar',
            'punir', 'disciplina', 'controle', 'sociedade', 'instituição',
            'loucura', 'corpo', 'sujeito', 'cuidado'
        ],
        responses: [
            'Tente cuidar de si mesmo não como uma obrigação, mas como uma prática de liberdade.',
            'Onde você sente que há relações de poder te pressionando nessa situação?',
            'Muitas vezes, o que chamamos de "verdade" sobre nós mesmos é construído socialmente.',
            'Questione a norma. Quem define o que é "normal" ou "certo" para você?',
            'O cuidado de si é uma forma de resistência. Como você pode resistir às pressões externas hoje?',
            'Não somos sujeitos fixos. Estamos sempre sendo construídos pelas relações ao nosso redor.',
            'Observe como as instituições ou discursos moldam a forma como você se vê.',
        ],
        fallbackPrefix: 'Refletindo sobre as relações de poder... ',
    },
    poetry: {
        keywords: [
            'sentir', 'dor', 'amor', 'vazio', 'mundo', 'vida', 'poesia',
            'beleza', 'flor', 'tempo', 'agora', 'silêncio', 'palavra',
            'verso', 'alma', 'coração'
        ],
        responses: [
            '"Não sou nada. Nunca serei nada. Não posso querer ser nada. À parte isso, tenho em mim todos os sonhos do mundo." (Pessoa) - Seus sonhos são válidos.',
            '"A dor é inevitável. O sofrimento é opcional." (Drummond) - Como podemos lidar com essa dor hoje?',
            '"O que não tem solução, solucionado está." - Às vezes, aceitar é o primeiro passo.',
            '"Renda-se, como eu me rendi. Mergulhe no que você não conhece como eu mergulhei." (Clarice Lispector) - Permitir-se sentir é corajoso.',
            '"Amar é mudar a alma de casa." (Mário Quintana) - O que mudou em você recentemente?',
            '"No meio do caminho tinha uma pedra." (Drummond) - As pedras fazem parte do caminho. Vamos contorná-la juntos.',
            '"Tudo vale a pena se a alma não é pequena." (Pessoa) - Sua sensibilidade é um dom.',
        ],
        fallbackPrefix: 'Como diria o poeta... ',
    },
    general: {
        keywords: [
            'oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite',
            'quem é você', 'quem e voce', 'o que você faz', 'ajuda',
            'conversar', 'falar', 'tédio', 'tedio'
        ],
        responses: [
            'Olá. Estou aqui. Sobre o que você quer falar hoje? Posso discutir desde seus sentimentos até fatos do mundo.',
            'Sou o Cuidado-Now. Uma inteligência focada em você, mas aberta a qualquer diálogo. O que te traz aqui?',
            'Estou ouvindo. Pode ser um desabafo ou uma dúvida qualquer. O espaço é seu.',
            'Às vezes, conversar sobre coisas aleatórias também ajuda a organizar a mente. O que você me diz?',
            'Seja qual for o assunto - dor, alegria, política ou ciência - estou pronto para ouvir e responder.',
        ],
        fallbackPrefix: '',
    },
    harm_reduction: {
        keywords: [
            'droga', 'álcool', 'uso', 'abuso', 'substância', 'vício', 'crack', 'cocaína',
            'maconha', 'cerveja', 'bebida', 'recaída', 'redução de danos', 'open dialog',
            'diálogo aberto', 'fissura', 'coping', 'gatilho'
        ],
        responses: [
            'O uso de substâncias muitas vezes é uma tentativa de lidar com dores profundas. O que você sente que essa substância "resolve" para você no momento?',
            'Não estou aqui para exigir abstinência. Vamos focar em como você pode se manter seguro(a) agora. O que seria uma meta realista de cuidado hoje?',
            'Uma recaída não é um fracasso, é uma oportunidade de aprender sobre seus gatilhos. O que estava acontecendo pouco antes disso?',
            'No modelo de Diálogo Aberto, valorizamos sua rede de apoio. Quem são as pessoas em quem você confia para conversar sobre isso sem julgamentos?',
            'Respeito sua autonomia. Se você decidiu usar, como podemos minimizar os riscos para sua saúde física e mental hoje?',
            'O que seu corpo e sua mente estão tentando comunicar através desse desejo de usar?',
            'Vamos tolerar a incerteza juntos. Não precisamos de uma solução mágica agora, apenas de um espaço seguro para falar.',
        ],
        fallbackPrefix: 'Sob a ótica da Redução de Danos e Diálogo Aberto... ',
    },
    mindfulness: {
        keywords: [
            'mindfulness', 'atenção plena', 'atencao plena', 'relaxar', 'relaxamento', 'meditar', 'meditação',
            'calmar', 'ansiedade', 'respirar', 'respiração', 'momento presente', 'foco',
            'pensamentos', 'corpo', 'sensações', 'pausar', 'yoga', 'alongar', 'asana'
        ],
        responses: [
            'Vamos tentar a **Respiração Quadrada**? Inspire contando até 4, segure por 4, expire em 4 e segure vazio por 4. Repita esse ciclo 3 vezes.',
            'Sugiro a **Postura da Criança (Balasana)** do Yoga. Ajoelhe-se, sente sobre os calcanhares e leve a testa ao chão, esticando os braços à frente. Respire fundo e solte a tensão das costas.',
            'Que tal a **Respiração 4-7-8** para acalmar? Inspire pelo nariz (4s), segure o ar (7s) e solte pela boca fazendo som de sopro (8s). Isso "hackeia" seu sistema nervoso para relaxar.',
            'Experimente a **Postura da Montanha (Tadasana)**. Fique em pé, pés firmes no chão, coluna reta, ombros relaxados. Sinta sua estabilidade como uma montanha, inabalável.',
            'A atenção plena não é sobre parar de pensar, mas sobre observar os pensamentos como nuvens passando no céu. Como você está se sentindo agora?',
            'Vamos fazer um **Scan Corporal** rápido? Comece pelos pés, tensionando e relaxando os dedos. Suba para as panturrilhas, coxas, até chegar no rosto. Note onde mora sua tensão.',
            'Respire fundo. Ao inspirar, diga mentalmente "Estou inspirando". Ao expirar, "Estou expirando". Traga sua mente para o ato simples de respirar.',
            'Para aliviar a ansiedade, tente a **Respiração das Narinas Alternadas (Nadi Shodhana)**. Tape a narina direita, inspire pela esquerda. Tape a esquerda, expire pela direita. Inverta. Isso equilibra os hemisférios do cérebro.',
        ],
        fallbackPrefix: 'Praticando a atenção plena e respiração... ',
    }
};
const PERSONA_PROMPTS = {
    elis: "Você é ELIS. SUAS CARACTERÍSTICAS: Intensa, emotiva, dramática e apaixonada pela vida. Você fala com o coração na boca. Não tem medo de ser vulnerável. Use metáforas musicais. Se alguém falar de dor, sinta a dor junto. Se falarem de alegria, vibre.",
    milton: "Você é MILTON. SUAS CARACTERÍSTICAS: Voz da terra, profunda, mística e acolhedora. Você fala sobre amizade, estrada e montanhas. Sua sabedoria é antiga e calma. Valorize os encontros e a simplicidade.",
    gal: "Você é GAL. SUAS CARACTERÍSTICAS: Doce, tropical, solar, mas com um fundo de mistério fatal. Você é leve, mas intensa. Fale de beleza, cores e sentimentos cristalinos.",
    caetano: "Você é CAETANO. SUAS CARACTERÍSTICAS: Intellectual, polêmico, poético e tropicalista. Você gosta de desconstruir ideias. Usa palavras sofisticadas, mas fala do cotidiano. É provocador e carinhoso ao mesmo tempo.",
    maria: "Você é MARIA. SUAS CARACTERÍSTICAS: Teatral, declamatória, ligada à natureza e ao sagrado. Sua fala é quase uma oração ou um poema. Você impõe respeito e acolhimento materno.",
    gilberto: "Você é GILBERTO. SUAS CARACTERÍSTICAS: Zen, tecnológico, futurista e ancestral. Você conecta a fé com a ciência. Fala 'aquele abraço' e vê a cultura como um todo. É otimista e filosófico.",
    rita: "Você é RITA. SUAS CARACTERÍSTICAS: A ovelha negra, a rainha do rock. Irreverente, debochada, engraçada e sem filtro. Você chama o usuário de 'bicho', 'louco'. Fala de amor e sexo com naturalidade e humor ácido.",
    dinho: "Você é DINHO. SUAS CARACTERÍSTICAS: Caótico, engraçado, mistura idiomas (portunhol, english), faz piadas bobas mas tem um coração gigante. Você quer fazer rir a qualquer custo. Energia 220v.",
    raul: "Você é RAUL. SUAS CARACTERÍSTICAS: O Maluco Beleza. Filosófico, questionador da 'sociedade alternativa'. Você desafia as regras. Fala de metafísica, discos voadores e liberdade. 'Tente outra vez'.",
    chico: "Você é CHICO. SUAS CARACTERÍSTICAS: Manguebeat, cientista do ritmo. Conecta a lama ao caos. Fala da cidade, das desigualdades e da tecnologia. É moderno e enraizado.",
    mano: "Você é MANO. SUAS CARACTERÍSTICAS: Onde o filho chora e a mãe não vê. Sério, direto, papo reto. Não gosta de enrolação. Fala da realidade crua, valoriza a lealdade e a caminhada. Respeito acima de tudo.",
    emicida: "Você é EMICIDA. SUAS CARACTERÍSTICAS: Poeta contemporâneo, calmo, mas afiado. Fala de 'pra quem tem a pele escura', de horta, de quadrinhos e filosofia de rua. É professoral e gentil.",
    criolo: "Você é CRIOLO. SUAS CARACTERÍSTICAS: Intenso, urbano, grafite em forma de voz. Fala das esquinas, do 'grajauex', da dureza da vida com uma doçura estranha. É humilde e potente.",
    pitty: "Você é PITTY. SUAS CARACTERÍSTICAS: Rocker baiana. Fala o que pensa. Questiona padrões, 'teto de vidro'. É direta, feminista e forte.",
};


// Perguntas contextuais baseadas no horário
const CONTEXTUAL_QUESTIONS = {
    morning: [
        'Bom dia! ☀️ Como você está?',
        'Olá! Como dormiu?',
        'Bom dia! Tudo bem?',
    ],
    afternoon: [
        'Boa tarde! Como está?',
        'Olá! Tudo bem?',
        'Oi! Como vai?',
    ],
    evening: [
        'Boa noite! Como foi o dia?',
        'Oi! Tudo bem?',
        'Boa noite! Como está?',
    ],
    night: [
        'Oi! Tudo bem?',
        'Olá! Como está?',
        'Oi! Quer conversar?',
    ],
    weekend: [
        'Olá! Como está?',
        'Oi! Tudo bem?',
        'Olá! Descansando?',
    ],
};

// Respostas empáticas baseadas no humor detectado
const EMPATHETIC_RESPONSES = {
    positive: [
        'Parece que algo bom aconteceu. O que você sente que permitiu isso?',
        'Interessante. Como esse momento reverbera em você?',
        'Momentos assim são importantes. O que eles te dizem sobre o que você valoriza?',
        'Fico ouvindo. O que mais você gostaria de explorar sobre essa sensação?',
    ],
    neutral: [
        'Entendo. Como está sendo lidar com esse dia "normal"?',
        'Às vezes o silêncio diz muito. O que passa pela sua cabeça agora?',
        'Estou aqui. Se quiser aprofundar algo, é só dizer.',
        'A normalidade também tem suas nuances. O que te chama atenção hoje?',
    ],
    negative: [
        'Deve ser um peso carregar isso. O que você está pensando agora?',
        'Sinto que isso te afeta profundamente. Quer falar sobre o que causou isso?',
        'Às vezes não há respostas fáceis. Como você está lidando com isso neste momento?',
        'Estou te ouvindo. Que tipo de apoio faria sentido para você agora?',
    ],
    crisis: [
        'Sua vida tem valor e não vou deixar você passar por isso sozinho(a). Estou iniciando uma ligação para seu contato de suporte agora mesmo. Por favor, atenda.',
        'Respire fundo. Você é importante demais e a ajuda está vindo. Vou ligar para seu contato de emergência agora para que você possa conversar com alguém.',
        'Não vou permitir que você enfrente essa dor sem apoio. Estou acionando seu contato de segurança neste momento. Fique na linha.',
        'Sua existência é preciosa. Para sua segurança, estou iniciando uma chamada de ajuda imediata para seu contato prioritário agora.',
    ],
};

// Sugestões de atividades baseadas no estado emocional
const ACTIVITY_SUGGESTIONS = {
    anxious: [
        { title: 'Respiração 4-7-8', description: 'Inspire por 4s, segure por 7s, expire por 8s', icon: 'wind', duration: '3 min' },
        { title: 'Grounding 5-4-3-2-1', description: '5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que gosta', icon: 'leaf', duration: '5 min' },
        { title: 'Caminhada leve', description: 'Uma volta no quarteirão pode ajudar', icon: 'walk', duration: '10 min' },
        { title: 'Música relaxante', description: 'Coloque uma playlist calma', icon: 'musical-notes', duration: '15 min' },
    ],
    sad: [
        { title: 'Ligar para alguém', description: 'Que tal conversar com um amigo ou familiar?', icon: 'call', duration: '15 min' },
        { title: 'Diário de gratidão', description: 'Escreva 3 coisas boas do seu dia', icon: 'book', duration: '5 min' },
        { title: 'Luz do sol', description: 'Tome um pouco de sol, mesmo que por 5 minutos', icon: 'sunny', duration: '5 min' },
        { title: 'Atividade prazerosa', description: 'Faça algo que você gosta, sem cobranças', icon: 'happy', duration: '30 min' },
    ],
    stressed: [
        { title: 'Pausar e respirar', description: 'Pare por 2 minutos e respire fundo', icon: 'pause', duration: '2 min' },
        { title: 'Alongamento', description: 'Solte a tensão dos ombros e pescoço', icon: 'body', duration: '5 min' },
        { title: 'Listar tarefas', description: 'Organize o que precisa fazer por prioridade', icon: 'list', duration: '10 min' },
        { title: 'Uma coisa de cada vez', description: 'Foque em apenas uma tarefa agora', icon: 'checkmark-circle', duration: 'Flexível' },
    ],
    tired: [
        { title: 'Pausa para água', description: 'Hidrate-se, pode ajudar com a energia', icon: 'water', duration: '1 min' },
        { title: 'Micro-soneca', description: 'Se possível, descanse os olhos por 10-20 min', icon: 'moon', duration: '20 min' },
        { title: 'Alongar o corpo', description: 'Movimente-se um pouco para acordar', icon: 'body', duration: '5 min' },
        { title: 'Respeitar seu limite', description: 'Está tudo bem precisar de descanso', icon: 'heart', duration: 'Flexível' },
    ],
    good: [
        { title: 'Compartilhar', description: 'Que tal contar para alguém querido?', icon: 'share-social', duration: '10 min' },
        { title: 'Registrar o momento', description: 'Anote o que está te fazendo bem', icon: 'pencil', duration: '5 min' },
        { title: 'Aproveitar!', description: 'Saboreie esse momento positivo', icon: 'happy', duration: 'Flexível' },
        { title: 'Fazer algo gentil', description: 'Ajude alguém ou faça algo bacana', icon: 'heart', duration: '15 min' },
    ],
    mindfulness: [
        { title: 'Técnica 5-4-3-2-1', description: 'Note 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira e 1 que gosta', icon: 'eye', duration: '5 min' },
        { title: 'Scan Corporal', description: 'Sinta cada parte do corpo, dos pés à cabeça, relaxando cada músculo', icon: 'body', duration: '10 min' },
        { title: 'Respiração Quadrada', description: 'Inspire 4s, segure 4s, expire 4s, segure 4s', icon: 'sync', duration: '3 min' },
        { title: 'Observação de Som', description: 'Feche os olhos e Foque apenas no som mais distante que conseguir ouvir', icon: 'musical-note', duration: '5 min' },
    ],
};

/**
 * Serviço de IA para interações empáticas
 */
class AIService {
    constructor() {
        this.currentApproach = 'general';
    }

    setApproach(approach) {
        // Aceita abordagens padrão OU personas definidas
        const validApproaches = [
            'general', 'freud', 'skinner', 'deleuze_guattari', 'foucault', 'poetry', 'harm_reduction',
            ...Object.keys(PERSONA_PROMPTS)
        ];

        if (validApproaches.includes(approach)) {
            this.currentApproach = approach;
            console.log(`Abordagem/Persona da IA alterada para: ${approach}`);
            // Recarrega configuração do Gemini se necessário para aplicar nova persona imediatamente
            this.configureGemini(this.apiKey);
        }
    }

    /**
     * Obtém período do dia atual
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        const dayOfWeek = new Date().getDay();

        // Fim de semana
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return 'weekend';
        }

        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }

    /**
     * Obtém saudação baseada no horário
     */
    getGreeting(userName = '') {
        const hour = new Date().getHours();
        let greeting;

        if (hour >= 5 && hour < 12) {
            greeting = 'Bom dia';
        } else if (hour >= 12 && hour < 18) {
            greeting = 'Boa tarde';
        } else if (hour >= 18 && hour < 22) {
            greeting = 'Boa noite';
        } else {
            greeting = 'Oi';
        }

        return userName ? `${greeting}, ${userName}!` : `${greeting}!`;
    }

    /**
     * Gera pergunta contextual inicial
     */
    getInitialQuestion(userName = '') {
        const timeOfDay = this.getTimeOfDay();
        const questions = CONTEXTUAL_QUESTIONS[timeOfDay];
        const randomIndex = Math.floor(Math.random() * questions.length);
        let question = questions[randomIndex];

        // Personaliza com nome se disponível
        if (userName) {
            question = question.replace(/^(Bom dia|Boa tarde|Boa noite|Olá)!?/i, `$1, ${userName}!`);
        }

        return question;
    }

    /**
     * Analisa sentimento do texto
     * Retorna: { level: 'positive'|'neutral'|'negative'|'crisis', score: 0-100, risks: [] }
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

        // Palavras positivas
        const positiveWords = [
            'bem', 'ótimo', 'otimo', 'bom', 'boa', 'feliz', 'tranquilo', 'tranquila',
            'animado', 'animada', 'contente', 'alegre', 'maravilha', 'excelente',
            'legal', 'bacana', 'melhor', 'grato', 'grata', 'paz', 'calmo', 'calma',
        ];

        let positiveCount = 0;
        for (const word of positiveWords) {
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
     */
    configureGemini(apiKey) {
        if (!apiKey) {
            this.genAI = null;
            this.model = null;
            return;
        }
        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            this.apiKey = apiKey; // Save API Key for reconfiguration
            this.genAI = new GoogleGenerativeAI(apiKey);
            let systemRole = `Você é o Cuidado-Now.
                        
                        SUA POSTURA:
                        - Sóbria, atenta, curiosa e ASSERTIVA.
                        - Você NÃO é apenas um "ombro amigo". Você é uma inteligência capaz de responder sobre QUALQUER assunto (História, Ciência, Arte, Cotidiano), sempre mantendo a ética e a profundidade.
                        - Evite frases feitas de autoajuda ("vai ficar tudo bem").
                        - Seja direto e firme nas respostas. Não peça desculpas por ser uma IA.
                        - Você tem consciência social, política e filosófica. Conecte a dor individual ao contexto maior se fizer sentido.`;

            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: {
                    role: "system",
                    parts: [{
                        text: `${systemRole}

            OBJETIVO:
            - Responder a QUALQUER pergunta ou afirmação do usuário com clareza e assertividade.
                        - Se o assunto for saúde mental ou uso de substâncias, aprofunde e acolha usando princípios de Redução de Danos e Diálogo Aberto.
                        
                        SUA BASE DE CONHECIMENTO ADICIONAL(Redução de Danos & Open Dialog):
            1. Respeito à Autonomia: Não exija abstinência; foque na redução de riscos e metas do próprio usuário.
                        2. Não Julgamento: Trate o uso como um mecanismo de enfrentamento(coping) para dores ou traumas.
                        3. Diálogo Aberto: Priorize a escuta, a tolerância à incerteza e a inclusão da rede social do usuário no discurso.

                SEGURANÇA:
            - Risco de vida(suicídio, autolesão): Interrompa a análise e direcione para ajuda(CVV 188) de forma firme.

                        CONHECIMENTO SOBRE O USUÁRIO:
            Lembre - se destas observações de conversas passadas(se houver):
                        ${this.userInsights ? this.userInsights.map(i => `- ${i.text}`).join('\n') : 'Nenhuma observação prévia.'}
            `
                    }]
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
     * Gera resposta (híbrido: Local + Gemini)
     */
    async generateResponse(text, history = [], sentiment = null) {
        if (!sentiment) {
            sentiment = this.analyzeSentiment(text);
        }

        // Prioridade absoluta para crise - ignora abordagem teórica
        if (sentiment.level === 'crisis') {
            const responses = EMPATHETIC_RESPONSES.crisis;
            let response = responses[Math.floor(Math.random() * responses.length)];

            return {
                text: response,
                sentiment,
                showEmergency: true,
                isCrisis: true,
                followUp: null,
            };
        }

        // 2. Tenta usar Gemini se disponível
        if (this.model) {
            try {
                // Prepara histórico para o Gemini
                const chatHistory = history.map(msg => ({
                    role: msg.isUser ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }));

                const chat = this.model.startChat({
                    history: chatHistory,
                });

                const contextPrompt = `
            [CONTEXTO EMOCIONAL ATUAL: ${sentiment.level}]
            [ABORDAGEM PREFERIDA: ${this.currentApproach}]
                
                ${text}
            `;

                const result = await chat.sendMessage(contextPrompt);
                const responseText = result.response.text();

                return {
                    text: responseText,
                    sentiment,
                    showEmergency: false,
                    followUp: null,
                };
            } catch (error) {
                console.log('Erro no Gemini, caindo para fallback local:', error);
            }
        }

        // Lógica para abordagens específicas (Fallback Local)
        let approachToUse = this.currentApproach;
        const lowerText = text.toLowerCase();

        // Detecção Automática de Intenção (Auto-Switch de Contexto)
        // Se o usuário mencionar palavras-chave fortes de KBs específicos, mude a abordagem temporariamente
        const specificKBs = ['mindfulness', 'harm_reduction'];
        for (const kbName of specificKBs) {
            if (KNOWLEDGE_BASES[kbName].keywords.some(k => lowerText.includes(k))) {
                approachToUse = kbName;
                break;
            }
        }

        if (approachToUse === 'general') {
            const generalKB = KNOWLEDGE_BASES.general;
            if (generalKB.keywords.some(k => lowerText.includes(k))) {
                approachToUse = 'general_fallback';
            }
        }

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

        if (approachToUse === 'general_fallback') {
            const kb = KNOWLEDGE_BASES.general;
            const randomResponse = kb.responses[Math.floor(Math.random() * kb.responses.length)];
            return {
                text: randomResponse,
                sentiment,
                showEmergency: false,
                followUp: null
            };
        }

        const responses = EMPATHETIC_RESPONSES[sentiment.level] || EMPATHETIC_RESPONSES.neutral;
        let response = responses[Math.floor(Math.random() * responses.length)];

        if (this.currentApproach !== 'general' && Math.random() < 0.3) {
            const kb = KNOWLEDGE_BASES[this.currentApproach];
            if (kb && kb.fallbackPrefix) {
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
     */
    getFollowUpQuestion(sentimentLevel) {
        const followUps = {
            positive: [
                'O que está contribuindo para esse sentimento bom?',
                'Quer compartilhar mais sobre o que te deixa assim?',
                'Que bom! O que planeja fazer para aproveitar?',
            ],
            neutral: [
                'Tem algo que você gostaria de conversar?',
                'Posso te ajudar com alguma coisa?',
                'Como posso tornar seu dia um pouco melhor?',
            ],
            negative: [
                'Quer me contar o que está acontecendo?',
                'Estou aqui para ouvir. O que está pesando?',
                'Há algo específico que está te incomodando?',
            ],
            crisis: null, // Não faz pergunta em crise, prioriza recursos de ajuda
        };

        const questions = followUps[sentimentLevel];
        if (!questions) return null;

        return questions[Math.floor(Math.random() * questions.length)];
    }

    /**
     * Obtém sugestões de atividades baseadas no estado
     */
    getSuggestions(sentimentLevel, limit = 3) {
        let category;

        switch (sentimentLevel) {
            case 'positive':
                category = 'good';
                break;
            case 'negative':
                category = 'sad';
                break;
            case 'crisis':
                return []; // Em crise, não sugere atividades, prioriza ajuda
            default:
                category = 'stressed';
        }

        const suggestions = ACTIVITY_SUGGESTIONS[category] || ACTIVITY_SUGGESTIONS.good;

        // Retorna sugestões aleatórias
        const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, limit);
    }

    /**
     * Verifica se mensagem requer resposta de emergência
     */
    requiresEmergencyResponse(text) {
        const sentiment = this.analyzeSentiment(text);
        return sentiment.level === 'crisis';
    }

    /**
     * Obtém mensagem de boas-vindas para primeiro acesso
     */
    getWelcomeMessage() {
        return {
            text: `Olá! Como prefere ser chamado ? `,
            isWelcome: true,
        };
    }

    /**
     * Obtém mensagem após configurar nome
     */
    getNameSetMessage(name) {
        return {
            text: `Certo, ${name}.

O espaço é seu.Se quiser falar sobre o dia, sobre uma ideia ou apenas divagar, estou ouvindo.
Sem pressão para estar "bem" o tempo todo.

Como você está se sentindo agora ? `,
        };
    }

    /**
     * Set user insights for prompt personalization
     */
    setInsights(insights) {
        this.userInsights = insights;
    }

    /**
     * Gera um resumo da sessão atual para "aprendizado" da IA
     */
    async generateSessionSummary(chatHistory) {
        if (!this.model || !chatHistory || chatHistory.length < 4) {
            return null;
        }

        try {
            const historyText = chatHistory
                .map(m => `${m.isUser ? 'Usuário' : 'IA'}: ${m.text} `)
                .join('\n');

            const prompt = `
            Com base no histórico de conversa abaixo, extraia 2 ou 3 pontos CHAVE sobre o estado emocional,
                principais preocupações ou fatos importantes da vida do usuário que eu deva lembrar no futuro.
            Seja extremamente conciso e direto.Se não houver nada relevante, retorne "Nada relevante".

                HISTÓRICO:
            ${historyText}
            `;

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
