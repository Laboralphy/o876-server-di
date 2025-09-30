# How to create a new entity

## Description

An entity is a ZodSchema.

## Location

Entities are located at `src/domain/entities`

## Form

Entities look like this template :

```typescript
import z from 'zod';
import { Roles } from '../enums';
import { EntityId } from '../types';
import { BanSchema } from './Ban';

export const UserSchema = z.object({
    id: EntityId, // user id
    name: z.string(), // user name
    password: z.string(), // password
    email: z.email(), // contact email
    dateCreation: z.coerce.date(), // date creation
    dateLastUsed: z.coerce.date(), // date last used
    roles: z.array(z.enum(Roles)), // a list of roles
    ban: BanSchema.nullable(), // Another Zod Schema, but optional
});

export type User = z.infer<typeof UserSchema>;
```

- Create an interface in src/application/ports/repositories
- This interface should extend IRepository<EntityType>
- Create an implementation in src/infrastructure/persistance/<database>/
- Add repository to container