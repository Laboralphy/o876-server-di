export async function askPassword(sPrompt: string): Promise<string> {
    return new Promise((resolve) => {
        const stdout = process.stdout;
        const stdin = process.stdin;
        stdout.write(sPrompt + ': ');
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        let input = '';
        const pn = (data: string) => {
            const c = data;
            switch (c) {
                case '\u0004': // Ctrl-d
                case '\r':
                case '\n': {
                    return enter();
                }
                case '\u0003': {
                    // Ctrl-c
                    return ctrlc();
                }
                case '\u007f':
                case '\b': {
                    if (input.length > 0) {
                        stdout.write('\b \b');
                        return backspace();
                    }
                    break;
                }
                default: {
                    if (c.charCodeAt(0) >= 32) {
                        stdout.write('*');
                        return newchar(c);
                    }
                }
            }
        };
        stdin.on('data', pn);
        function enter() {
            stdin.removeListener('data', pn);
            stdin.setRawMode(false);
            stdin.pause();
            resolve(input);
            console.log('');
        }
        function ctrlc() {
            stdin.removeListener('data', pn);
            stdin.setRawMode(false);
            stdin.pause();
        }
        function newchar(c: string) {
            input += c;
        }
        function backspace() {
            input = input.slice(0, input.length - 1);
        }
    });
}
