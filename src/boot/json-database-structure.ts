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
                tsCreation: {
                    type: INDEX_TYPES.NUMERIC,
                    precision: 24 * 3600 * 1000, // one day
                },
            },
        },
        {
            name: 'mail-inboxes',
            storage: 'disk',
            indexes: {
                messageId: {
                    type: INDEX_TYPES.PARTIAL,
                    size: 0,
                    caseInsensitive: true,
                },
                tag: {
                    type: INDEX_TYPES.NUMERIC,
                    precision: 1,
                },
                userId: {
                    type: INDEX_TYPES.PARTIAL,
                    size: 0,
                    caseInsensitive: true,
                },
                tsReceived: {
                    type: INDEX_TYPES.NUMERIC,
                    precision: 24 * 3600 * 1000, // one day
                },
                deleted: {
                    type: INDEX_TYPES.BOOLEAN,
                },
                kept: {
                    type: INDEX_TYPES.BOOLEAN,
                },
                read: {
                    type: INDEX_TYPES.BOOLEAN,
                },
            },
        },
    ],
};
