import { MBC1 } from './MBCs/MBC1';
import { MBC3 } from './MBCs/MBC3';
import { MBC5 } from './MBCs/MBC5';
import { ROMonly } from './MBCs/ROMonly';
import { createRamBanks, getBanksFromRom } from './tools/data';

class Cartridge {
  title: string;
  rom: Uint8ClampedArray;
  compatibility: string;
  license: string;
  cardType: [any, boolean, boolean, boolean, boolean];
  romBanks: Uint8ClampedArray[];
  romBanksCount: number;
  checkSumValid: boolean;
  ramBanks: Uint8ClampedArray[]; // A000 - BFFF
  ramBanksCount: number;
  isRomLoaded: boolean;

  constructor() {
    this.title = '';
    this.rom = new Uint8ClampedArray(0x8000).fill(0xff);
    this.compatibility = '';
    this.license = '';
    this.cardType = [ROMonly, false, false, false, false];
    this.romBanks = [];
    this.romBanksCount = 0;
    this.checkSumValid = false;
    this.ramBanks = []; // A000 - BFFF
    this.ramBanksCount = 0;
    this.isRomLoaded = false;
  }

  setRom(rom: Uint8ClampedArray) {
    this.rom = rom;
    this.isRomLoaded = true;
    this.title = this.getTitle();
    this.compatibility = this.getCompatibility();
    this.license = this.getLicense()!;
    this.cardType = this.getCardType();
    this.romBanks = getBanksFromRom(this.rom, 0x4000);
    this.romBanksCount = this.romBanks.length;
    this.checkSumValid = checkSum(this.rom);
    this.ramBanksCount = this.getRamBanksNumber();
    this.ramBanks = createRamBanks(this.ramBanksCount, 0x2000);
  }

  getTitle(): string {
    const maxbytes =
      this.rom![0x143] === 0x80 || this.rom![0x143] === 0xc0
        ? 0x13e
        : 0x142;

    return Array.from(
      this.rom!.slice(0x134, maxbytes + 1),
    ).reduce(
      (title, byte) =>
        byte ? title + String.fromCharCode(byte) : title,
      '',
    );
  }

  getCompatibility(): string {
    if (this.rom![0x143] === 0x80) return 'CGB & GB compatible';
    if (this.rom![0x143] === 0xc0) return 'CGB compatible';
    return 'GB & CGB compatible';
  }

  getManufacturerCode(): string {
    if (this.getCompatibility() !== 'GB & CGB compatible')
      return Array.from(this.rom!.slice(0x13f, 0x143)).reduce(
        (accumulatedString, currentByte) => {
          if (currentByte === 0x00) {
            return accumulatedString;
          }
          return (
            accumulatedString + String.fromCharCode(currentByte)
          );
        },
        '',
      );
    return 'no manufacturer code';
  }

  getLicense(): string | undefined {
    const isLicenseNew = this.rom![0x14b] === 0x33;

    let license: number;
    if (isLicenseNew) {
      license = parseInt(
        String.fromCharCode(this.rom![0x144]) +
          String.fromCharCode(this.rom![0x145]),
      );
    } else {
      license = this.rom![0x14b];
    }

    const table = isLicenseNew ? licenseTable : oldLicenseTable;
    const key: string | undefined = table[license];
    return key ? key : `Desconocido ${license.toString(16)}`;
  }

  getGameVersion(): number {
    return this.rom![0x14c];
  }

  getCardType(): [any, boolean, boolean, boolean, boolean] {
    const key:
      | [any, boolean, boolean, boolean, boolean]
      | undefined = cardtypeTable[this.rom![0x147]];
    if (key) return key;
    return [null, false, false, false, false];
  }

  SGBEnhancedCompatibility(): boolean {
    return (
      this.rom![0x146] === 0x03 && this.rom![0x14b] === 0x33
    );
  }

  destinationCode(): string {
    return this.rom![0x14a] === 0x00
      ? 'Japanese'
      : 'Non-Japanese';
  }

  getRamBanksNumber(): number {
    if (this.rom![0x149] === 0x01) return 0;
    if (this.rom![0x149] === 0x02) return 1;
    if (this.rom![0x149] === 0x03) return 4;
    if (this.rom![0x149] === 0x04) return 16;
    if (this.rom![0x149] === 0x05) return 8;
    return 0;
  }
}

