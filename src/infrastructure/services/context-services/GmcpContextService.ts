import { AbstractContextService } from './AbstractContextService';
import { ClientCradle } from '../../../boot/container';
import { JsonValue } from '../../../domain/types/JsonStruct';

export class GmcpContextService extends AbstractContextService {
    private readonly supportedPackages = new Set<string>();
    private clientProgramName: string = '';
    private clientProgramVersion: string = '';

    constructor(cradle: ClientCradle) {
        super(cradle);
    }

    async send(opcode: string, data: JsonValue) {
        const { sent } = await this.sendClientMessage.execute(this.idClient, opcode, {
            _gmcp: data,
        });
        return sent;
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
    }

    removeSupportedPackage(packageName: string): void {
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
