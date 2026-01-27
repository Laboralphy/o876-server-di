import fs from 'node:fs';
import { JsonObject, JsonValue } from '../domain/types/JsonStruct';
import { getEnv } from '../boot/dotenv';
import path from 'node:path';
import { expandPath } from '../libs/expand-path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

function browseCollectionDocuments(collection: string, f: (document: JsonObject) => JsonObject) {
    const sDataPath = getEnv().SERVER_DB_HOST;
    if (sDataPath === undefined) {
        throw new Error('SERVER_DB_HOST environment variable is undefined');
    }
    const sDataFullPath = expandPath(path.join(sDataPath, collection));
    for (const file of fs.readdirSync(sDataFullPath)) {
        const sFileName = path.join(sDataFullPath, file);
        const document = f(JSON.parse(fs.readFileSync(sFileName).toString()));
        fs.writeFileSync(sFileName, JSON.stringify(document, null, 2));
    }
}

function addCollectionProperty(
    collection: string,
    field: string,
    defaultValue: JsonValue,
    overwrite: boolean = false
) {
    browseCollectionDocuments(collection, (document: JsonObject) => {
        if (overwrite || !(field in document)) {
            document[field] = defaultValue;
        }
        return document;
    });
}

function deleteCollectionProperty(collection: string, field: string) {
    browseCollectionDocuments(collection, (document: JsonObject) => {
        delete document[field];
        return document;
    });
}

interface Argv {
    _: (string | number)[];
    c: string;
    p?: string;
    v?: string;
}

const argv: Argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 <codeCommand> [options]')
    .command('<codeCommand>', 'Spécifiez le nom de la commande')
    .option('c', {
        alias: 'collection',
        describe: 'Nom de la collection',
        type: 'string',
        nargs: 1,
        demandOption: true,
    })
    .option('p', {
        alias: 'property',
        describe: 'Nom de la propriété',
        type: 'string',
        nargs: 1,
    })
    .option('v', {
        alias: 'value',
        describe: 'Valeur par défaut',
        type: 'string',
        nargs: 1,
    })
    .demandCommand(1, 'Vous devez fournir au moins le nom de la commande (add, delete).')
    .help('h')
    .alias('h', 'help')
    .parseSync();

const sCommand = argv._[0];
const collectionName = argv.c;
const propertyName = argv.p;
const defaultValue = argv.v;

if (!collectionName) {
    throw new Error('Missing collection name');
}

function lookLikeObject(x: string): boolean {
    try {
        JSON.parse(x);
        return true;
    } catch {
        return false;
    }
}

switch (sCommand) {
    case 'add': {
        if (!propertyName) {
            throw new Error('Missing property name');
        }
        if (defaultValue === undefined) {
            throw new Error('Missing default value');
        }
        if (defaultValue === 'null') {
            addCollectionProperty(collectionName, propertyName, null);
        } else if (defaultValue === 'true') {
            addCollectionProperty(collectionName, propertyName, true);
        } else if (defaultValue === 'false') {
            addCollectionProperty(collectionName, propertyName, false);
        } else if (new RegExp(/^\d+$/).exec(defaultValue)) {
            addCollectionProperty(collectionName, propertyName, Number.parseInt(defaultValue));
        } else if (new RegExp(/^\d+\.\d+$/).exec(defaultValue)) {
            addCollectionProperty(collectionName, propertyName, Number.parseFloat(defaultValue));
        } else if (lookLikeObject(defaultValue)) {
            addCollectionProperty(collectionName, propertyName, JSON.parse(defaultValue));
        } else {
            addCollectionProperty(collectionName, propertyName, defaultValue);
        }
        break;
    }

    case 'delete': {
        if (!propertyName) {
            throw new Error('Missing property name');
        }
        deleteCollectionProperty(collectionName, propertyName);
        break;
    }

    default: {
        throw new Error('Unknown command');
    }
}
