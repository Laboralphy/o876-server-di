import { AbstractContextService } from './AbstractContextService';
import { ClientCradle } from '../../../boot/container';
import { JsonValue } from '../../../domain/types/JsonStruct';
import { ClientMediaDefault } from '../../../libs/gmcp/schemas/server/ClientMediaDefault';
import { getEnv } from '../../../boot/dotenv';
import { ClientMediaPlay } from '../../../libs/gmcp/schemas/server/ClientMediaPlay';
import { debug } from '../../../libs/o876-debug';

const debugGmcp = debug('srv:gmcp');

export enum MEDIA_TAGS {
    // sounds
    AMBIANCE = 'ambiance',
    // music
    BGM = 'bgm', // background music
    // images
    ENVIRONMENT = 'environment', // Picture or sounds that help describing environment
    INTERACTION = 'interaction', // Event, creature, or item, the player is interacting with.
}

export class GmcpContextService extends AbstractContextService {
    private readonly supportedPackages = new Set<string>();
    private clientProgramName: string = '';
    private clientProgramVersion: string = '';
    private mediaDefaultSent: boolean = false;

    constructor(cradle: ClientCradle) {
        super(cradle);
    }

    async send(opcode: string, data: JsonValue) {
        const { sent } = await this.sendClientMessage.execute(this.idClient, opcode, {
            _gmcp: data,
        });
        return sent;
    }

    async sendMediaFile(
        sType: 'music' | 'sound' | 'image',
        sPath: string,
        tag: MEDIA_TAGS,
        key: string = ''
    ) {
        if (!this.mediaDefaultSent) {
            const sStaticURL = getEnv().SERVER_STATIC_URL;
            if (!sStaticURL) {
                throw new Error(
                    'SERVER_STATIC_URL variable is required - value must point to a valid static endpoint'
                );
            }
            const oURL = new URL(sStaticURL);
            const sHost = oURL.href;
            const sFinalSlash = sHost.endsWith('/') ? '' : '/';
            const payload: ClientMediaDefault = {
                url: sHost + sFinalSlash,
            };
            await this.send('Client.Media.Default', payload);
            this.mediaDefaultSent = true;
        }
        const payload: ClientMediaPlay = {
            name: sPath,
            type: sType,
            tag,
            key: key ?? undefined,
        };
        await this.send('Client.Media.Play', payload);
    }

    setClientProgram(name: string, version: string) {
        this.clientProgramName = name;
        this.clientProgramVersion = version;
    }

    /**
     * Returns info about client program
     */
    getClientProgram(): { name: string; version: string } {
        return {
            name: this.clientProgramName,
            version: this.clientProgramVersion,
        };
    }

    private ignoreAfterFirstWhiteSpace(s: string): string {
        return s.replace(/\s.*/, '');
    }

    /**
     * Adds a supported package.
     * @param packageName package name (ex: 'Comm.Channel' ou 'Comm.Channel.List')
     */
    addSupportedPackage(packageName: string): void {
        this.supportedPackages.add(this.ignoreAfterFirstWhiteSpace(packageName));
        debugGmcp('client %s declares supporting : %s', this.idClient, packageName);
    }

    removeSupportedPackage(packageName: string): void {
        debugGmcp('client %s denies supporting : %s', this.idClient, packageName);
        Array.from(this.supportedPackages.values())
            .filter((s) => s.startsWith(this.ignoreAfterFirstWhiteSpace(packageName)))
            .forEach((s) => this.supportedPackages.delete(s));
    }

    /**
     * Clears all supported packages
     */
    clearSupportedPackages(): void {
        this.supportedPackages.clear();
    }

    /**
     * Checks if a package is supported.
     * @param packageName
     * @returns true if package is supported
     */
    isPackageSupported(packageName: string): boolean {
        packageName = this.ignoreAfterFirstWhiteSpace(packageName);
        if (packageName.startsWith('Core')) {
            return true;
        }
        if (this.supportedPackages.has(packageName)) {
            return true;
        }

        // Checks if a parent is supported
        const parts = packageName.split('.');
        for (let i = parts.length - 1; i > 0; i--) {
            const parentPackage = parts.slice(0, i).join('.');
            if (this.supportedPackages.has(parentPackage)) {
                return true;
            }
        }

        return false;
    }
}
