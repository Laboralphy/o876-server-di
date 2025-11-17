import z from 'zod';
import { EntityId } from '../../domain/schemas/EntityId';
import { String1k } from '../../domain/schemas/String1k';

export const BanUserDtoSchema = z.object({
    bannedBy: EntityId.nullable(),
    duration: z.number(),
    reason: String1k,
});

export type BanUserDto = z.infer<typeof BanUserDtoSchema>;
