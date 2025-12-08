import { INDEX_TYPES, IndexCreationOptions } from 'o876-json-db';

export type CollectionStructure = {
    name: string;
    storage: 'disk' | 'memory';
    indexes: Record<string, IndexCreationOptions>;
};

export type JsonDatabaseStructure = {
    collections: CollectionStructure[];
};

export const jsonDatabaseStructure: JsonDatabaseStructure = {
    collections: [
        {
            name: 'users',
            storage: 'disk',
            indexes: {
                name: {
                    type: INDEX_TYPES.HASH,
                    caseInsensitive: false,
                },
                displayName: {
                    type: INDEX_TYPES.HASH,
                    caseInsensitive: true,
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
            storage: 'disk',
            indexes: {},
        },
        {
            name: 'mail-messages',
            storage: 'disk',
            indexes: {
                senderId: {
                    type: INDEX_TYPES.PARTIAL,
                    size: 0,
                    caseInsensitive: true,
                },
                recipientId: {
                    type: INDEX_TYPES.PARTIAL,
                    size: 0,
                    caseInsensitive: true,
                },
                tsSent: {
                    type: INDEX_TYPES.NUMERIC,
                    precision: 24 * 3600 * 1000, // one day
                },
            },
        },
    ],
};
