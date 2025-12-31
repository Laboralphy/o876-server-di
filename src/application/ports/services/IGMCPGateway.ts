import { JsonValue } from '../../../domain/types/JsonStruct';

export interface IGMCPGateway {
    buildGMCPData(opcode: string, body: JsonValue): Buffer<ArrayBuffer>;
}
