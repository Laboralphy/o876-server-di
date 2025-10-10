export interface ICommand {
    execute(idUser: string, parameters: string[]): Promise<void>;
}
