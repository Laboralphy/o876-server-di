export interface SubProcessController<T> {
    reset(): void;
    processInput(message: string): Promise<void>;
    get done(): boolean;
    get data(): T;
}
