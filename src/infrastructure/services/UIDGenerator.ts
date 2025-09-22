import { IUIDGenerator } from '../../application/interfaces/interactors/IUIDGenerator';
import crypto from 'node:crypto';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const ALPHABET_LENGTH = ALPHABET.length;
const MS_IN_HOUR = 1000 * 3600;
const VARIABLE_SIZE = 10;

export class UIDGenerator implements IUIDGenerator {
    getUID(): string {
        // max value = 1679615
        // max date : 2161-08-10
        const timestamp = Math.floor(Date.now() / MS_IN_HOUR)
            .toString(36)
            .padStart(4, '0'); // Ex: "01y7" → "01y7" (always 4 chars)
        let randomPart = '';
        const buffer = new Uint32Array(VARIABLE_SIZE);
        crypto.getRandomValues(buffer);
        for (let i = 0; i < 10; i++) {
            randomPart += ALPHABET[buffer[i] % ALPHABET_LENGTH];
        }

        return timestamp + randomPart; // Ex: "01y7x3b9kp1q2r" (14 chars)
    }
}
