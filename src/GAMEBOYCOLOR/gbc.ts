import { Application, ICanvas, Sprite, Texture } from 'pixi.js';
import {
  cpu as CPU,
  ppu as PPU,
  bootrom as BOOTROM,
  cycles as TIME,
  cartridge as CARTRIDGE,
  apu as APU,
} from './components';

class GAMEBOYCOLOR {
  maxFps: number = 59.7;
  fps: number = 0;
  isStarted: boolean = false;
  paused: boolean = false;
  GAMEBOYCOLORMODE: boolean = false;

  sprite: Sprite;
  textureBuffer: Uint8Array;
  screenwidth: number = 160;
  screenheigth: number = 144;
  texture: Texture;
  PIXI: Application | null;

  constructor() {
    this.textureBuffer = new Uint8Array(
      this.screenwidth * this.screenheigth * 4,
    ).fill(0xff);
    this.texture = Texture.fromBuffer(
      this.textureBuffer,
      this.screenwidth,
      this.screenheigth,
    );
    this.sprite = new Sprite(this.texture);
    this.PIXI = null;
  }

  start() {
    if (this.isStarted) {
      return;
    }
    if (!this.PIXI) {
      return;
    }

    this.isStarted = true;
    if (!BOOTROM.isBootromLoaded) CPU.inicializeDefaultValuesGB();
    /* diferente para gameboy color*/

    this.PIXI.stage.addChild(this.sprite);
    this.PIXI.ticker.maxFPS = this.maxFps;
    this.PIXI.ticker.add((delta) => this.update(delta));
  }

  update(delta: number) {
    while (TIME.cycles <= TIME.ToFrame) {
      CPU.tick();
      PPU.tick();
      APU.tick();
    }

    this.textureBuffer.set(PPU.getImageFrame());

    this.sprite.texture.update();

    this.fps = Math.round((1 / delta) * this.PIXI!.ticker.FPS);
    TIME.setCycles((TIME.cycles %= TIME.ToFrame));
    TIME.updateToNewFrame();
  }

  stop() {
    this.isStarted = false;
    this.fps = 0;
    this.reset();
  }

  load(game: ArrayBuffer) {
    const rom = new Uint8ClampedArray(game);
    CARTRIDGE.setRom(rom);
  }

  loadBootrom(bootromvar: ArrayBuffer) {
    const rom = new Uint8ClampedArray(bootromvar);
    BOOTROM.setRom(rom);
  }

  pause() {
    this.paused = true;
    this.fps = 0;
  }

  resume() {
    this.paused = false;
  }

  reset() {
    this.fps = 0;
  }

  setPixiCanvas(PIXI: Application<ICanvas>) {
    this.PIXI = PIXI;
  }
}
const GBC = new GAMEBOYCOLOR();
export default GBC;
