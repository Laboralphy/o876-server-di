import { PBCanvas } from './PBCanvas';
import { BlockBanner } from './BlockBanner';

export class BrailleBanner extends PBCanvas {
    static renderString(s: string): string {
        const pbc = new PBCanvas();
        pbc.setSize(s.length * 8, 8);
        s.split('').forEach((char: string, x: number) => {
            BlockBanner.getFontCharIndex(char).forEach((b, y) => {
                pbc.lfb[y * s.length + x] = b;
            });
        });
        return pbc.render();
    }
}
