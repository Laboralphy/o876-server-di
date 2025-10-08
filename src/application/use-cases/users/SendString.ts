import { Cradle } from '../../../config/container';
import { IStringRepository } from '../../ports/services/IStringRepository';
import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';

/**
 * This use case is used to send a single i18n string to a specific user
 */
export class SendString {
    private readonly stringRepository: IStringRepository;
    private readonly userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.stringRepository = cradle.stringRepository;
    }
    async execute (idUser, i18nKey: string, parameters: Record<string, string | number>) {
        const

}
}