const cardtypeTable: {
  [key: number]: [any, boolean, boolean, boolean, boolean];
} = {
  //key  MBC type RAM  BATTERY  TIMER  RUMBLE
  0x00: [ROMonly, false, false, false, false],
  0x01: [MBC1, false, false, false, false],
  0x02: [MBC1, true, false, false, false],
  0x03: [MBC1, true, true, false, false],
  0x05: [null, false, false, false, false],
  0x06: [null, false, true, false, false],
  0x08: [ROMonly, true, false, false, false],
  0x09: [ROMonly, true, true, false, false],
  0x0b: [null, false, false, false, false],
  0x0c: [null, true, false, false, false],
  0x0d: [null, true, true, true, false],
  0x0f: [MBC3, false, true, true, false],
  0x10: [MBC3, true, true, true, false],
  0x11: [MBC3, false, false, false, false],
  0x12: [MBC3, true, false, false, false],
  0x13: [MBC3, true, true, false, false],
  0x19: [MBC5, false, false, false, false],
  0x1a: [MBC5, true, false, false, false],
  0x1b: [MBC5, true, true, false, false],
  0x1c: [MBC5, false, false, false, true],
  0x1d: [MBC5, true, false, false, true],
  0x1e: [MBC5, true, true, false, true],
  0x20: [null, false, false, false, false],
  0x22: [null, false, false, false, false],
  0xfc: [null, false, false, false, false],
  0xfd: [null, false, false, false, false],
  0xfe: [null, false, false, false, false],
  0xff: [null, true, true, false, false],
};

const licenseTable: { [key: number]: string } = {
  0x00: 'None',
  0x01: 'Nintendo R&D1',
  0x02: 'Ajinomoto',
  0x08: 'Capcom',
  0x13: 'Electronic Arts',
  0x18: 'Hudson Soft',
  0x19: 'b-ai',
  0x20: 'kss',
  0x22: 'pow',
  0x24: 'PCM Complete',
  0x25: 'san-x',
  0x28: 'Kemco Japan',
  0x29: 'seta',
  0x30: 'Viacom',
  0x31: 'Nintendo',
  0x32: 'Bandai',
  0x33: 'Ocean/Acclaim',
  0x34: 'Konami',
  0x35: 'Hector',
  0x37: 'Taito',
  0x38: 'Hudson',
  0x39: 'Banpresto',
  0x41: 'UbiSoft',
  0x42: 'Atlus',
  0x44: 'Malibu',
  0x46: 'angel',
  0x47: 'Bullet-Proof',
  0x49: 'irem',
  0x50: 'Absolute',
  0x51: 'Acclaim',
  0x52: 'Activision',
  0x53: 'American sammy',
  0x54: 'Konami',
  0x55: 'Hi tech entertainment',
  0x56: 'LJN',
  0x57: 'Matchbox',
  0x58: 'Mattel',
  0x59: 'Milton Bradley',
  0x60: 'Titus',
  0x61: 'Virgin',
  0x64: 'LucasArts',
  0x67: 'Ocean',
  0x69: 'Electronic Arts',
  0x70: 'Infogrames',
  0x71: 'Interplay',
  0x72: 'Broderbund',
  0x73: 'sculptured',
  0x75: 'sci',
  0x78: 'THQ',
  0x79: 'Accolade',
  0x80: 'misawa',
  0x83: 'lozc',
  0x86: 'tokuma shoten intermedia',
  0x87: 'tsukuda ori',
  0x91: 'Chunsoft',
  0x92: 'Video system',
  0x93: 'Ocean/Acclaim',
  0x95: 'Varie',
  0x96: "Yonezawa/s'pal",
  0x97: 'kaneko',
  0x99: 'Pack in soft',
  0xa4: 'Konami (Yu-Gi-Oh!)',
};

