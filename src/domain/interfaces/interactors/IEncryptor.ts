export interface IEncryptor {
    encryptSHA256(password: string): string;
}
