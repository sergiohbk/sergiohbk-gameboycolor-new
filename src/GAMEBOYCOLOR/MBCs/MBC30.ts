import MBC from './MBC';
import Cartridge from '../cartridge';

class MBC30 extends MBC {
  constructor(cardridge: Cartridge) {
    super(cardridge);
    this.name = 'MBC30';
  }
}

export default MBC30;
