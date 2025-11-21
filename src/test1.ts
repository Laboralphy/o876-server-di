import { TableRenderer } from './libs/table-renderer';
import stringWidth from 'string-width';
import { StylizedString } from './infrastructure/services/HbsTemplateRepository';
import { ANSI_RESET, fgcolor } from './libs/ansi-256/renderer';

const tr = new TableRenderer();
const s2 = tr.render([
    ['Utilisateur', 'Ses Rôles'],
    [fgcolor('#2f2') + 'Ralphy' + ANSI_RESET, '⚖️⚙️🎲'],
    ['Bob', ''],
    ['Modo', '⚖️'],
    ['Modo2', '1 2'],
]);
const s = tr.render([
    ['Utilisateur', 'Ses Rôles'],
    [fgcolor('#2f2') + 'Ralphy' + ANSI_RESET, '*****'],
    ['Bob', ''],
    ['Modo', '*'],
    ['Modo2', '1 2'],
]);

console.log(s.join('\n'));
console.log(stringWidth('⚖️'));
const s1 = new StylizedString('⚖️');
console.log(s1.length);
const x = new StylizedString('⚖️⚙️🎲');
console.log(x.length);
