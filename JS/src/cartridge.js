var Mapper  = require("./mapper")

var  Cartridge = function(nes){
    this.nes = nes
    this.mapper = null;
    this.rom = null;
}


Cartridge.prototype.load = function(raw){
    // console.log(raw)
    // console.log(raw.toString().length)
    // this.rom = Int8Array.from(raw)
    this.rom = raw;

    let mapperNum = (raw[7] & 0xF0) | (raw[6] >> 4);
    this.mapper   = null;

    console.log("mapper:", mapperNum)
    switch(mapperNum){
        case 0: this.mapper = new Mapper.Mapper0(this.nes, raw); this.mapper.init(); break;
        case 2: this.mapper = new Mapper.Mapper2(this.nes, raw); this.mapper.init(); break;
    }

    this.nes.cpu.power();
    this.nes.ppu.reset();
}

Cartridge.prototype.loadUrl = function(rom){
}


Cartridge.prototype.access = function(wr, addr, v){
    if (!wr) return this.mapper.read(addr);
    else     return this.mapper.write(addr, v);
}

Cartridge.prototype.chr_access = function(wr, addr, v){
    if (!wr) return this.mapper.chr_read(addr);
    else     return this.mapper.chr_write(addr, v);
}

Cartridge.prototype.signal_scanline = function(){

}

module.exports = Cartridge