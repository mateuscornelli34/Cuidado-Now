/**
 * MindCare AI - Link Handler Utility
 * Gerencia navegação externa e deep linking
 */

import { Linking, Alert, Platform } from 'react-native';
import firebaseService from '../services/FirebaseService';

const APP_SCHEME = 'mindcare-ai://';

class LinkHandler {
    /**
     * Abre o site oficial do MindCare
     */
    async openWebsite() {
        const url = firebaseService.getHostingUrl();
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Erro', 'Não foi possível abrir o site oficial.');
            }
        } catch (error) {
            console.error('Erro ao abrir website:', error);
        }
    }

    /**
     * Busca profissionais (Psicólogos/Psiquiatras) no Google Maps
     * @param {string} type - 'psicologo' ou 'psiquiatra'
     */
    async searchProfessionals(type) {
        const query = type === 'psiquiatra' ? 'psiquiatra perto de mim' : 'psicologo perto de mim';
        const url = Platform.select({
            ios: `maps://0,0?q=${encodeURIComponent(query)}`,
            android: `geo:0,0?q=${encodeURIComponent(query)}`,
            default: `https://www.google.com/maps/search/${encodeURIComponent(query)}`
        });

        try {
            await Linking.openURL(url);
        } catch (error) {
            // Fallback para web se maps falhar
            const webUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
            await Linking.openURL(webUrl);
        }
    }

    /**
     * Abre links de documentação/suporte
     */
    async openResource(url) {
        try {
            await Linking.openURL(url);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível abrir o recurso.');
        }
    }

    /**
     * Retorna o link de acesso ao app (Deep Link)
     */
    getAppDeepLink() {
        return APP_SCHEME;
    }
}

export const linkHandler = new LinkHandler();
export default linkHandler;
