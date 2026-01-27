import { COMMANDS } from 'telnet2';
import { JsonValue } from '../../domain/types/JsonStruct';
import { GMCPMessage, validateGMCPSchema } from './validateGMCPSchema';

const GMCP = 201;

const GMCP_BEGIN = Uint8Array.from([COMMANDS.IAC, COMMANDS.SB, GMCP]);
const GMCP_END = Uint8Array.from([COMMANDS.IAC, COMMANDS.SE]);

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8');

export type OpcodeBody = { opcode: string; body: JsonValue };

export class GMCPPacket {
    public readonly message: GMCPMessage;

    constructor(m: OpcodeBody) {
        this.message = validateGMCPSchema(m.opcode, m.body);
    }

    static get OPTIONS_GMCP() {
        return GMCP;
    }

    static get ENCODING_UTF8() {
        return 'utf-8';
    }

    static get ENCODING_UTF16() {
        return 'utf-16';
    }

    /**
     * Serializes opcode and body
     * @param ob
     */
    static serializePacket(ob: OpcodeBody) {
        return ob.opcode + ' ' + JSON.stringify(ob.body);
    }

    /**
     * Transform opcode and body into a buffer to be sent to the client
     * @param opcode
     * @param body
     * @param encoding
     */
    renderBuffer({ opcode, body }: OpcodeBody, encoding = GMCPPacket.ENCODING_UTF8) {
        const sSerializedPacket = GMCPPacket.serializePacket({ opcode, body });
        return encoding === GMCPPacket.ENCODING_UTF8
            ? Buffer.from([...GMCP_BEGIN, ...textEncoder.encode(sSerializedPacket), ...GMCP_END])
            : Buffer.concat([
                  Buffer.from(GMCP_BEGIN),
                  Buffer.from(sSerializedPacket),
                  Buffer.from(GMCP_END),
              ]);
    }

    /**
     * transforms this opcode, and this body into a buffer
     * Read to be sent to client
     * @param encoding
     */
    render(encoding = GMCPPacket.ENCODING_UTF8) {
        return this.renderBuffer(this.message, encoding);
    }

    /**
     * Extract the opcode and parse the body part to an object, out of a string
     * @param s
     */
    static extractOpcodeBody(s: string): OpcodeBody {
        const iSpace = s.indexOf(' ');
        if (iSpace < 0) {
            return validateGMCPSchema(s, '');
        }
        const opcode = s.substring(0, iSpace);
        return { opcode, body: JSON.parse(s.substring(iSpace + 1).trim()) };
    }

    /**
     * Parses an incoming client packet into an opcode & body structure
     * @param buffer
     * @param encoding
     */
    static parse(buffer: Buffer, encoding = this.ENCODING_UTF8): GMCPMessage {
        if (buffer.readUint8(0) !== COMMANDS.IAC) {
            return { opcode: '', body: null };
        }
        if (
            buffer.readUint8(1) === COMMANDS.SB &&
            buffer.readUint8(2) === GMCP &&
            buffer.readUint8(buffer.length - 2) === COMMANDS.IAC &&
            buffer.readUint8(buffer.length - 1) === COMMANDS.SE
        ) {
            const oPayload = buffer.subarray(3, -2);
            const s =
                encoding === this.ENCODING_UTF8
                    ? textDecoder.decode(oPayload).trim()
                    : oPayload.toString().trim();
            const { opcode, body } = GMCPPacket.extractOpcodeBody(s);
            return validateGMCPSchema(opcode, body);
        } else {
            return { opcode: '', body: null };
        }
    }
}
