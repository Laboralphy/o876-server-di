import { CommChannelText, CommChannelTextSchema } from './schemas/server/CommChannelText';
import { CommChannelList, CommChannelListSchema } from './schemas/server/CommChannelList';
import { CoreGoodBye, CoreGoodByeSchema } from './schemas/server/CoreGoodBye';
import { CoreHello, CoreHelloSchema } from './schemas/client/CoreHello';
import { CoreKeepAlive, CoreKeepAliveSchema } from './schemas/client/CoreKeepAlive';
import { CorePing, CorePingSchema } from './schemas/client/CorePing';
import { CoreSupportsSet, CoreSupportsSetSchema } from './schemas/client/CoreSupportsSet';
import { CoreSupportsAdd, CoreSupportsAddSchema } from './schemas/client/CoreSupportsAdd';
import { CoreSupportsRemove, CoreSupportsRemoveSchema } from './schemas/client/CoreSupportsRemove';
import { JsonValue } from '../../domain/types/JsonStruct';

export type GMCPMessage =
    | { opcode: ''; body: null }
    | { opcode: 'Comm.Channel.List'; body: CommChannelList }
    | { opcode: 'Comm.Channel.Text'; body: CommChannelText }
    | { opcode: 'Core.GoodBye'; body: CoreGoodBye }
    | { opcode: 'Core.Supports.Set'; body: CoreSupportsSet }
    | { opcode: 'Core.Supports.Remove'; body: CoreSupportsRemove }
    | { opcode: 'Core.Supports.Add'; body: CoreSupportsAdd }
    | { opcode: 'Core.Hello'; body: CoreHello }
    | { opcode: 'Core.KeepAlive'; body: CoreKeepAlive }
    | { opcode: 'Core.Ping'; body: CorePing };

export function validateGMCPSchema(opcode: string, body: JsonValue): GMCPMessage {
    switch (opcode) {
        case 'Comm.Channel.Text': {
            return { opcode, body: CommChannelTextSchema.parse(body) };
        }

        case 'Comm.Channel.List': {
            return { opcode, body: CommChannelListSchema.parse(body) };
        }

        case 'Core.GoodBye': {
            return { opcode, body: CoreGoodByeSchema.parse(body) };
        }

        case 'Core.Hello': {
            return { opcode, body: CoreHelloSchema.parse(body) };
        }

        case 'Core.KeepAlive': {
            return { opcode, body: CoreKeepAliveSchema.parse(body) };
        }

        case 'Core.Ping': {
            return { opcode, body: CorePingSchema.parse(body) };
        }

        case 'Core.Supports.Set': {
            return { opcode, body: CoreSupportsSetSchema.parse(body) };
        }

        case 'Core.Supports.Add': {
            return { opcode, body: CoreSupportsAddSchema.parse(body) };
        }

        case 'Core.Supports.Remove': {
            return { opcode, body: CoreSupportsRemoveSchema.parse(body) };
        }

        default: {
            throw new TypeError(`Unsupported GMCP type ${opcode}`);
        }
    }
}
