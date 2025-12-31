import { Cradle } from '../../../boot/container';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';
import { JsonValue } from '../../../domain/types/JsonStruct';
import { IGMCPGateway } from '../../ports/services/IGMCPGateway';

/**
 * This use case is used to send a GMCP data packet to a specific client
 */
export class SendClientGMCPData {
    private readonly communicationLayer: ICommunicationLayer;
    private readonly gmcpGateway: IGMCPGateway;

    constructor(cradle: Cradle) {
        this.communicationLayer = cradle.communicationLayer;
        this.gmcpGateway = cradle.gmcpGateway;
    }
    async execute(idClient: string, opcode: string, body: JsonValue) {
        const data = this.gmcpGateway.buildGMCPData(opcode, body);
        await this.communicationLayer.sendMessage(idClient, data);
    }
}
