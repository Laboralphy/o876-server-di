import { THEMES } from './themes';
import { ITheme } from './ITheme';
import { ICellString } from './ICellString';

type Displayable = number | boolean | string | ICellString;

type ValueIndex = { value: number; index: number };

export enum Themes {
    compact = 'compact',
    default = 'default',
    filetDouble = 'filetDouble',
    filetThin = 'filetThin',
    filetThick = 'filetThick',
    filetThinRounded = 'filetThinRounded',
    filetThinner = 'filetThinner',
}

export class TableRenderer {
    private _maxWidth = 80;
    private _padding = {
        char: ' ',
        value: 1,
    };
    private _theme = 'default';

    set theme(id: string) {
        if (id in THEMES) {
            this._theme = id;
        } else {
            throw new Error(`Unknown table theme : ${id}`);
        }
    }

    get theme() {
        return this._theme;
    }

    get decorators(): ITheme {
        if (this._theme in THEMES) {
            return THEMES[this._theme];
        } else {
            throw new Error(`Unknown table theme : ${this._theme}`);
        }
    }

    set maxWidth(value) {
        this._maxWidth = value;
    }

    get maxWidth() {
        return this._maxWidth;
    }

    get paddingString() {
        return this._padding.char.repeat(this._padding.value);
    }

    get THEMES() {
        return {
            FILET_THINNER: 'FILET_THINNER',
            FILET_DOUBLE: 'FILET_DOUBLE',
            FILET_THIN: 'FILET_THIN',
            FILET_THICK: 'FILET_THICK',
            FILET_THIN_ROUNDED: 'FILET_THIN_ROUNDED',
            DEFAULT: 'DEFAULT',
        };
    }

    getStringLength(sString: Displayable): number {
        if (typeof sString === 'string') {
            return sString.length;
        } else if (typeof sString == 'number') {
            return sString.toString().length;
        }
        if (typeof sString === 'object' && 'length' in sString) {
            const n = sString.length;
            if (typeof n === 'number') {
                return n;
            } else {
                throw new TypeError('Object.length is not a number');
            }
        } else {
            throw new TypeError('Parameters should be displayable type only');
        }
    }

    getMaxLength(aStrings: Displayable[]) {
        return aStrings.reduce(
            (prev: number, curr) => Math.max(prev, this.getStringLength(curr)),
            0
        );
    }

    ellipsis(sString: Displayable, nLength: number) {
        const slen = this.getStringLength(sString);
        if (slen > nLength) {
            return sString.toString().substring(0, nLength - 1) + '…';
        }
        return sString;
    }

    /**
     * Toutes les lignes auront le même nombre d'éléments, les éléments undefined sont forcé à la valeur ''
     * Tous les éléments sont castés en strings.
     */
    normalizeTable(aTable: Displayable[][]) {
        if (aTable.length === 0) {
            return [];
        }
        const t = [];
        const nFieldCount = aTable[0].length;
        for (let i = 0, l = aTable.length; i < l; ++i) {
            const r = [];
            const row = aTable[i];
            for (let x = 0; x < nFieldCount; ++x) {
                const rs = row[x] === undefined ? '' : row[x];
                r.push(rs);
            }
            t.push(r);
        }
        return t;
    }

    getTableColSizes(aTable: Displayable[][]) {
        const aSizes = [];
        for (let x = 0, lx = aTable[0].length; x < lx; ++x) {
            const col = [];
            for (let y = 0, ly = aTable.length; y < ly; ++y) {
                col.push(aTable[y][x]);
            }
            aSizes[x] = this.getMaxLength(col);
        }
        return aSizes;
    }

    padCenter(sString: Displayable, nLength: number, sChar = ' ') {
        sString = sString.toString();
        let slen = this.getStringLength(sString);
        if (slen === undefined) {
            throw new Error('This is not a string : ' + JSON.stringify(sString));
        }
        if (nLength < slen) {
            sString = sString.toString().substring(0, nLength - 1) + '…';
            slen = nLength;
        }
        const nDiff = nLength - slen;
        const nDiffLeft = nDiff >>> 1;
        const nDiffRight = nDiff - nDiffLeft;
        return sChar.repeat(nDiffLeft) + sString + sChar.repeat(nDiffRight);
    }

