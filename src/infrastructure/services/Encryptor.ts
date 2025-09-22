import { IEncryptor } from '../../application/interfaces/interactors/IEncryptor';
import * as crypto from 'node:crypto';

export class Encryptor implements IEncryptor {
    encryptPassword(password: string): string {
        return crypto.createHash('sha256').update(password).digest('hex');
    }
}
