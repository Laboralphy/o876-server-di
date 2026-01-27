import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { Cradle } from '../../../boot/container';
import { BanUserDto } from '../../dto/BanUserDto';
import { ITime } from '../../ports/services/ITime';
import { SendClientMessage } from '../clients/SendClientMessage';
import { DestroyClient } from '../clients/DestroyClient';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';
import { User } from '../../../domain/entities/User';

export class BanUser {
    private readonly userRepository: IUserRepository;
    private readonly sendClientMessage: SendClientMessage;
    private readonly destroyClient: DestroyClient;
    private readonly communicationLayer: ICommunicationLayer;
    private readonly time: ITime;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.time = cradle.time;
        this.sendClientMessage = cradle.sendClientMessage;
        this.destroyClient = cradle.destroyClient;
        this.communicationLayer = cradle.communicationLayer;
    }

    /**
     * Retrieves the user who banned another user based on the provided data transfer object (DTO).
     *
     * @param {BanUserDto} dto - The data transfer object containing information about the ban, including the identifier of the user who performed the ban.
     * @return {Promise<User | undefined>} A promise that resolves to the user who performed the ban, or undefined if the bannedBy property does not exist on the provided DTO.
     * @throws {Error} If the specified banning user cannot be found in the repository.
     */
    async getBannedByUser(dto: BanUserDto): Promise<User | undefined> {
        if (!dto.bannedBy) {
            return undefined;
        }
        // checks if dto.bannedBy exists
        const bannedByUser = await this.userRepository.get(dto.bannedBy);
        if (!bannedByUser) {
            throw new Error(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` BannedBy user : ${dto.bannedBy}`);
        }
        return bannedByUser;
    }

    async execute(idUser: string, dto: BanUserDto) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            const nNow = this.time.now();
            const forever = dto.duration == Infinity;

            const oBannedByUser = await this.getBannedByUser(dto);
            const tsEnd = nNow + dto.duration;
            user.ban = {
                tsBegin: nNow,
                tsEnd: forever ? 0 : tsEnd,
                forever,
                reason: dto.reason,
                bannedBy: oBannedByUser ? oBannedByUser.id : null,
            };
            await this.userRepository.save(user);
            const client = this.communicationLayer.getUserClient(user);
            if (client) {
                client.user = user;
                await this.sendClientMessage.execute(client.id, 'user-banned', {
                    date: forever ? null : tsEnd,
                    reason: dto.reason,
                });
                this.destroyClient.execute(client.id);
            }
            return user;
        } else {
            throw new Error(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` User : ${idUser}`);
        }
    }
}