    renderHeader(aRow: Displayable[], aSizes: number[]) {
        const p = this._padding.char;
        return aSizes.map((s, i) => this.bold(this.padCenter(aRow[i], s, p)));
    }

    renderRow(aRow: Displayable[], aSizes: number[]) {
        const p = this._padding;
        return aSizes.map((s, i) => {
            const c = aRow[i];
            if (typeof c === 'number') {
                return this.ellipsis(c.toString(), s).toString().padStart(s, p.char);
            }
            if (typeof c === 'boolean') {
                return this.padCenter(c ? '✓' : '', s, p.char);
            }
            if (typeof c === 'string') {
                return this.ellipsis(c, s).toString().padEnd(s, p.char);
            }
            return c.toString() + p.char.repeat(s - c.length);
        });
    }

    renderHorizontalBorder(
        aSizes: number[],
        sLeft: string,
        sInner: string,
        sMiddle: string,
        sRight: string
    ) {
        const s = [];
        const d = this.decorators;
        const db = d.BORDERS;
        const pv = this._padding.value;
        if (db.left) {
            s.push(sLeft);
        }
        s.push(...aSizes.map((nSize) => sInner.repeat(nSize + pv + pv)).join(sMiddle));
        if (db.right) {
            s.push(sRight);
        }
        return s.join('');
    }

    renderTopBorder(aSizes: number[]) {
        const d = this.decorators;
        const ds = d.SEPARATORS;
        return this.renderHorizontalBorder(
            aSizes,
            ds.outer.nw,
            ds.outer.horizontal,
            ds.outer.n,
            ds.outer.ne
        );
    }

    renderBottomBorder(aSizes: number[]) {
        const d = this.decorators;
        const ds = d.SEPARATORS;
        return this.renderHorizontalBorder(
            aSizes,
            ds.outer.sw,
            ds.outer.horizontal,
            ds.outer.s,
            ds.outer.se
        );
    }

    renderInnerBorder(aSizes: number[]) {
        const d = this.decorators;
        const ds = d.SEPARATORS;
        return this.renderHorizontalBorder(
            aSizes,
            ds.outer.w,
            ds.inner.horizontal,
            ds.inner.intersection,
            ds.outer.e
        );
    }

    encaseSeparators(a: string[]) {
        const output = [];
        output.push(...a.map((s) => this.paddingString + s + this.paddingString));
        const sLeft = this.decorators.BORDERS.left ? this.decorators.SEPARATORS.outer.vertical : '';
        const sRight = this.decorators.BORDERS.right
            ? this.decorators.SEPARATORS.outer.vertical
            : '';
        return (
            sLeft +
            output.join(
                this.decorators.BORDERS.cols ? this.decorators.SEPARATORS.inner.vertical : ''
            ) +
            sRight
        );
    }

    fit(aSizes: number[], nMax: number) {
        let nDepass = this.renderTopBorder(aSizes).length - nMax;
        const sortByValue = (a: ValueIndex, b: ValueIndex) => b.value - a.value;
        const aSizeRegistry = aSizes
            .map((s, i): ValueIndex => ({ value: s, index: i }))
            .sort(sortByValue);
        while (nDepass > 0) {
            --aSizeRegistry[0].value;
            --nDepass;
            aSizeRegistry.sort(sortByValue);
        }
        aSizeRegistry.forEach(({ value, index }) => {
            aSizes[index] = value;
        });
        return aSizes;
    }

    bold(s: string) {
        const ESC = String.fromCharCode(27);
        return ESC + '[1m' + s + ESC + '[22m';
    }

    render(aTable: Displayable[][]) {
        // taille de chaque colonne
        const output = [];
        aTable = this.normalizeTable(aTable);
        const aSizes = this.fit(this.getTableColSizes(aTable), this._maxWidth);
        if (this.decorators.BORDERS.top) {
            output.push(this.renderTopBorder(aSizes));
        }
        output.push(this.encaseSeparators(this.renderHeader(aTable[0], aSizes)));
        if (this.decorators.BORDERS.inner) {
            output.push(this.renderInnerBorder(aSizes));
        }
        aTable.forEach((row, i) => {
            if (i > 0) {
                output.push(this.encaseSeparators(this.renderRow(row, aSizes)));
            }
        });
        if (this.decorators.BORDERS.bottom) {
            output.push(this.renderBottomBorder(aSizes));
        }
        return output;
    }
}
