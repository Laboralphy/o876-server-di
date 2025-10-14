import { ClientSession } from '../../domain/types/ClientSession';

type ExtensionMethod = (...args: never[]) => never;

type FunctionRegistry = Record<string, ExtensionMethod>;

export class ClientContext {
    private data: ClientSession;
    private extensions: Map<string, FunctionRegistry> = new Map();

    constructor(data: ClientSession) {
        this.data = data;
    }

    // Méthode pour ajouter une extension (ex: un composant Plasmud)
    public registerExtension(name: string, methods: FunctionRegistry): void {
        this.extensions.set(name, methods);
    }

    // Méthode pour accéder à une extension
    public getExtension(name: string): FunctionRegistry | undefined {
        return this.extensions.get(name);
    }

    // Proxy pour accéder dynamiquement aux méthodes des extensions
    public getContext(): Record<string, any> {
        const context: Record<string, any> = { ...this.data };
        this.extensions.forEach((methods) => {
            Object.entries(methods).forEach(([key, value]) => {
                context[key] = value.bind(this);
            });
        });
        return context;
    }
}
