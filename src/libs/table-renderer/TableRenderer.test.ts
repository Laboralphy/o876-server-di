import { TableRenderer } from './index';
import { ICellString } from './ICellString';

describe('new table renderer', function () {
    it('should throw ne error when instantiating', function () {
        expect(() => new TableRenderer()).not.toThrow();
    });
});

describe('getTableColSizes', function () {
    it('should return [11, 7, 19]', function () {
        const tr = new TableRenderer();
        const x = tr.getTableColSizes([
            ['alpha', 'beta', 'gamma'],
            ['-----------', '-------', '-------------------'],
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3],
        ]);
        expect(x).toEqual([11, 7, 19]);
    });
});

describe('render', function () {
    it('should render table', function () {
        const tr = new TableRenderer();
        const data = [
            ['abc', 'def'],
            ['ghi', 'jkl'],
            ['mno', 'pqr'],
            ['stu', 'vwx'],
        ];
        expect(tr.render(data)).toEqual([
            '+-----+-----+',
            '| \u001b[1mabc\u001b[22m | \u001b[1mdef\u001b[22m |',
            '+-----+-----+',
            '| ghi | jkl |',
            '| mno | pqr |',
            '| stu | vwx |',
            '+-----+-----+',
        ]);
    });

    it('should strip color tags', function () {
        const r = /\[[#:0-9a-z]+]/gi;
        expect('[#c00]test'.replace(r, '')).toBe('test');
    });
});

describe('stylized string', function () {
    it('should', function () {
        const C = class implements ICellString {
            private _printableText: string;
            private readonly _outputText: string;

            constructor(private _text: string) {
                this._printableText = _text.replace(/\*\*/g, '');
                this._outputText = _text.replace('**', '<u>').replace('**', '</u>');
            }

            get inputText() {
                return this._text;
            }

            get length() {
                return this._printableText.length;
            }

            get rawLength() {
                return this.length;
            }

            toString() {
                return this._outputText;
            }
        };
        const c = new C('**beta**');
        // const a = [
        //     ['aaaa', 'b', 'cccc'],
        //     ['alpha', c, 'gamma'],
        //     ['aleph', 'beth', 'gimmel'],
        //     ['ax', 'bx', 'gx'],
        // ];
        expect(c.inputText).toBe('**beta**');
        expect(c.length).toBe(4);
        expect(c.toString()).toBe('<u>beta</u>');
        // const tr = new TableRenderer();
        // input        "[super-color-really-nice:with-bold]xxx[#:]"
        // output       "e[4;756m]xxxe[0m"
        // printable    "xxx"
        // input length        42
        // output length       16
        // printable length    3   <-- utilisé pour calculer la taille des cellules
    });

    it('should2', function () {
        const C = class implements ICellString {
            private readonly _text: string;
            private readonly _outputText: string;
            private _printableText: string;
            private readonly _length: number;

            constructor() {
                this._text = '[#f00]2[#:]/tour';
                this._printableText = '2/tour';
                this._outputText = '\x1B[38;5;196m2\x1B[0m/tour';
                this._length = 6;
            }

            get inputText() {
                return this._text;
            }

            get length() {
                return this._length;
            }

            get rawLength() {
                return this.length;
            }

            toString() {
                return this._outputText;
            }
        };
        const c = new C();
        const a = [
            ['Au contact', 'Vous', 'Gobelin'],
            ['Précision', '35%', '50%'],
            ['Dégâts', c, '2.5/tour'],
            ['Perte de PV', '5 (125%)', '8 (100%)'],
        ];

        const tr = new TableRenderer();
        expect(tr.render(a).join('\n').length).toBe(307);
    });
});
