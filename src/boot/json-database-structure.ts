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
            storage: 'disk',
            indexes: {},
        },
    ],
};
