import { GMCPPacket } from '../src/libs/gmcp/GMCPPacket';

describe('GMCPPacket', () => {
    it('should build an hello packet', () => {
        const p = new GMCPPacket({
            opcode: 'Core.Hello',
            body: { client: 'Mudlet', version: '1.0' },
        });
        expect(p.message.opcode).toBe('Core.Hello');
        expect(p.message.body).toMatchObject({ client: 'Mudlet', version: '1.0' });
    });
});

describe('GMCPPacket.extractOpcodeBody', () => {
    it('should extract Core.Hello and { client, version } when specifying "Core.Hello { client: mudlet, version: 1.0 }', () => {
        const { opcode, body } = GMCPPacket.extractOpcodeBody(
            'Core.Hello { "client": "mudlet", "version": "1.0" }'
        );
        expect(opcode).toBe('Core.Hello');
        expect(body).toEqual({ client: 'mudlet', version: '1.0' });
    });
});
