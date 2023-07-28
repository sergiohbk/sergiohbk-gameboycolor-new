class Sprites {
  spriteList: Array<SPRITE>;
  constructor() {
    this.spriteList = new Array(40);
  }
}

interface SPRITE {
  YPOS: Number;
  XPOS: Number;
  INDEX: Number;
  PALLETEGBC: Number;
  PALLETEGB: Number;
  VRAMBANK: Number;
  XFLIP: Number;
  YFLIP: Number;
  PRIORITY: Number;
  SIZE: Number;
}

export default Sprites;
