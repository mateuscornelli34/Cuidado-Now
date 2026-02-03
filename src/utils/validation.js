/**
 * Cuidado-Now AI - Validation Utilities
 * Funções de validação para inputs do usuário
 */

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - Se o email é válido
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Valida formato de telefone brasileiro
 * @param {string} phone - Telefone a validar
 * @returns {boolean} - Se o telefone é válido
 */
export function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    // Aceita formatos: 188, 192, DDD+número (10-11 dígitos)
    return cleanPhone.length >= 3 && cleanPhone.length <= 11;
}

/**
 * Valida API key do Gemini
 * @param {string} key - API key a validar
 * @returns {boolean} - Se a key parece válida
 */
export function validateApiKey(key) {
    if (!key || typeof key !== 'string') return false;
    // API keys do Google geralmente começam com "AI" e têm 39 caracteres
    return key.trim().length >= 30;
}

/**
 * Valida texto de mensagem
 * @param {string} text - Texto a validar
 * @param {number} maxLength - Comprimento máximo permitido
 * @returns {{ valid: boolean, error?: string }} - Resultado da validação
 */
export function validateMessage(text, maxLength = 500) {
    if (!text || typeof text !== 'string') {
        return { valid: false, error: 'Mensagem vazia' };
    }

    const trimmed = text.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: 'Mensagem vazia' };
    }

    if (trimmed.length > maxLength) {
        return { valid: false, error: `Mensagem muito longa (máximo ${maxLength} caracteres)` };
    }

    return { valid: true };
}

/**
 * Valida nome do usuário
 * @param {string} name - Nome a validar
 * @returns {{ valid: boolean, error?: string }} - Resultado da validação
 */
export function validateName(name) {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: 'Nome vazio' };
    }

    const trimmed = name.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: 'Nome vazio' };
    }

    if (trimmed.length < 2) {
        return { valid: false, error: 'Nome muito curto' };
    }

    if (trimmed.length > 50) {
        return { valid: false, error: 'Nome muito longo' };
    }

    return { valid: true };
}

/**
 * Sanitiza texto removendo caracteres perigosos
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export function sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/[<>]/g, '') // Remove tags HTML básicas
        .trim();
}

export default {
    validateEmail,
    validatePhone,
    validateApiKey,
    validateMessage,
    validateName,
    sanitizeText,
};
