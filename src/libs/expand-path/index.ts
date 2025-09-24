import os from 'os';
import path from 'path';

export function expandPath(filePath) {
    return filePath.startsWith('~')
        ? path.join(os.homedir(), filePath.slice(1))
        : path.resolve(filePath);
}
