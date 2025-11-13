import { INDEX_TYPES, IndexCreationOptions } from 'o876-json-db';

export const JsonDatabaseConfig: {
    collections: { name: string; indexes: Record<string, IndexCreationOptions> }[];
} = {
    collections: [
        {
            name: 'users',
            indexes: {
                name: {
                    type: INDEX_TYPES.HASH,
                    caseInsensitive: true,
                },
                displayName: {
                    type: INDEX_TYPES.HASH,
                    caseInsensitive: false,
                    nullable: true,
                },
                ban: {
                    type: INDEX_TYPES.TRUTHY,
                    nullable: true,
                },
            },
        },
        {
            name: 'user-secrets',
            indexes: {},
        },
    ],
};
