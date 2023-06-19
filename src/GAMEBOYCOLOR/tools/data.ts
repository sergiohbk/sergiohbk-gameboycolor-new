export function getBanksFromRom(
    rom: Uint8ClampedArray,
    sliceSize: number,
): Uint8ClampedArray[] {
    const banks: Uint8ClampedArray[] = [];
    for (let i = 0; i < rom.length; i += sliceSize) {
        banks.push(rom.slice(i, i + sliceSize));
    }
    return banks;
}

export function createRamBanks(
    ramBanksCount: number,
    ramBankSize: number,
): Uint8ClampedArray[] {
    const ramBanks: Uint8ClampedArray[] = [];
    for (let i = 0; i < ramBanksCount; i++) {
        ramBanks.push(
            new Uint8ClampedArray(ramBankSize),
        );
    }
    return ramBanks;
}
