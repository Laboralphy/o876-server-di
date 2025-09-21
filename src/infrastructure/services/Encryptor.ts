import { IEncryptor } from '../../domain/interfaces/interactors/IEncryptor';
import * as crypto from 'node:crypto';

export class Encryptor implements IEncryptor {
    encryptSHA256(password: string): string {
        return crypto.createHash('sha256').update(password).digest('hex');
    }
}
