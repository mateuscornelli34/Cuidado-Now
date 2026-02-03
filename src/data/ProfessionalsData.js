/**
 * Banco de dados de profissionais (Mock)
 * Simula uma API de busca de especialistas
 */

export const professionalsData = [
    {
        id: '1',
        name: 'Dr. André Silva',
        title: 'Psicólogo Clínico',
        specialty: 'psicoterapeuta',
        crp: 'CRP 06/12345',
        price: 150,
        rating: 4.9,
        reviews: 124,
        tags: ['TCC', 'Ansiedade', 'Burnout'],
        isVerified: true,
        isOnline: true,
        avatarColor: '#4C9AFF',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
        initials: 'AS',
        bio: 'Especialista em Terapia Cognitivo-Comportamental com foco em transtornos de ansiedade e gestão de estresse profissional.'
    },
    {
        id: '2',
        name: 'Dra. Maria Júlia',
        title: 'Psiquiatra',
        specialty: 'psiquiatra',
        crp: 'CRM 123456',
        price: 350,
        rating: 5.0,
        reviews: 89,
        tags: ['Depressão', 'Bipolaridade', 'Adultos'],
        isVerified: true,
        isOnline: true,
        avatarColor: '#6554C0',
        photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
        initials: 'MJ',
        bio: 'Médica psiquiatra com abordagem humanizada. Tratamento medicamentoso associado a estratégias de estilo de vida.'
    },
    {
        id: '3',
        name: 'Psi. Carolina Melo',
        title: 'Psicóloga Sistêmica',
        specialty: 'psicoterapeuta',
        crp: 'CRP 06/54321',
        price: 180,
        rating: 4.8,
        reviews: 56,
        tags: ['Casal', 'Família', 'Conflitos'],
        isVerified: true,
        isOnline: false,
        avatarColor: '#36B37E',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
        initials: 'CM',
        bio: 'Terapia de casal e família. Ajudo a restaurar a comunicação e fortalecer vínculos.'
    },
    {
        id: '4',
        name: 'Dr. Roberto Campos',
        title: 'Psicanalista',
        specialty: 'psicoterapeuta',
        crp: 'CRP 06/98765',
        price: 200,
        rating: 4.9,
        reviews: 210,
        tags: ['Psicanálise', 'Trauma', 'Autoconhecimento'],
        isVerified: true,
        isOnline: true,
        avatarColor: '#FF991F',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
        initials: 'RC',
        bio: 'Atendimento psicanalítico focado na compreensão profunda dos processos inconscientes.'
    },
    {
        id: '5',
        name: 'Dra. Fernanda Lima',
        title: 'Neuropsicóloga',
        specialty: 'psicoterapeuta',
        crp: 'CRP 06/11223',
        price: 250,
        rating: 5.0,
        reviews: 45,
        tags: ['TDAH', 'Avaliação', 'Autismo'],
        isVerified: true,
        isOnline: true,
        avatarColor: '#DE350B', // Highlight/Attention color
        photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
        initials: 'FL',
        bio: 'Avaliação neuropsicológica e reabilitação cognitiva para TDAH e Autismo em adultos.'
    },
    {
        id: '6',
        name: 'Dr. Paulo Mendes',
        title: 'Psiquiatra Infantil',
        specialty: 'psiquiatra',
        crp: 'CRM 654321',
        price: 400,
        rating: 4.9,
        reviews: 150,
        tags: ['Infância', 'Adolescência', 'Desenvolvimento'],
        isVerified: true,
        isOnline: false,
        avatarColor: '#0052CC',
        photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
        initials: 'PM',
        bio: 'Cuidado especializado para a saúde mental de crianças e adolescentes.'
    }
];

export const getProfessionals = (filter = null) => {
    if (!filter) return professionalsData;
    return professionalsData.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))
    );
};
