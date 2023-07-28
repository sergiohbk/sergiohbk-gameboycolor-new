import MBC from './MBC';
import Cartridge from '../cartridge';

class MBC1 extends MBC {
  constructor(cardridge: Cartridge) {
    super(cardridge);
    this.name = 'MBC1';
  }
}

export default MBC1;
