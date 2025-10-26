/**
 * @typedef {Object} JsonObject
 * @property {*} [key] - Objet JSON générique (clé/valeur)
 */

/**
 * @typedef {Object} IClientContextService
 * @property {Function} [method] - Méthodes spécifiques au service (à adapter selon ton interface réelle)
 */

/**
 * @typedef {Object} IClientContext
 * @property {Function} getClientId - Retourne l'identifiant du client
 * @property {Function} sendMessage - Envoie un message au client
 * @property {Function} closeConnection - Ferme la connexion du client au serveur
 * @property {Function} getService - Récupère un service par son nom
 *
 * @property {function(): string} getClientId - returns the client id
 * @property {function(string, JsonObject=): Promise<void>} sendMessage - Sends a message to client
 *   @param {string} key - message content, or a i18n string reference, or hbs template
 *   @param {JsonObject} [parameters] - a plain object used to replace variables in i18n string or hbs template
 * @property {function(): void} closeConnection - Close client connection to server
 * @property {function(string): IClientContextService} getService - Récupère un service par son nom
 */
