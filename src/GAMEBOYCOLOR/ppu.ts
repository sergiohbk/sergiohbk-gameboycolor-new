import { Application } from "pixi.js";
import { Memory } from "./memory";
import { CYCLES } from "./cycles";
import { Background } from "./PPUelements/background";
import { Sprites } from "./PPUelements/sprites";
import { Window } from "./PPUelements/window";
import { FLAGS } from "./generalFlags";
import { PIXEL } from "./PPUelements/pixel";

enum RENDER{
  HBLANK = 0,
  VBLANK = 1,
  OAM = 2,
  TRANSFER = 3
}

export class PPU {
  //----DEPENDENCIES----
  memory: Memory;
  PIXI: Application | null;
  cycles: CYCLES;
  flags: FLAGS;
  //----RENDER----
  STATE: RENDER;
  IMAGEBUFFER: Uint8Array;
  BACKGROUND: Background;
  SPRITES: Sprites;
  WINDOW: Window;
  //----DATA----
  SCREENWIDTH: number;
  SCREENHEIGHT: number;

  constructor(memory: Memory, cycles : CYCLES, flags : FLAGS) {
    this.memory = memory
    this.PIXI = null;
    this.cycles = cycles;
    this.flags = flags
    //---------datos--------
    this.SCREENWIDTH = 160;
    this.SCREENHEIGHT = 144;
    //----------------------
    this.STATE = RENDER.HBLANK;
    this.IMAGEBUFFER = new Uint8Array(this.SCREENWIDTH * this.SCREENHEIGHT * 4).fill(0xFF)
    this.BACKGROUND = new Background();
    this.SPRITES = new Sprites();
    this.WINDOW = new Window();
    
  }

  assignPixi(PIXI : Application) {
    this.PIXI = PIXI;
  }

  getStateInLCDC() {
    if ((this.memory.LCDCSTAT & 0b11) === 0) this.STATE = RENDER.HBLANK;
    if ((this.memory.LCDCSTAT & 0b11) === 1) this.STATE = RENDER.VBLANK;
    if ((this.memory.LCDCSTAT & 0b11) === 0) this.STATE = RENDER.OAM;
    if ((this.memory.LCDCSTAT & 0b11) === 0) this.STATE = RENDER.TRANSFER;
  }

  setStateInLCDC() {
    this.memory.LCDCSTAT = (this.memory.LCDCSTAT & 0xFC) | this.STATE;
  }

  tick() {
    this.cycles.updateCyclesCounter();
    //testear si continuaria normal el apagar la pantalla
    if (this.memory.LCDC & 0x80) {
      if (this.cycles.cyclesPPUcounter >= this.cycles.cyclesToMode) {
        //-------HBLANK-------
        if (this.STATE === RENDER.HBLANK) {
          this.generateScanline()
          this.cycles.setHblankCycles();

          if (this.memory.LY < 143)
            this.STATE = RENDER.OAM;
          else
            this.STATE = RENDER.VBLANK;
          
          this.setStateInLCDC();
          return;
        }
        //-------VBLANK-------
        if (this.STATE === RENDER.VBLANK) {
          this.cycles.setVblankCycles()
          this.memory.LY += 1;
          //stat calculation
          if (this.memory.LY === this.SCREENWIDTH)
            this.memory.IF |= 0x1;
          if (this.memory.LY === 153)
            this.STATE = RENDER.OAM;
          
          this.setStateInLCDC();
          return;
        }
        //--------OAM-------
        if (this.STATE === RENDER.OAM) {
          if (this.memory.LY === 153) {
            this.memory.LY = 0;
          } else {
            this.memory.LY += 1;
          }

          this.cycles.setOAMCycles()
          //do a stat interrupt check
          this.STATE = RENDER.TRANSFER
          this.setStateInLCDC();
          return;
        }
        //------TRANSFER------
        if (this.STATE === RENDER.TRANSFER) {
          this.cycles.setTransferCycles();
          this.setStateInLCDC();
        }
      }
    }
  }

  generateScanline() {
    if (this.memory.LCDC & 0x1 || this.flags.GBCmode)
      this.renderBackground();
    if (this.memory.LCDC & 0x20)
      this.renderWindow();
    if (this.memory.LCDC & 0x2)
      this.renderSprites();
    
    this.drawToImageBuffer(this.packingScanline());
  }

  renderBackground() {

    const LCDCindexes = this.lcdcMemoryIndexes();
    this.setTileMap(LCDCindexes.tilemap)
    for (let x = 0; x < this.SCREENWIDTH; x++){
      const coords2Dpixel = this.pixelCoords(x);
      const coords2Dtile = this.tileCoords(coords2Dpixel.x, coords2Dpixel.y, 8);
      const coords1Dtile = this.coordsToIndex(coords2Dtile.x, coords2Dtile.y, 32);
      const coords2DpixelInTile = this.pixelCoordsInTile(coords2Dpixel.x, coords2Dpixel.y, 8)
      
      const tileIndex = this.BACKGROUND.tilemap[coords1Dtile];
      const tileCharBaseAddr = LCDCindexes.background + tileIndex * 16;
      const byte1 = this.memory.VRAM[0][tileCharBaseAddr + coords2DpixelInTile.y * 2];
      const byte2 = this.memory.VRAM[0][tileCharBaseAddr + coords2DpixelInTile.y * 2 + 1];

      const pixelBitIndex = 7 - coords2DpixelInTile.x;
      const colorIndex = this.getColorIndex(byte1, byte2, pixelBitIndex);
      const backgroundPalette = this.getBackgroundPalette();
      
      const color = this.getColorFromIndex(colorIndex, backgroundPalette);

      const pixel = new PIXEL(color[0], color[1], color[2], 0, pixelBitIndex, tileIndex, backgroundPalette)

      this.BACKGROUND.addToScanline(pixel)
    }
  }

