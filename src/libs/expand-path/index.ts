import os from 'node:os';
import path from 'node:path';

export function expandPath(filePath: string): string {
    return filePath.startsWith('~')
        ? path.join(os.homedir(), filePath.slice(1))
        : path.resolve(filePath);
}
