/**
 * Cuidado-Now AI - Base de Conhecimento
 * Dados para análise de sentimento, respostas e sugestões
 */

// ==================== PALAVRAS-CHAVE DE RISCO ====================
export const RISK_KEYWORDS = {
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

// ==================== PALAVRAS POSITIVAS ====================
export const POSITIVE_WORDS = [
    'bem', 'ótimo', 'otimo', 'bom', 'boa', 'feliz', 'tranquilo', 'tranquila',
    'animado', 'animada', 'contente', 'alegre', 'maravilha', 'excelente',
    'legal', 'bacana', 'melhor', 'grato', 'grata', 'paz', 'calmo', 'calma',
];

// ==================== BASES DE CONHECIMENTO POR ABORDAGEM ====================
export const KNOWLEDGE_BASES = {
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

// ==================== PERGUNTAS CONTEXTUAIS POR HORÁRIO ====================
export const CONTEXTUAL_QUESTIONS = {
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

// ==================== RESPOSTAS EMPÁTICAS ====================
export const EMPATHETIC_RESPONSES = {
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

// ==================== SUGESTÕES DE ATIVIDADES ====================
export const ACTIVITY_SUGGESTIONS = {
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
        { title: 'Observação de Som', description: 'Feche os olhos e foque apenas no som mais distante que conseguir ouvir', icon: 'musical-note', duration: '5 min' },
    ],
};

// ==================== PERGUNTAS DE FOLLOW-UP ====================
export const FOLLOW_UP_QUESTIONS = {
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
    crisis: null,
};

export default {
    RISK_KEYWORDS,
    POSITIVE_WORDS,
    KNOWLEDGE_BASES,
    CONTEXTUAL_QUESTIONS,
    EMPATHETIC_RESPONSES,
    ACTIVITY_SUGGESTIONS,
    FOLLOW_UP_QUESTIONS,
};
