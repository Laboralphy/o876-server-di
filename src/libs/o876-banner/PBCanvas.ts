import BRAILLE from './braille_8_points.json';

export class PBCanvas {
    #width: number = 8;
    #height: number = 8;
    #lfb: Uint8Array = new Uint8Array(8);
    #charWidth: number = 4;
    #charHeight: number = 2;
    #byteWidth: number = 1;
    #brailleIndex: Map<number, string> = new Map();

    constructor() {
        this.#brailleIndex = this.buildBrailleIndex();
    }

    get lfb() {
        return this.#lfb;
    }

    buildBrailleIndex(): Map<number, string> {
        const brailleIndex = new Map<number, string>();
        const b = new Map<number, number>([
            [1, 0],
            [2, 2],
            [3, 4],
            [4, 1],
            [5, 3],
            [6, 5],
            [7, 6],
            [8, 7],
        ]);
        BRAILLE.forEach(({ char, points }) => {
            let n = 0;
            for (const p of points) {
                n |= 1 << b.get(p)!;
            }
            brailleIndex.set(n, char);
        });
        return brailleIndex;
    }

    setSize(w: number, h: number) {
        if (w < 1 || h < 1) {
            throw new Error('PBCanvas size cannot be less than 1x1 pixel');
        }
        this.#width = w;
        this.#height = h;
        this.#charWidth = Math.ceil(w / 2);
        this.#charHeight = Math.ceil(h / 4);
        this.#byteWidth = Math.ceil(w / 8);
        this.#lfb = new Uint8Array(this.#byteWidth * this.#height);
    }

    setPixel(x: number, y: number, color: number) {
        if (x >= this.#width || y >= this.#height || x < 0 || y < 0) {
            return;
        }
        const ofs = y * this.#byteWidth + Math.floor(x / 8);
        const n = x % 8;
        if (color > 0) {
            this.#lfb[ofs] |= 1 << n;
        } else {
            this.#lfb[ofs] &= 255 ^ (1 << n);
        }
    }

    getPixel(x: number, y: number): number {
        if (x >= this.#width || y >= this.#height || x < 0 || y < 0) {
            return 0;
        }
        const ofs = y * this.#byteWidth + Math.floor(x / 8);
        const n = x % 8;
        return (this.#lfb[ofs] >> n) & 1;
    }

    convert24Sector(x: number, y: number) {
        let n: number = 0;
        let i: number = 0;
        for (let ly = 0; ly < 4; ++ly) {
            for (let lx = 0; lx < 2; ++lx) {
                if (this.getPixel(x + lx, y + ly) > 0) {
                    n |= 1 << i;
                }
                ++i;
            }
        }
        return n;
    }

    render() {
        const output: string[][] = [];
        for (let ychar = 0; ychar < this.#charHeight; ychar++) {
            const row: string[] = [];
            for (let xchar = 0; xchar < this.#charWidth; xchar++) {
                const x = xchar * 2;
                const y = ychar * 4;
                const n = this.convert24Sector(x, y);
                row.push(this.#brailleIndex.get(n)!);
            }
            output.push(row);
        }
        return output.map((row) => row.join('')).join('\n');
    }
}
