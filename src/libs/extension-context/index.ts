export type IContextMethod = (...args: any[]) => any;

export interface IExtension {
    publishedMethods(extensionContext: ExtensionContext): Record<string, IContextMethod>;
}

export class ExtensionContext {
    private readonly extensions: Map<string, IExtension> = new Map();

    // Méthode pour ajouter une extension (ex: un composant Plasmud)
    public registerExtension(name: string, extension: IExtension): void {
        this.extensions.set(name, extension);
    }

    // Méthode pour accéder à une extension
    public getExtension(name: string): IExtension | undefined {
        return this.extensions.get(name);
    }

    // Proxy pour accéder dynamiquement aux méthodes des extensions
    public buildContext(): Record<string, IContextMethod> {
        const context: Record<string, IContextMethod> = {};
        this.extensions.forEach((extension) => {
            const aMethods = extension.publishedMethods(this);
            Object.entries(aMethods).forEach(([name, meth]) => {
                context[name] = meth.bind(extension);
            });
        });
        return context;
    }
}
