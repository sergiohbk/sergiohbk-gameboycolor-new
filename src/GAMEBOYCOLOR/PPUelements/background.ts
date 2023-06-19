import { PIXEL } from "./pixel";

export class Background{
    scanline: Array<PIXEL>;
    tilemap: Array<number>;
    constructor() {
        this.scanline = new Array()
        this.tilemap = new Array(256*256)
    }



    addToScanline(pixel : PIXEL) {
        this.scanline.push(pixel);
    }

    flushScanline() {
        this.scanline.length = 0;
    }

    getTileMap2D() : number[][] { 
        const tilemap1B = this.tilemap.filter((_, index) => index % 2 === 0);
        const tilemap2D = this.to2Darray(tilemap1B, 256)
        return tilemap2D;
    }

    to2Darray(array : number[], size : number) {
        const length = Math.ceil(array.length / size);
        return Array.from({ length }, (_, i) => array.slice(i * size, i * size + size));
    }
}