  renderWindow() {
    
  }

  renderSprites() {
    
  }

  packingScanline() {
    //do the things to package all scanlines
    const scanline = new Array(this.SCREENWIDTH).fill(new PIXEL(0,0,0,0,0,0,[0]))
    if (this.BACKGROUND.scanline.length === 0)
      return scanline
    
    for (let i = 0; i < this.BACKGROUND.scanline.length; i++) {
      scanline[i] = this.BACKGROUND.scanline[i];
    }

    
    
    return scanline
  }

  drawToImageBuffer(scanline : Array<PIXEL>) {
    for (let x = 0; x < this.SCREENWIDTH; x++){
      const pixel = scanline[x]
      const indexBuffer = (this.memory.LY * this.SCREENWIDTH + x) * 4;

      this.IMAGEBUFFER[indexBuffer] = pixel.r;
      this.IMAGEBUFFER[indexBuffer + 1] = pixel.g;
      this.IMAGEBUFFER[indexBuffer + 2] = pixel.b;
      this.IMAGEBUFFER[indexBuffer + 3] = 255;
      //esta funcion no se ejecuta en ningun momento
    }
  }
  
  getImageFrame() : Uint8Array {
    return this.IMAGEBUFFER;
  }

  /**
   * Calcula las coordenadas de píxeles finales en la pantalla de la Game Boy 
   * teniendo en cuenta el desplazamiento de la pantalla (SCX y SCY).
   *
   * @param x - La coordenada x del píxel antes de aplicar el desplazamiento.
   * @returns Un objeto con las coordenadas x e y del píxel después de aplicar el desplazamiento.
   */
  pixelCoords(x: number){
    return {
      y: (this.memory.LY + this.memory.SCY) & 0xFF,
      x: (x + this.memory.SCX) & 0xFF
    }
  }

  pixelCoordsInTile(x: number, y: number, size: number) {
    return {
      x: x % size,
      y: y % size
    }
  }

  /**
   * Convierte las coordenadas de píxeles en coordenadas de tiles, teniendo en cuenta
   * el tamaño de los tiles en píxeles.
   *
   * @param x - La coordenada x del píxel en el espacio de coordenadas de píxeles.
   * @param y - La coordenada y del píxel en el espacio de coordenadas de píxeles.
   * @param size - El tamaño de un tile en píxeles (por ejemplo, 8 para tiles de 8x8 píxeles).
   * @returns Un objeto con las coordenadas x e y del tile en el espacio de coordenadas de tiles.
   */
  tileCoords(x: number, y : number, size : number) {
    return {
      y: Math.floor(y / size),
      x: Math.floor(x / size)
    }
  }
  /**
   * 
   * @returns 
   */
  lcdcMemoryIndexes() {
    return {
      tilemap: (this.memory.LCDC & 0x8) ? 0x9c00 : 0x9800,
      background: (this.memory.LCDC & 0x10) ? 0x8000 : 0x8800
    }
  }

  /**
   * Convierte las coordenadas bidimensionales (x, y) en un índice unidimensional,
   * teniendo en cuenta el ancho del espacio bidimensional.
   *
   * @param x - La coordenada x en el espacio de coordenadas bidimensionales.
   * @param y - La coordenada y en el espacio de coordenadas bidimensionales.
   * @param width - El ancho del espacio bidimensional en unidades (por ejemplo, número de tiles o píxeles).
   * @returns El índice unidimensional correspondiente a las coordenadas (x, y) en el espacio bidimensional.
   */
  coordsToIndex(x : number, y: number, width: number) {
    return y * width + x;
  }

  getColorIndex(lsbByte: number, msbByte: number, pixelBitIndex: number) {
    const lsb = (lsbByte >> pixelBitIndex) & 0x1;
    const msb = (msbByte >> pixelBitIndex) & 0x1;
    return (msb << 1) | lsb;
  }

  getBackgroundPalette() {
    return [
      (this.memory.BGP & 0x3),
      (this.memory.BGP >> 2) & 0x3,
      (this.memory.BGP >> 4) & 0x3,
      (this.memory.BGP >> 6) & 0x3,
    ];
  }

  getColorFromIndex(colorIndex: number, palette: number[]) {
    const gbColor = palette[colorIndex];
    switch (gbColor) {
      case 0: return [255, 255, 255]; // Blanco
      case 1: return [192, 192, 192]; // Gris claro
      case 2: return [96, 96, 96];    // Gris oscuro
      case 3: return [0, 0, 0];       // Negro
      default: return [255, 255, 255];
    }
  }
  
  /**
   * Establece el tilemap del fondo en la memoria a partir de un índice de tilemap dado.
   *
   * @param indexTileMap - El índice de inicio del tilemap en la memoria VRAM.
   */
  setTileMap(indexTileMap : number) {
    for (let offset = 0; offset < this.BACKGROUND.tilemap.length; offset++) {
      this.BACKGROUND.tilemap[offset] = this.memory.VRAM[0][indexTileMap + offset - 0x8000];
    }
  }
}