const oldLicenseTable: { [key: number]: string } = {
  0x00: 'None',
  0x01: 'Nintendo R&D1',
  0x08: 'Capcom',
  0x09: 'Hot B',
  0x0a: 'Jaleco',
  0x0b: 'Coconuts',
  0x0c: 'Elite Systems',
  0x13: 'Electronic Arts',
  0x18: 'Hudson Soft',
  0x19: 'ITC Entertainment',
  0x1a: 'Yanoman',
  0x1d: 'Clary',
  0x1f: 'Virgin',
  0x24: 'PCM Complete',
  0x25: 'San-X',
  0x28: 'Kotobuki Systems',
  0x29: 'Seta',
  0x30: 'Infogrames',
  0x31: 'Nintendo',
  0x32: 'Bandai',
  0x33: 'GBC',
  0x34: 'Konami',
  0x35: 'Hector',
  0x38: 'Capcom',
  0x39: 'Banpresto',
  0x3c: 'Entertainment i',
  0x3e: 'Gremlin',
  0x41: 'Ubisoft',
  0x42: 'Atlus',
  0x44: 'Malibu',
  0x46: 'Angel',
  0x47: 'Spectrum Holoby',
  0x49: 'Irem',
  0x4a: 'Virgin',
  0x4d: 'Malibu',
  0x4f: 'U.S. Gold',
  0x50: 'Absolute',
  0x51: 'Acclaim',
  0x52: 'Activision',
  0x53: 'American Sammy',
  0x54: 'GameTek',
  0x55: 'Park Place',
  0x56: 'LJN',
  0x57: 'Matchbox',
  0x59: 'Milton Bradley',
  0x5a: 'Mindscape',
  0x5b: 'Romstar',
  0x5c: 'Naxat Soft',
  0x5d: 'Tradewest',
  0x60: 'Titus',
  0x61: 'Virgin',
  0x67: 'Ocean',
  0x69: 'Electronic Arts',
  0x6e: 'Elite Systems',
  0x6f: 'Electro Brain',
  0x70: 'Infogrames',
  0x71: 'Interplay',
  0x72: 'Broderbund',
  0x73: 'Sculptered Soft',
  0x75: 'The Sales Curve',
  0x78: 'THQ',
  0x79: 'Accolade',
  0x7a: 'Triffix Entertainment',
  0x7c: 'Microprose',
  0x7f: 'Kemco',
  0x80: 'Misawa Entertainment',
  0x83: 'Lozc',
  0x86: 'Tokuma Shoten Intermedia',
  0x8b: 'Bullet-Proof Software',
  0x8c: 'Vic Tokai',
  0x8e: 'Ape',
  0x8f: 'IMax',
  0x91: 'Chun Soft',
  0x92: 'Video System',
  0x93: 'Tsuburava',
  0x95: 'Varie',
  0x96: 'Yonezawa/Spal',
  0x97: 'Kaneko',
  0x99: 'Arc',
  0x9a: 'Nihon Bussan',
  0x9b: 'Tecmo',
  0x9c: 'Imagineer',
  0x9d: 'Banpresto',
  0x9f: 'Nova',
  0xa1: 'Hori Electric',
  0xa2: 'Bandai',
  0xa4: 'Konami',
  0xa6: 'Kawada',
  0xa7: 'Takara',
  0xa9: 'Technos Japan',
  0xaa: 'Broderbund',
  0xac: 'Toei Animation',
  0xad: 'Toho',
  0xaf: 'Namco',
  0xb0: 'Acclaim',
  0xb1: 'Ascii or Nexoft',
  0xb2: 'Bandai',
  0xb4: 'Enix',
  0xb6: 'HAL',
  0xb7: 'SNK',
  0xb9: 'Pony Canyon',
  0xba: 'Culture Brain',
  0xbb: 'Sunsoft',
  0xbd: 'Sony Imagesoft',
  0xbf: 'Sammy',
  0xc0: 'Taito',
  0xc2: 'Kemco',
  0xc3: 'Squaresoft',
  0xc4: 'Tokuma Shoten Intermedia',
  0xc5: 'Data East',
  0xc6: 'Tonkin House',
  0xc8: 'Koei',
  0xc9: 'UFL',
  0xca: 'Ultra',
  0xcb: 'Vap',
  0xcc: 'Use',
  0xcd: 'Meldac',
  0xce: 'Pony Canyon',
  0xcf: 'Angel',
  0xd0: 'Taito',
  0xd1: 'Sofel',
  0xd2: 'Quest',
  0xd3: 'Sigma Enterprises',
  0xd4: 'Ask Kodansha',
  0xd6: 'Naxat Soft',
  0xd7: 'Copya Systems',
  0xd9: 'Banpresto',
  0xda: 'Tomy',
  0xdb: 'LJN',
  0xdd: 'NCS',
  0xde: 'Human',
  0xdf: 'Altron',
  0xe0: 'Jaleco',
  0xe1: 'Towachiki',
  0xe2: 'Yutaka',
  0xe3: 'Varie',
  0xe5: 'Epoch',
  0xe7: 'Athena',
  0xe8: 'Asmik',
  0xe9: 'Natsume',
  0xea: 'King Records',
  0xeb: 'Atlus',
  0xec: 'Epic/Sony Records',
  0xee: 'IGS',
  0xf0: 'A-Wave',
  0xf3: 'Extreme Entertainment',
  0xff: 'LJN',
};

function checkSum(rom: Uint8ClampedArray): boolean {
  let sum: number = 0;
  for (let i = 0x134; i < 0x14d; i++) sum = sum - rom[i] - 1;
  sum &= 0xff;
  return sum === rom[0x14d];
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function getValidLogo(logoRom: Uint8ClampedArray): boolean {
  const logo: Uint8ClampedArray = new Uint8ClampedArray(0x30);
  logo.set([
    0xce, 0xed, 0x66, 0x66, 0xcc, 0xd, 0x0, 0xb, 0x3, 0x73, 0x0,
    0x83, 0x0, 0xc, 0x0, 0xd, 0x0, 0x8, 0x11, 0x1f, 0x88, 0x89,
    0x0, 0xe, 0xdc, 0xcc, 0x6e, 0xe6, 0xdd, 0xdd, 0xd9,
  ]);

  for (let i = 0; i < 0x18; i++) {
    if (logoRom[i] !== logo[i]) return false;
  }
  return true;
}

function globalCheckSum(rom: Uint8ClampedArray): boolean {
  let sum: number = 0;
  for (let i = 0; i < rom.length; i++) sum += rom[i];
  sum = (sum - rom[0x14e] - rom[0x14f]) & 0xffff;
  return sum === ((rom[0x14e] << 8) | rom[0x14f]);
}
/* eslint-disable @typescript-eslint/no-unused-vars */

export default Cartridge;
