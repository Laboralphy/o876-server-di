import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { Cradle } from '../../../boot/container';
import { BanUserDto } from '../../dto/BanUserDto';
import { ITime } from '../../ports/services/ITime';
import { SendClientMessage } from '../clients/SendClientMessage';
import { DestroyClient } from '../clients/DestroyClient';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';

export class BanUser {
    private readonly userRepository: IUserRepository;
    private readonly sendClientMessage: SendClientMessage;
    private readonly destroyClient: DestroyClient;
    private readonly communicationLayer: ICommunicationLayer;
    private time: ITime;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.time = cradle.time;
        this.sendClientMessage = cradle.sendClientMessage;
        this.destroyClient = cradle.destroyClient;
        this.communicationLayer = cradle.communicationLayer;
    }

    async execute(idUser: string, dto: BanUserDto) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            const nNow = this.time.now();
            const forever = dto.duration == Infinity;
            let bannedBy: string = '';
            if (dto.bannedBy) {
                // checks if dto.bannedBy exists
                const bannedByUser = await this.userRepository.get(dto.bannedBy);
                if (!bannedByUser) {
                    throw new Error(`BannedByUser does not exist: ${dto.bannedBy}`);
                }
                bannedBy = dto.bannedBy;
            } // bannedBy should be either a valid user id or an empty string
            const tsEnd = nNow + dto.duration;
            user.ban = {
                tsBegin: nNow,
                tsEnd: forever ? 0 : tsEnd,
                forever,
                reason: dto.reason,
                bannedBy: bannedBy == '' ? null : bannedBy,
            };
            await this.userRepository.save(user);
            const aClients = this.communicationLayer.getUserClients(user);
            await Promise.all(
                aClients.map(async (client) => {
                    await this.sendClientMessage.execute(client, 'user-banned', {
                        date: forever ? null : this.time.renderDate(tsEnd, 'ymd hm'),
                        reason: dto.reason,
                    });
                    return this.destroyClient.execute(client);
                })
            );
            return user;
        } else {
            throw new Error(`User does not exist: ${idUser}`);
        }
    }
}
