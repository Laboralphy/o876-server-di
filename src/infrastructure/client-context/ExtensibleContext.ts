type ExtensionMethod = (...args: any[]) => any;

type FunctionRegistry = Record<string, ExtensionMethod>;

export class ExtensibleContext {
    private extensions: Map<string, FunctionRegistry> = new Map();

    // Méthode pour ajouter une extension (ex: un composant Plasmud)
    public registerExtension(name: string, methods: FunctionRegistry): void {
        this.extensions.set(name, methods);
    }

    // Méthode pour accéder à une extension
    public getExtension(name: string): FunctionRegistry | undefined {
        return this.extensions.get(name);
    }

    // Proxy pour accéder dynamiquement aux méthodes des extensions
    public buildContext(): Record<string, ExtensionMethod> {
        const context: Record<string, ExtensionMethod> = {};
        this.extensions.forEach((methods) => {
            Object.entries(methods).forEach(([key, value]) => {
                context[key] = value.bind(this);
            });
        });
        return context;
    }
}
