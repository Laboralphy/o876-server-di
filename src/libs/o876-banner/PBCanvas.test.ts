import { PBCanvas } from './PBCanvas';

describe('setSize', () => {
    it('should create a lfb of 8 bytes, when size is set to 8x8', () => {
        const pbc = new PBCanvas();
        pbc.setSize(8, 8);
        expect(pbc.lfb.length).toBe(8);
    });
    it('should create a lfb of 16 bytes, when size is set to 16x8', () => {
        const pbc = new PBCanvas();
        pbc.setSize(16, 8);
        expect(pbc.lfb.length).toBe(16);
    });
    it('should create a lfb of 4 bytes, when size is set to 4x4', () => {
        const pbc = new PBCanvas();
        pbc.setSize(4, 4);
        expect(pbc.lfb.length).toBe(4);
    });
    it('should create a lfb of 1 byte, when size is set to 1x1', () => {
        const pbc = new PBCanvas();
        pbc.setSize(1, 1);
        expect(pbc.lfb.length).toBe(1);
    });
    it('should throw an error when size is too small', () => {
        const pbc = new PBCanvas();
        expect(() => pbc.setSize(1, 0)).toThrow();
        expect(() => pbc.setSize(0, 0)).toThrow();
        expect(() => pbc.setSize(0, 1)).toThrow();
        expect(() => pbc.setSize(100, 0)).toThrow();
        expect(() => pbc.setSize(0, 100)).toThrow();
        expect(() => pbc.setSize(-1, -1)).toThrow();
        expect(() => pbc.setSize(-1, 25)).toThrow();
        expect(() => pbc.setSize(85, -1)).toThrow();
    });
});

describe('setPixel', () => {
    it('should produce a first byte of 255 when set pixel from 0, 0 to 7, 0', () => {
        const pbc = new PBCanvas();
        pbc.setSize(8, 8);
        expect(pbc.lfb[0]).toBe(0);
        pbc.setPixel(0, 0, 1);
        expect(pbc.lfb[0]).toBe(1);
        pbc.setPixel(1, 0, 1);
        expect(pbc.lfb[0]).toBe(3);
        pbc.setPixel(2, 0, 1);
        expect(pbc.lfb[0]).toBe(7);
        pbc.setPixel(3, 0, 1);
        expect(pbc.lfb[0]).toBe(15);
        pbc.setPixel(4, 0, 1);
        expect(pbc.lfb[0]).toBe(31);
        pbc.setPixel(5, 0, 1);
        expect(pbc.lfb[0]).toBe(63);
        pbc.setPixel(6, 0, 1);
        expect(pbc.lfb[0]).toBe(127);
        pbc.setPixel(7, 0, 1);
        expect(pbc.lfb[0]).toBe(255);
        expect(pbc.lfb[1]).toBe(0);
    });
    it('should not change lfb when out of range pixel are set', () => {
        const pbc = new PBCanvas();
        pbc.setSize(8, 8);
        expect(pbc.lfb.every((c) => c == 0)).toBeTruthy();
        pbc.setPixel(84, 51, 1);
        pbc.setPixel(0, 51, 1);
        pbc.setPixel(-5, 2, 1);
        pbc.setPixel(-5, -2, 1);
        expect(pbc.lfb.every((c) => c == 0)).toBeTruthy();
    });
    it('should draw a square', () => {
        const pbc = new PBCanvas();
        pbc.setSize(8, 8);
        for (let y = 0; y < 8; ++y) {
            for (let x = 0; x < 8; ++x) {
                pbc.setPixel(x, y, x == 0 || y == 0 || x == 7 || y == 7 ? 1 : 0);
            }
        }
        expect(pbc.lfb[0]).toBe(255);
        expect(pbc.lfb[1]).toBe(129);
        expect(pbc.lfb[2]).toBe(129);
        expect(pbc.lfb[3]).toBe(129);
        expect(pbc.lfb[4]).toBe(129);
        expect(pbc.lfb[5]).toBe(129);
        expect(pbc.lfb[6]).toBe(129);
        expect(pbc.lfb[7]).toBe(255);
    });
});

describe('convert24Sector', () => {
    it('should return 0 when no pixel is set', () => {
        const pbc = new PBCanvas();
        pbc.setSize(4, 4);
        expect(pbc.convert24Sector(0, 0)).toBe(0);
    });
    it('should return 1 when pixel 0 0 is set', () => {
        const pbc = new PBCanvas();
        pbc.setSize(4, 4);
        pbc.setPixel(0, 0, 1);
        expect(pbc.convert24Sector(0, 0)).toBe(1);
    });
    it('should return 3 when pixel (0 0) (1 0) are set', () => {
        const pbc = new PBCanvas();
        pbc.setSize(4, 4);
        pbc.setPixel(0, 0, 1);
        pbc.setPixel(1, 0, 1);
        expect(pbc.convert24Sector(0, 0)).toBe(3);
    });
    it('should return 7 when pixel (0 0) (1 0) (0 1) are set', () => {
        const pbc = new PBCanvas();
        pbc.setSize(4, 4);
        pbc.setPixel(0, 0, 1);
        pbc.setPixel(1, 0, 1);
        pbc.setPixel(0, 1, 1);
        expect(pbc.convert24Sector(0, 0)).toBe(7);
    });
    it('should return 255 when all pixels are set', () => {
        const pbc = new PBCanvas();
        pbc.setSize(4, 4);
        pbc.setPixel(0, 0, 1);
        pbc.setPixel(1, 0, 1);
        pbc.setPixel(0, 1, 1);
        pbc.setPixel(1, 1, 1);
        pbc.setPixel(0, 2, 1);
        pbc.setPixel(1, 2, 1);
        pbc.setPixel(0, 3, 1);
        pbc.setPixel(1, 3, 1);
        expect(pbc.convert24Sector(0, 0)).toBe(255);
    });
});

describe('render', () => {
    it('should render spaces', () => {
        const pbc = new PBCanvas();
        pbc.setSize(8, 8);
        expect(pbc.lfb.length).toBe(8);
        expect(pbc.render().length).toBe(9);
        expect(pbc.render()).toBe('⠀⠀⠀⠀\n⠀⠀⠀⠀');
    });
    it('should render a square', () => {
        const pbc = new PBCanvas();
        pbc.setSize(8, 8);
        expect(pbc.lfb.length).toBe(8);
        pbc.setPixel(0, 0, 1);
        pbc.setPixel(1, 1, 1);
        pbc.setPixel(2, 2, 1);
        pbc.setPixel(3, 3, 1);
        pbc.setPixel(4, 4, 1);
        pbc.setPixel(5, 5, 1);
        pbc.setPixel(6, 6, 1);
        pbc.setPixel(7, 7, 1);
        expect(pbc.render()).toEqual('⠑⢄⠀⠀\n⠀⠀⠑⢄');
    });
});
