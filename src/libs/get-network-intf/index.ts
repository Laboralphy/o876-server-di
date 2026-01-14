import { networkInterfaces } from 'node:os';

export function getNetworkInterfaces() {
    const nets = networkInterfaces();
    const results = new Map<string, string[]>(); // Or just '{}', an empty object

    for (const [name, netEntry] of Object.entries(nets)) {
        if (netEntry) {
            for (const net of netEntry) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
                const familyV4Value = 'IPv4';
                if (net.family === familyV4Value && !net.internal) {
                    if (results.has(name)) {
                        results.get(name)!.push(net.address);
                    } else {
                        results.set(name, [net.address]);
                    }
                }
            }
        }
    }
    return results;
}
