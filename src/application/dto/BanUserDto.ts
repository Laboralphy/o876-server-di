import z from 'zod';
import { EntityId } from '../../domain/schemas/EntityId';

export const BanUserDtoSchema = z.object({
    bannedBy: EntityId.nullable(),
    duration: z.number(),
    reason: z.string(),
});

export type BanUserDto = z.infer<typeof BanUserDtoSchema>;
