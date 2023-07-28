//test texture buffer
import gbc from '../gbc';
import * as PIXI from 'pixi.js';

describe('CGB general', () => {
  it('should be able to get the correct format instances', () => {
    expect(() => gbc.sprite.texture.update()).not.toThrow();
    expect(gbc.sprite.texture).toBeInstanceOf(PIXI.Texture);
    expect(gbc.sprite).toBeInstanceOf(PIXI.Sprite);
    expect(gbc.textureBuffer.length).toBe(
      gbc.screenheigth * gbc.screenwidth * 4,
    );
  });

  it('should be able to load bootrom correctly', () => {
    const buffer = new ArrayBuffer(256);
    new Uint8Array(buffer)[0] = 0x31;
    new Uint8Array(buffer)[255] = 0x50;
    gbc.loadBootrom(buffer);
    expect(gbc.bootrom.rom).toBeInstanceOf(Uint8ClampedArray);
    expect(gbc.bootrom.rom!.length).toBe(256);
    expect(gbc.bootrom.rom![0]).toBe(0x31);
    expect(gbc.bootrom.rom![255]).toBe(0x50);
  });
});
