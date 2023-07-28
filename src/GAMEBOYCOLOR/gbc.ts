import { Sprite, Texture } from 'pixi.js';
import Components from './components';
import ROMonly from './MBCs/ROMonly';

enum GBCstate {
  OFF = 'OFF',
  ON = 'ON',
  LOADBOOTROM = 'LOAD BOOTROM',
  LOADGAME = 'LOAD GAME',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  RESET = 'RESET',
}

class GAMEBOYCOLOR extends Components {
  fps: number;
  maxFps: number;
  isStarted: boolean;
  paused: boolean;
  GBCSTATE: GBCstate;
  //----screen----
  sprite: Sprite;
  textureBuffer: Uint8Array;
  screenwidth: number;
  screenheigth: number;
  texture: Texture;

  constructor() {
    super();

    this.maxFps = 59.7;
    this.isStarted = false;
    this.fps = 0;
    this.paused = false;
    this.GBCSTATE = GBCstate.OFF;
    //pantalla
    this.screenheigth = 144;
    this.screenwidth = 160;
    this.textureBuffer = new Uint8Array(
      this.screenwidth * this.screenheigth * 4,
    ).fill(0xff);
    this.texture = Texture.fromBuffer(
      this.textureBuffer,
      this.screenwidth,
      this.screenheigth,
    );
    this.sprite = new Sprite(this.texture);
  }

  start() {
    if (this.isStarted) return;
    if (!this.PIXI) return;
    this.GBCSTATE = GBCstate.ON;
    this.isStarted = true;
    if (!this.bootrom.isBootromLoaded)
      this.cpu.inicializeDefaultValuesGB();
    //inicializarlos en caso de gameboy color

    this.PIXI.stage.addChild(this.sprite);
    this.PIXI.ticker.maxFPS = this.maxFps;
    this.PIXI.ticker.add((delta) => this.update(delta));
  }

  update(delta: number) {
    while (
      this.cycles.getCycles() <= this.cycles.cyclesToFrame
    ) {
      this.cpu.tick();
      this.ppu.tick();
    }

    this.textureBuffer.set(this.ppu.getImageFrame());

    this.sprite.texture.update();

    this.fps = Math.round((1 / delta) * this.PIXI!.ticker.FPS);
    this.cycles.setCycles(
      (this.cycles.cycles %= this.cycles.cyclesToFrame),
    );
    this.cycles.updateToNewFrame();
  }

  stop() {
    this.GBCSTATE = GBCstate.STOPPED;
    this.isStarted = false;
    this.fps = 0;
    this.reset();
  }

  load(game: ArrayBuffer) {
    this.GBCSTATE = GBCstate.LOADGAME;
    const rom = new Uint8ClampedArray(game);
    this.cartridge.setRom(rom);
    this.setMBCtoMemory();
  }

  loadBootrom(bootromvar: ArrayBuffer) {
    this.GBCSTATE = GBCstate.LOADBOOTROM;
    const rom = new Uint8ClampedArray(bootromvar);
    this.bootrom.setRom(rom);
    this.setDefaultMBCtoMemory();
  }

  pause() {
    this.GBCSTATE = GBCstate.PAUSED;
    this.paused = true;
    this.fps = 0;
  }

  resume() {
    this.GBCSTATE = GBCstate.RUNNING;
    this.paused = false;
  }

  reset() {
    this.GBCSTATE = GBCstate.RESET;
    super.reset();
    this.fps = 0;
  }

  setMBCtoMemory() {
    if (this.cartridge.cardType[0] === null) {
      console.error('MBC not supported');
      return;
    }
    this.memory.MemoryMap = new this.cartridge.cardType[0](
      this.cartridge,
    );
  }

  setDefaultMBCtoMemory() {
    this.memory.MemoryMap = new ROMonly(this.cartridge);
  }
}
const gbc = new GAMEBOYCOLOR();
export default gbc;
