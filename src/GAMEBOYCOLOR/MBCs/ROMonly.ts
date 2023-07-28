import MBC from './MBC';
import Cartridge from '../cartridge';

class ROMonly extends MBC {
  constructor(cardridge: Cartridge) {
    super(cardridge);
    this.name = 'ROMONLY';
  }
}

export default ROMonly;
