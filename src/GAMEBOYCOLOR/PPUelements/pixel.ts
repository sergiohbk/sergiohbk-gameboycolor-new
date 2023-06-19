export class PIXEL{
    r: number;
    g: number;
    b: number;
    priority: number;
    index: number;
    tile: number;
    palette: number[];

    constructor(r: number,
    g: number,
    b: number,
    priority: number,
    index: number,
    tile: number,
    palette: number[]) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.priority = priority;
        this.index = index;
        this.tile = tile;
        this.palette = palette;
    }

    getRGB() {
        return [this.r, this.g, this.b];
    }

    setRGB(rgb: number[]) {
        this.r = rgb[0];
        this.g = rgb[1];
        this.b = rgb[2];
    }
}