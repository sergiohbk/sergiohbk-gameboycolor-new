import { cartridge as CARTRIDGE } from '../components';

interface MBC {
  name: string;
  readRomBank00(address: number): number;
  readRomBankNN(address: number): number;
  externalRamRead(address: number): number;
  externalRamWrite(address: number, value: number): void;

  writeRomBank00(address: number, value: number): void;
  writeRomBankNN(address: number, value: number): void;
  writeRamBank(address: number, value: number): void;
}

abstract class MBC implements MBC {
  constructor() {
    this.name = 'MBC';
  }

  readRomBank00(address: number): number {
    return CARTRIDGE.rom![address];
  }
  readRomBankNN(address: number): number {
    return CARTRIDGE.rom![address];
  }
  externalRamRead(address: number): number {
    return 0xff;
  }
  externalRamWrite(address: number, value: number): void {}

  writeRomBank00(address: number, value: number) {}
  writeRomBankNN(address: number, value: number) {}
  writeRamBank(address: number, value: number) {}
}

export default MBC;
