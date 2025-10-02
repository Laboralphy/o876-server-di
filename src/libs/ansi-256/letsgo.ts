import { color, ANSI_RESET, ANSI_RESET_BG, ANSI_ITALIC, ANSI_ITALIC_OFF } from './renderer';
import { parse } from './parser';

function test1() {
    console.log('normal');
    console.log(color('#800'), 'red');
    console.log(color('#080'), 'green');
    console.log(color('#00a', '#004'), 'blue/navy');
    console.log(
        color('#00a', '#004'),
        'blue/navy',
        color('', '#999'),
        'check',
        ANSI_RESET_BG,
        'check'
    );
    console.log(
        color('#00a', '#004'),
        'blue/navy',
        color('', '#999'),
        'check',
        ANSI_RESET,
        'check'
    );
}

function test2() {
    // Exemple d'utilisation
    const text = '\x1b[31mCeci est en rouge\x1b[0m et ceci est normal.';
    const tokens = parse(text);
    console.log(tokens);
}

function test3() {
    // Exemple d'utilisation
    const text =
        color('#f8b') +
        'Bonjour' +
        color('#24c') +
        ' et salut ' +
        ANSI_ITALIC +
        ' en italique ' +
        ANSI_ITALIC_OFF +
        color('#985', '#F22') +
        'c koi comme couleur?' +
        ANSI_RESET;
    const tokens = parse(text);
    console.log(text);
    console.log(tokens);
}

test3();
