/**
 * MindCare AI - Serviço de Emergência
 * Gerencia detecção de crise e contatos de emergência
 */

import { Linking, Platform, Alert } from 'react-native';
import userData from '../storage/UserData';

/**
 * Serviço para gerenciamento de emergências
 */
class EmergencyService {
    /**
     * Faz uma ligação telefônica
     */
    async makeCall(phoneNumber) {
        try {
            // Remove caracteres não numéricos
            const cleanNumber = phoneNumber.replace(/\D/g, '');
            const url = Platform.OS === 'ios'
                ? `telprompt:${cleanNumber}`
                : `tel:${cleanNumber}`;

            const canOpen = await Linking.canOpenURL(url);

            if (canOpen) {
                await Linking.openURL(url);
                return { success: true };
            } else {
                return {
                    success: false,
                    error: 'Não foi possível abrir o discador. Verifique as permissões do app.'
                };
            }
        } catch (error) {
            console.error('Erro ao fazer ligação:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Liga para o CVV (Centro de Valorização da Vida)
     */
    async callCVV() {
        return await this.makeCall('188');
    }

    /**
     * Liga para o SAMU
     */
    async callSAMU() {
        return await this.makeCall('192');
    }

    /**
     * Liga para contato de emergência pessoal
     */
    async callEmergencyContact(contactId) {
        const contacts = await userData.getEmergencyContacts();
        const contact = contacts.find(c => c.id === contactId);

        if (!contact) {
            return { success: false, error: 'Contato não encontrado' };
        }

        return await this.makeCall(contact.phone);
    }

    /**
     * Obtém todos os contatos de emergência
     */
    async getEmergencyContacts() {
        return await userData.getEmergencyContacts();
    }

    /**
     * Adiciona contato pessoal de emergência
     */
    async addPersonalContact(name, phone, relationship = '') {
        if (!name || !phone) {
            return { success: false, error: 'Nome e telefone são obrigatórios' };
        }

        return await userData.addEmergencyContact({
            name: name.trim(),
            phone: phone.trim(),
            relationship: relationship.trim(),
            description: relationship ? `${relationship}` : 'Contato pessoal',
            icon: 'person',
            color: '#4A90A4',
        });
    }

    /**
     * Remove contato pessoal
     */
    async removePersonalContact(contactId) {
        return await userData.removeEmergencyContact(contactId);
    }

    /**
     * Mostra alerta de emergência com opções
     */
    showEmergencyAlert(onCallCVV, onCallSAMU, onShowContacts) {
        Alert.alert(
            '🆘 Ajuda Disponível',
            'Você não está sozinho(a). Existem pessoas que podem te ajudar agora.',
            [
                {
                    text: 'CVV (188)',
                    onPress: onCallCVV,
                    style: 'default',
                },
                {
                    text: 'SAMU (192)',
                    onPress: onCallSAMU,
                    style: 'default',
                },
                {
                    text: 'Ver Contatos',
                    onPress: onShowContacts,
                    style: 'default',
                },
                {
                    text: 'Continuar Conversa',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    }

    /**
     * Mensagem de suporte durante crise
     */
    getCrisisMessage() {
        return {
            primary: 'Você está passando por um momento difícil, mas não está sozinho(a).',
            secondary: 'Existem pessoas treinadas prontas para te ouvir e ajudar agora mesmo.',
            action: 'Toque em um dos contatos abaixo para falar com alguém.',
        };
    }

    /**
     * Recursos de ajuda disponíveis
     */
    getHelpResources() {
        return [
            {
                id: 'cvv',
                name: 'CVV - Centro de Valorização da Vida',
                phone: '188',
                description: 'Apoio emocional e prevenção do suicídio. Atendimento 24 horas, gratuito.',
                website: 'https://www.cvv.org.br',
                color: '#E74C3C',
                icon: 'heart',
            },
            {
                id: 'samu',
                name: 'SAMU',
                phone: '192',
                description: 'Serviço de Atendimento Móvel de Urgência. Para emergências médicas.',
                color: '#3498DB',
                icon: 'medkit',
            },
            {
                id: 'caps',
                name: 'CAPS - Centro de Atenção Psicossocial',
                description: 'Serviço público de saúde mental. Procure a unidade mais próxima.',
                website: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/c/caps',
                color: '#27AE60',
                icon: 'home',
            },
        ];
    }
}

export const emergencyService = new EmergencyService();
export default emergencyService;
