/**
 * This class will produce GMCPPackets by specifying opcode and body.
 *
 * To avoid dependency hell, this class is purely functional
 * Use-cases must send the Buffer to the communication layer manually
 *
 */
import { JsonValue } from '../../domain/types/JsonStruct';
import { GMCPPacket } from '../../libs/gmcp/GMCPPacket';
import { IGMCPGateway } from '../../application/ports/services/IGMCPGateway';

export class GMCPGateway implements IGMCPGateway {
    /**
     * This method takes opcode + body and turn them to a valid Buffer
     * ready to be sent to client via communication layer
     * @param opcode
     * @param body
     */
    buildGMCPData(opcode: string, body: JsonValue): Buffer<ArrayBuffer> {
        const p = new GMCPPacket({ opcode, body });
        return p.render();
    }
}
