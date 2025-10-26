import { FONT_BASE } from './font-base';
import { DIACRITICS } from './diacritics';

const PAVES: string = ' ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█';

export class BlockBanner {
    static getFontCharIndex(s: string): number[] {
        let c = s.charCodeAt(0);
        let cx = 0;
        if (c < 32) {
            c = 32;
        }
        if (c >= 128) {
            const sx = s.normalize('NFD');
            c = sx.charCodeAt(0);
            cx = sx.charAt(0) > 'Z' ? sx.charCodeAt(1) : 0;
        }
        const bDia = cx > 0;
        const aDia = bDia ? DIACRITICS[cx - 0x300] : FONT_BASE[0];
        return FONT_BASE[c - 32].map((x, i) => (bDia && (i < 2 || i >= 7) ? aDia[i] : x));
    }

    static convertStringToBytes(s: string) {
        const aOutput: number[][][] = [[], [], [], []];
        s.split('').forEach((c: string) => {
            const aData = BlockBanner.getFontCharIndex(c);
            aOutput[0].push([aData[0], aData[1]]);
            aOutput[1].push([aData[2], aData[3]]);
            aOutput[2].push([aData[4], aData[5]]);
            aOutput[3].push([aData[6], aData[7]]);
        });
        return aOutput;
    }

    static getSquareNibbleChar(n: number) {
        return PAVES.charAt(n & 0xf);
    }

    static getTwoByteString(b1: number, b2: number) {
        let sResult = '';
        for (let i = 0; i < 4; ++i) {
            const n = (b1 & 0x3) | ((b2 & 0x3) << 2);
            sResult += BlockBanner.getSquareNibbleChar(n);
            b1 >>= 2;
            b2 >>= 2;
        }
        return sResult;
    }

    static convertMaskIntoByte(sMask: string): number {
        return sMask
            .split('') //
            .reverse() //
            .map((c): number => (c === ' ' ? 0 : 1))
            .reduce((acc, b) => (acc << 1) | b, 0);
    }

    static convertImageIntoBytes(aImage: string[]) {
        const extract = (row: string, x: number) =>
            !!row ? BlockBanner.convertMaskIntoByte(row.substring(x, x + 8).padEnd(8, ' ')) : 0;
        const aBytes = [];
        for (let y = 0, height = aImage.length; y < height; y += 2) {
            const row1 = aImage[y];
            const row2 = aImage[y + 1];
            const aByteRow = [];
            for (let x = 0, width = row1.length; x < width; x += 8) {
                aByteRow.push([extract(row1, x), extract(row2, x)]);
            }
            aBytes.push(aByteRow);
        }
        return aBytes;
    }

    static buildPaveString(aData: number[][][]) {
        return aData
            .map((row) =>
                row.map((cell4) => BlockBanner.getTwoByteString(cell4[0], cell4[1])).join('')
            )
            .join('\n');
    }

    static renderString(s: string) {
        return BlockBanner.buildPaveString(BlockBanner.convertStringToBytes(s));
    }
}
