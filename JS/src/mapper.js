
var Mapper = function(nes, rom){
    this.prgMap = new Int32Array(4);
    this.chrMap = new Int32Array(8);


    this.nes = nes;
    this.rom = rom
    this.prgSize = rom[4] * 0x4000;
    this.chrSize = rom[5] * 0x2000;
    this.prgRamSize = rom[8] ?  rom[8] * 0x2000 : 0x2000;
    (rom[6] & 1) ? nes.ppu.set_mirroring_vertical() : nes.ppu.set_mirroring_horizontal();

    // console.log(rom)
    this.prg    = rom.subarray(16);
    this.prgRam = new Uint8Array(this.prgRamSize);

    if (this.chrSize > 0)
        this.chr = rom.subarray(16 + this.prgSize);
    else
    {
        this.chrRam = true;
        this.chrSize = 0x2000;
        this.chr = new Uint8Array(this.chrSize);
    }

    // console.log("DDDDDDDDDDDDD", this.prgSize, this.chr)
}

Mapper.prototype.read = function(addr){
    // console.log("XX", this.prgMap[((addr - 0x8000) / 0x2000) | 0]  + ((addr - 0x8000) % 0x2000));

    if (addr >= 0x8000)
        return this.prg[this.prgMap[((addr - 0x8000) / 0x2000) | 0]  + ((addr - 0x8000) % 0x2000)];
    else 
        return this.prgRam[addr - 0x6000];
}


Mapper.prototype.write = function(addr, v){
    return v;
}

Mapper.prototype.chr_read = function(addr){
    var temp = this.chrMap[addr/0x400 | 0] + (addr % 0x400)
    return this.chr[temp];
}

Mapper.prototype.chr_write = function(add, v){
    return v;
}


Mapper.prototype.map_prg = function(pageKBs, slot,  bank){
    if (bank < 0){
        bank = (this.prgSize / (0x400*pageKBs))  + bank;
    }
    for (var i = 0; i < (pageKBs / 8); ++i){
        this.prgMap[(pageKBs/8) * slot + i] = (pageKBs * 0x400 * bank + 0x2000 * i) % this.prgSize;
    }
}

Mapper.prototype.map_prg_32 = function(slot, bank){
    this.map_prg(32, slot, bank)
}

Mapper.prototype.map_prg_16 = function(slot, bank){
    this.map_prg(16, slot, bank)
}

Mapper.prototype.map_prg_8 = function(slot, bank){
    this.map_prg(8, slot, bank)
}


Mapper.prototype.map_chr = function(pageKBs, slot, bank){
    for (var i = 0; i < pageKBs; ++i){
        this.chrMap[pageKBs * slot + i] = (pageKBs * 0x400*bank + 0x400 * i) % this.chrSize;
    }
}

Mapper.prototype.map_chr_8 = function(slot, bank){
    this.map_chr(8, slot, bank)
}

Mapper.prototype.map_chr_4 = function(slot, bank){
    this.map_chr(4, slot, bank)
}

Mapper.prototype.map_chr_2 = function(slot, bank){
    this.map_chr(2, slot, bank)
}

Mapper.prototype.map_chr_1 = function(slot, bank){
    this.map_chr(1, slot, bank)
}

Mapper.prototype.signal_scanline = function(){
}


// var Mapper0 = function(rom, nes){
//     this.mapper = new Mapper(rom, nes)
// }


var Mapper0 = function(nes, rom){
    Mapper.call(this, nes, rom);
    // this.prototype = Object.create(Mapper.prototype)
    // this.map_prg_32(0, 0);
    // this.map_chr_8(0, 0);
}

Mapper0.prototype = Object.create(Mapper.prototype)

Mapper0.prototype.init = function(){
    this.map_prg_32(0, 0);
    this.map_chr_8(0, 0);
}

Mapper0.prototype.constructor = Mapper0


var Mapper2 = function(nes, rom){
    Mapper.call(this, nes, rom);
    this.regs = new Uint8Array(1);
    this.vertical_mirroring = false;
}

Mapper2.prototype =Object.create(Mapper.prototype)

Mapper2.prototype.run  = function(){
    this.map_prg_16(0, this.regs[0] & 0xF);
    this.map_prg_16(1, 0xF);
    this.map_chr_8(0, 0);
    this.vertical_mirroring ? this.nes.ppu.set_mirroring_vertical() : this.nes.ppu.set_mirroring_horizontal()
}

Mapper2.prototype.init = function(){
    this.regs[0] = 0;
    this.vertical_mirroring = this.rom[6] & 0x01;
    this.run();
}

Mapper2.prototype.write = function(addr, v){
    if (addr & 0x8000){
        this.regs[0] = v;
        this.run();
    }
    return v;
}

Mapper2.prototype.chr_write = function(addr, v){
    return this.chr[addr] = v;
}

module.exports = {
    Mapper0: Mapper0,
    Mapper2: Mapper2,
}

