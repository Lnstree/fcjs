var IntType= { NMI : 0, REST : 1, IRQ : 2, BRK : 3,}
var Flag = { C : 0, Z : 1, I : 2, D : 3, V : 6,  N : 7} 


var Flags = function(){
    this.flag = 0 | (1 << 5);
}

Flags.prototype.get = function(){
    return this.flag;
}

Flags.prototype.index = function(index){
    if (this.flag >> index & 0x1) return true;
    return false;
}

Flags.prototype.setFlag = function(index, v){
    this.flag &= ~(1 << index);
    this.flag |=  ((v > 0 )  << index);
}

Flags.prototype.set = function(p){
    this.flag = (p | (1 << 5)) & 0xFF 
}

var A = new Uint8Array(1);
var X = new Uint8Array(1);
var Y = new Uint8Array(1);
var S = new Uint8Array(1);
var P = new Flags();
var PC = new Uint16Array(1);
var ram = new Uint8Array(0x800);
var TOTAL_CYCLES = 29781;


// convert temp
var reg_i16 = new Int16Array(1);
var reg_u16 = new Uint16Array(1);
var reg_u16_a = new Uint16Array(1);
var reg_u16_b = new Uint16Array(1);
var reg_u8  = new Uint8Array(1);
var reg_i8  = new Int8Array(1);


var  CPU = function(nes){
    this.nes = nes;
    this.nmi = false;
    this.irq = false;
    this.remaininhCycles = 0;
}

CPU.prototype.debugInfo = function(){
    console.log("A:", A[0], " X", X[0], " Y", Y[0], " S", S[0]);
    console.log("PC:", PC[0]);
    console.log("flag(", "C:", P.index(Flag.C), "Z:", P.index(Flag.Z), "I:", P.index(Flag.I),
                "D:", P.index(Flag.D), "V:", P.index(Flag.V), "N:", P.index(Flag.N), ")")
    console.log("nmi:", this.nmi);
    console.log("irq:", this.irq);
    console.log("cycles:", this.remaininhCycles)
    console.log("--------------------------------------------------")

}

CPU.prototype.set_nmi = function(v=true){
    this.nmi = v;
}

CPU.prototype.set_irq = function(v=true){
    this.irq = v;
}

CPU.prototype.dmc_read = function(addr){
    return this.access(0, addr);
}

CPU.prototype.elapsed = function(){
    return TOTAL_CYCLES - this.remaininhCycles;
}

CPU.prototype.tick  = function(){
    // 3 ppu tick
    this.nes.ppu.step()
    this.nes.ppu.step()
    this.nes.ppu.step()
    this.remaininhCycles--;
}

// 设置进位和溢出
CPU.prototype.upd_cv = function(x, y, r) {
    P.setFlag(Flag.C, r > 0xFF); 
    P.setFlag(Flag.V,  ~(x^y) & (x^r) & 0x80); 
}

CPU.prototype.upd_nz = function(x) {
    reg_u8[0] = x;
    P.setFlag(Flag.N,  reg_u8[0] & 0x80); 
    P.setFlag(Flag.Z, (reg_u8[0] == 0)); 
}


// page cross
CPU.prototype.cross = function(a, i) { return ((a + i)& 0xFF00) != ((a & 0xFF00)); }

// memory access
CPU.prototype.dma_oam = function(bank) { for (var i = 0; i < 256; i++) this.wr(0x2014, this.rd(bank * 0x100 + i));}

CPU.prototype.access = function(wr, addr, v = 0){
    if (addr <= 0x1FFF){
        if (wr) ram[addr % 0x800] = v;
        return ram[addr % 0x800];  // RAM.
    }
    else if (addr >= 0x2000 && addr <= 0x3FFF ){
        return this.nes.ppu.access(wr, addr % 8, v);                // PPU.
    }
    else if (addr >= 0x4000  && addr <= 0x4013){
//        return APU::access<wr>(elapsed(), addr, v);
    }
    else if (addr == 0x4015){
//        return APU::access<wr>(elapsed(), addr, v);
    }
    else if (addr == 0x4014){
        if (wr) this.dma_oam(v); // break;                          // OAM DMA.
    }
    else if (addr == 0x4017){
        //if (wr) return APU::access<wr>(elapsed(), addr, v);
        // else return Joypad::read_state(1);
        if (wr)  return 0;
        else return  this.nes.joypad.read_state(1);
    }
    else if (addr == 0x4016){
        if (wr) { this.nes.joypad.write_strobe(v & 1); }     // Joypad strobe.
        else return  this.nes.joypad.read_state(0);      // Joypad strobe.
    }
    else if (addr >= 0x4018 && addr <= 0xFFFF){
        return this.nes.cartridge.access(wr,addr, v);              // Cartridge.
    }

    return 0;
}

CPU.prototype.wr = function(a, v){
    this.tick();
    return this.access(1, a, v);
}

CPU.prototype.rd = function(a){
    this.tick();
    return this.access(0, a);
}

CPU.prototype.rd16_d = function(a, b){
    reg_u16_a[0] = this.rd(a);
    reg_u16_b[0] = this.rd(b) << 8;
    reg_u16[0] = reg_u16_a[0] | reg_u16_b[0];
    return reg_u16[0];
}

CPU.prototype.rd16 = function(a){return this.rd16_d(a, a+1);}
CPU.prototype.push = function(v){return this.wr(0x100 + (S[0]--), v);}
CPU.prototype.pop  = function(v){
    reg_u8[0] =  this.rd(0x100 + (++S[0]));
    return reg_u8[0];
}

//address 
CPU.prototype.imm = function() { return PC[0]++; }
CPU.prototype.imm16 = function() { PC[0] += 2; return PC[0] - 2;}
CPU.prototype.abs = function() { return this.rd16(this.imm16()); }
CPU.prototype._abx = function() {this.tick(); return this.abs() + X[0]; }
CPU.prototype.abx  = function() {var a = this.abs(); if (this.cross(a, X[0])) this.tick();  return a + X[0]; }
CPU.prototype.aby  = function() {var a = this.abs(); if (this.cross(a, Y[0])) this.tick();  return a + Y[0]; }
CPU.prototype.zp   = function() {return this.rd(this.imm()); }
CPU.prototype.zpx  = function() {this.tick(); return (this.zp() + X[0]) % 0x100; }
CPU.prototype.zpy  = function() {this.tick(); return (this.zp() + Y[0]) % 0x100; }
CPU.prototype.izx  = function() {var i = this.zpx(); return this.rd16_d(i, (i + 1) % 0x100);}
CPU.prototype._izy  = function() {var i = this.zp(); return this.rd16_d(i, (i + 1) % 0x100 ) + Y[0];}
CPU.prototype.izy  = function() {var a = this._izy(); if (this.cross(a-Y[0], Y[0]))this.tick(); return a; }


// STX
CPU.prototype.st = function(r, m) {
    this.wr(m.bind(this)(), r);
}

CPU.prototype.st_A_izy = function(){
    this.tick();
    this.wr(this._izy(), A[0]);
}

CPU.prototype.st_A_abx = function(){
    this.tick();
    this.wr(this.abs() + X[0], A[0]);
}

CPU.prototype.st_A_aby = function(){
    this.tick();
    this.wr(this.abs() + Y[0], A[0]);
}

// var a = this.m()
CPU.prototype.ld = function(r, m){
    reg_u16[0] = m();
    reg_u8[0] = this.rd(reg_u16[0]);
    // console.log("ll", a, p);
    r[0] = reg_u8[0];
    this.upd_nz(reg_u8[0]);
}

CPU.prototype.cmp = function(r, m){
    reg_u16[0] = m();
    reg_u8[0] = this.rd(reg_u16[0]);
    this.upd_nz(r - reg_u8[0]);
    P.setFlag(Flag.C, (r >= reg_u8[0]));
}

// aruthmetic 

CPU.prototype.ADC = function(m){
    reg_u16[0] = m();
    reg_u8[0] = this.rd(reg_u16[0]);
    reg_i16[0] = A[0] + reg_u8[0] + P.index(Flag.C);
    this.upd_cv(A[0], reg_u8[0], reg_i16[0]);
    A[0] = reg_i16[0];
    this.upd_nz(A[0]);
}

CPU.prototype.SBC = function(m){
    reg_u16[0] = m();
    reg_u8[0] = this.rd(reg_u16[0]) ^ 0xFF;
    reg_i16[0] = A[0] + reg_u8[0] + P.index(Flag.C);
    this.upd_cv(A[0], reg_u8[0], reg_i16[0]);
    A[0] = reg_i16[0];
    this.upd_nz(A[0]);
}

CPU.prototype.BIT = function(m){
    reg_u16[0] = m();
    reg_u8[0] = this.rd(reg_u16[0]);
    P.setFlag(Flag.Z, !(A[0] & reg_u8[0]));
    P.setFlag(Flag.N, reg_u8[0] & 0x80);
    P.setFlag(Flag.V, reg_u8[0] & 0x40);
}

CPU.prototype.AND = function(m){
    reg_u16[0] = m();
    reg_u8[0] = this.rd(reg_u16[0]);
    A[0] &= reg_u8[0];
    this.upd_nz(A[0]);
}

CPU.prototype.EOR = function(m){
    reg_u16[0] = m();
    reg_u8[0] = this.rd(reg_u16[0]);
    this.upd_nz(A[0] ^= reg_u8[0]);
}

CPU.prototype.ORA = function(m){
    reg_u16[0] = m();
    reg_u8[0] = this.rd(reg_u16[0]);
    this.upd_nz(A[0] |= reg_u8[0]);
}

CPU.prototype.ASL = function(m){
    var a = new Uint16Array(1);
    var p = new Uint8Array(1);

    reg_u16[0] = m();
    reg_u8[0] = this.rd(reg_u16[0]);
    P.setFlag(Flag.C,  reg_u8[0] & 0x80);
    this.tick();
    this.upd_nz(this.wr(reg_u16[0], reg_u8[0] << 1));
}

CPU.prototype.LSR = function(m){
    reg_u16[0] = m();
    reg_u8[0] = this.rd(reg_u16[0]);
    P.setFlag(Flag.C, reg_u8[0] & 0x01);
    this.tick();
    this.upd_nz(this.wr(reg_u16[0], reg_u8[0] >> 1));
}

CPU.prototype.ROL = function(m){
    var a = new Uint16Array(1);
    var p = new Uint8Array(1);
    var c = new Uint8Array(1);

    a[0] = m();
    p[0] = this.rd(a[0]);
    c[0] = P.index(Flag.C);
    P.setFlag(Flag.C, p[0] & 0x80);
    this.tick();
    this.upd_nz(this.wr(a[0], (p[0] << 1) | c[0]));
}

CPU.prototype.ROR = function(m){
    var a = new Uint16Array(1);
    var p = new Uint8Array(1);
    var c = new Uint8Array(1);

    a[0] = m();
    p[0] = this.rd(a[0]);
    c[0] = new Uint8Array(1);
    c[0] = P.index(Flag.C) << 7;
    P.setFlag(Flag.C, p[0] & 0x01);
    this.tick();
    this.upd_nz(this.wr(a[0], c[0] | (p[0] >> 1)));
}

CPU.prototype.DEC = function(m){
    // var a = new Uint16Array(1);
    // var p = new Uint8Array(1);
    reg_u16[0] = m();
    reg_u8[0]  = this.rd(reg_u16[0]);
    this.tick();
    this.upd_nz(this.wr(reg_u16[0], --reg_u8[0]));
}

CPU.prototype.INC = function(m){
    // var a = new Uint16Array(1);
    // var p = new Uint8Array(1);
    reg_u16[0] = m();
    reg_u8[0] = this.rd(reg_u16[0]);
    this.tick();
    this.upd_nz(this.wr(reg_u16[0], ++reg_u8[0]));
}

CPU.prototype.dec = function(r){
    r[0] = r[0] - 1;
    this.upd_nz(r[0]);
    this.tick();
}

CPU.prototype.inc = function(r){
    r[0] = r[0] + 1;
    this.upd_nz(r[0]);
    this.tick();
}


CPU.prototype.ASL_A = function(){
    P.setFlag(Flag.C, A[0] & 0x80);
    A[0] = A[0] <<= 1;
    this.upd_nz(A[0]);  
    this.tick();
}

CPU.prototype.LSR_A = function(){
    P.setFlag(Flag.C, A[0] & 0x01);
    A[0] = A[0] >> 1;
    this.upd_nz(A[0]);  this.tick();
}

CPU.prototype.ROL_A = function(){
    var c = P.index(Flag.C);
    P.setFlag(Flag.C, A[0] & 0x80);
    A[0] = A[0] << 1
    A[0] = (A[0] | c)
    this.upd_nz(A[0]);
    this.tick();
}

CPU.prototype.ROR_A = function(){
    var c = (P.index(Flag.C) << 7) & 0xFF;
    P.setFlag(Flag.C, A[0] & 0x01);
    A[0] = A[0] >> 1;
    this.upd_nz(A[0] = ( c | A[0]));
    this.tick();
}

CPU.prototype.tr = function(s, d){
    d[0] = s[0];
    this.upd_nz(d[0]);
    this.tick();
}

CPU.prototype.tr_X_S = function(){
    S[0] = X[0];
    this.tick();
}

CPU.prototype.PLP = function(){
    this.tick();
    this.tick();
    var a = this.pop();
    P.set(a);
}

CPU.prototype.PHP = function(){
    this.tick();
    this.push(P.get() | (1 << 4));
}

CPU.prototype.PLA = function(){
    this.tick();
    this.tick();
    A[0] = this.pop();
    this.upd_nz(A[0]);
}

CPU.prototype.PHA= function(){
    this.tick();
    this.push(A[0]);
}

CPU.prototype.br = function(f, v){
    reg_i8[0] = this.rd(this.imm());
    // console.log("P.j", P.index(f), f)
    if (P.index(f) == v){
        this.tick();
        PC[0] += reg_i8[0];
    }
}

CPU.prototype.JMP_IND = function(){
    reg_u16[0] = this.rd16(this.imm16());
    PC[0] = this.rd16_d(reg_u16[0], (reg_u16[0]&0xFF00) | ((reg_u16[0]+1) % 0x100));
}

CPU.prototype.JMP = function(){
    PC[0] = this.rd16(this.imm16());
}

CPU.prototype.JSR = function(){
    var t = PC[0] + 1;
    this.tick();
    this.push(t >> 8); 
    this.push(t);
    PC[0] = this.rd16(this.imm16());
}

CPU.prototype.RTS = function(){
    this.tick();
    this.tick();
    PC[0] = (this.pop() | (this.pop() << 8)) + 1; 
    this.tick();
}

CPU.prototype.RTI = function(){
    this.PLP();
    var t1 = this.pop();
    var t2 = this.pop() << 8;
    PC[0] = t1 | (t2);
}

CPU.prototype.flag = function(f, v){
    P.setFlag(f, v);
    this.tick();
}

CPU.prototype.INT = function(t){
    this.tick();
   
    if (t != IntType.BRK){
        this.tick();
    }

    if (t != IntType.REST)
    {
        this.push(PC[0] >> 8);
        this.push(PC[0] & 0xFF);
        this.push(P.get() | ((t == IntType.BRK) << 4));
    }
    else {
        S[0] -= 3;
        this.tick();
        this.tick();
        this.tick();
    }

    P.setFlag(Flag.I, true);
    //          NMI     Reset   IRQ     BRK
    let vect = [0xFFFA, 0xFFFC, 0xFFFE, 0xFFFE];

    PC[0] = this.rd16(vect[t]);
    if (t == IntType.NMI) this.nmi = false;
}

CPU.prototype.NOP = function(){
    this.tick();
}

var count = 0;
CPU.prototype.exec = function(){
    // this.nes.ppu.debugPixels()
    // this.nes.ppu.debugInfo();
    // this.debugInfo()
    switch (this.rd(PC[0]++))  // Fetch the opcode.
    {
        // Select the right function to emulate the instruction:
        case 0x00: return this.INT(IntType.BRK)  ;  case 0x01: return this.ORA(this.izx.bind(this));
        case 0x05: return this.ORA(this.zp.bind(this))   ;  case 0x06: return this.ASL(this.zp.bind(this))   ;
        case 0x08: return this.PHP()       ;  case 0x09: return this.ORA(this.imm.bind(this))  ;
        case 0x0A: return this.ASL_A()     ;  case 0x0D: return this.ORA(this.abs.bind(this))  ;
        case 0x0E: return this.ASL(this.abs.bind(this))  ;  case 0x10: return this.br(Flag.N, 0)   ;
        case 0x11: return this.ORA(this.izy.bind(this))  ;  case 0x15: return this.ORA(this.zpx.bind(this))  ;
        case 0x16: return this.ASL(this.zpx.bind(this))  ;  case 0x18: return this.flag(Flag.C, 0) ;
        case 0x19: return this.ORA(this.aby.bind(this))  ;  case 0x1D: return this.ORA(this.abx.bind(this))  ;
        case 0x1E: return this.ASL(this._abx.bind(this)) ;  case 0x20: return this.JSR()       ;
        case 0x21: return this.AND(this.izx.bind(this))  ;  case 0x24: return this.BIT(this.zp.bind(this))   ;
        case 0x25: return this.AND(this.zp.bind(this))   ;  case 0x26: return this.ROL(this.zp.bind(this))   ;
        case 0x28: return this.PLP()       ;  case 0x29: return this.AND(this.imm.bind(this))  ;
        case 0x2A: return this.ROL_A()     ;  case 0x2C: return this.BIT(this.abs.bind(this))  ;
        case 0x2D: return this.AND(this.abs.bind(this))  ;  case 0x2E: return this.ROL(this.abs.bind(this))  ;
        case 0x30: return this.br(Flag.N, 1)   ;  case 0x31: return this.AND(this.izy.bind(this))  ;
        case 0x35: return this.AND(this.zpx.bind(this))  ;  case 0x36: return this.ROL(this.zpx.bind(this))  ;
        case 0x38: return this.flag(Flag.C, 1) ;  case 0x39: return this.AND(this.aby.bind(this))  ;
        case 0x3D: return this.AND(this.abx.bind(this))  ;  case 0x3E: return this.ROL(this._abx.bind(this)) ;
        case 0x40: return this.RTI()       ;  case 0x41: return this.EOR(this.izx.bind(this))  ;
        case 0x45: return this.EOR(this.zp.bind(this))   ;  case 0x46: return this.LSR(this.zp.bind(this))   ;
        case 0x48: return this.PHA()       ;  case 0x49: return this.EOR(this.imm.bind(this))  ;
        case 0x4A: return this.LSR_A()     ;  case 0x4C: return this.JMP()       ;
        case 0x4D: return this.EOR(this.abs.bind(this))  ;  case 0x4E: return this.LSR(this.abs.bind(this))  ;
        case 0x50: return this.br(Flag.V, 0)   ;  case 0x51: return this.EOR(this.izy.bind(this))  ;
        case 0x55: return this.EOR(this.zpx.bind(this))  ;  case 0x56: return this.LSR(this.zpx.bind(this))  ;
        case 0x58: return this.flag(Flag.I, 0) ;  case 0x59: return this.EOR(this.aby.bind(this))  ;
        case 0x5D: return this.EOR(this.abx.bind(this))  ;  case 0x5E: return this.LSR(this._abx.bind(this)) ;
        case 0x60: return this.RTS()       ;  case 0x61: return this.ADC(this.izx.bind(this))  ;
        case 0x65: return this.ADC(this.zp.bind(this))   ;  case 0x66: return this.ROR(this.zp.bind(this))   ;
        case 0x68: return this.PLA()       ;  case 0x69: return this.ADC(this.imm)  ;
        case 0x6A: return this.ROR_A()     ;  case 0x6C: return this.JMP_IND()   ;
        case 0x6D: return this.ADC(this.abs.bind(this))  ;  case 0x6E: return this.ROR(this.abs.bind(this))  ;
        case 0x70: return this.br(Flag.V, 1)   ;  case 0x71: return this.ADC(this.izy.bind(this))  ;
        case 0x75: return this.ADC(this.zpx.bind(this))  ;  case 0x76: return this.ROR(this.zpx)  ;
        case 0x78: return this.flag(Flag.I, 1) ;  case 0x79: return this.ADC(this.aby.bind(this))  ;
        case 0x7D: return this.ADC(this.abx.bind(this))  ;  case 0x7E: return this.ROR(this._abx.bind(this)) ;
        case 0x81: return this.st(A[0], this.izx.bind(this)) ;  case 0x84: return this.st(Y[0], this.zp.bind(this))  ;
        case 0x85: return this.st(A[0], this.zp.bind(this))  ;  case 0x86: return this.st(X[0], this.zp.bind(this))  ;
        case 0x88: return this.dec(Y)    ;  case 0x8A: return this.tr(X, A)   ;
        case 0x8C: return this.st(Y[0], this.abs.bind(this)) ;  case 0x8D: return this.st(A[0], this.abs.bind(this)) ;
        case 0x8E: return this.st(X[0], this.abs.bind(this)) ;  case 0x90: return this.br(Flag.C, 0)   ;
        case 0x91: return this.st_A_izy();  case 0x94: return this.st(Y[0], this.zpx.bind(this)) ;
        case 0x95: return this.st(A[0], this.zpx.bind(this)) ;  case 0x96: return this.st(X[0], this.zpy.bind(this)) ;
        case 0x98: return this.tr(Y, A)   ;  case 0x99: return this.st_A_aby();
        case 0x9A: return this.tr(X, S)   ;  case 0x9D: return this.st_A_abx();
        case 0xA0: return this.ld(Y, this.imm.bind(this)) ;  case 0xA1: return this.ld(A, this.izx.bind(this)) ;
        case 0xA2: return this.ld(X, this.imm.bind(this)) ;  case 0xA4: return this.ld(Y, this.zp.bind(this))  ;
        case 0xA5: return this.ld(A, this.zp.bind(this))  ;  case 0xA6: return this.ld(X, this.zp.bind(this))  ;
        case 0xA8: return this.tr(A, Y)   ;  case 0xA9: return this.ld(A, this.imm.bind(this)) ;
        case 0xAA: return this.tr(A, X)   ;  case 0xAC: return this.ld(Y, this.abs.bind(this)) ;
        case 0xAD: return this.ld(A, this.abs.bind(this)) ;  case 0xAE: return this.ld(X, this.abs.bind(this)) ;
        case 0xB0: return this.br(Flag.C, 1)   ;  case 0xB1: return this.ld(A, this.izy.bind(this)) ;
        case 0xB4: return this.ld(Y, this.zpx.bind(this)) ;  case 0xB5: return this.ld(A, this.zpx.bind(this)) ;
        case 0xB6: return this.ld(X, this.zpy.bind(this)) ;  case 0xB8: return this.flag(Flag.V, 0) ;
        case 0xB9: return this.ld(A, this.aby.bind(this)) ;  case 0xBA: return this.tr(S, X)   ;
        case 0xBC: return this.ld(Y, this.abx.bind(this)) ;  case 0xBD: return this.ld(A, this.abx.bind(this)) ;
        case 0xBE: return this.ld(X, this.aby.bind(this)) ;  case 0xC0: return this.cmp(Y[0], this.imm.bind(this));
        case 0xC1: return this.cmp(A[0], this.izx.bind(this));  case 0xC4: return this.cmp(Y[0], this.zp.bind(this)) ;
        case 0xC5: return this.cmp(A[0], this.zp.bind(this)) ;  case 0xC6: return this.DEC(this.zp.bind(this))   ;
        case 0xC8: return this.inc(Y)    ;  case 0xC9: return this.cmp(A[0], this.imm.bind(this));
        case 0xCA: return this.dec(X)    ;  case 0xCC: return this.cmp(Y[0], this.abs.bind(this));
        case 0xCD: return this.cmp(A[0], this.abs.bind(this));  case 0xCE: return this.DEC(this.abs.bind(this))  ;
        case 0xD0: return this.br(Flag.Z, 0)   ;  case 0xD1: return this.cmp(A[0], this.izy.bind(this));
        case 0xD5: return this.cmp(A[0], this.zpx.bind(this));  case 0xD6: return this.DEC(this.zpx.bind(this))  ;
        case 0xD8: return this.flag(Flag.D, 0) ;  case 0xD9: return this.cmp(A[0], this.aby.bind(this));
        case 0xDD: return this.cmp(A[0], this.abx.bind(this));  case 0xDE: return this.DEC(this._abx.bind(this)) ;
        case 0xE0: return this.cmp(X[0], this.imm.bind(this));  case 0xE1: return this.SBC(this.izx.bind(this))  ;
        case 0xE4: return this.cmp(X[0], this.zp.bind(this)) ;  case 0xE5: return this.SBC(this.zp.bind(this))   ;
        case 0xE6: return this.INC(this.zp.bind(this))   ;  case 0xE8: return this.inc(X)    ;
        case 0xE9: return this.SBC(this.imm)  ;  case 0xEA: return this.NOP()       ;
        case 0xEC: return this.cmp(X[0], this.abs.bind(this));  case 0xED: return this.SBC(this.abs.bind(this))  ;
        case 0xEE: return this.INC(this.abs.bind(this))  ;  case 0xF0: return this.br(Flag.Z, 1)   ;
        case 0xF1: return this.SBC(this.izy.bind(this))  ;  case 0xF5: return this.SBC(this.zpx.bind(this))  ;
        case 0xF6: return this.INC(this.zpx.bind(this))  ;  case 0xF8: return this.flag(Flag.D, 1) ;
        case 0xF9: return this.SBC(this.aby.bind(this))  ;  case 0xFD: return this.SBC(this.abx.bind(this))  ;
        case 0xFE: return this.INC(this._abx.bind(this)) ;
        default:
        {
          console.log("Invalid OPcode! PC:",  PC[0],  " OOP:", this.rd(PC[0]-1) )
          return this.NOP();
        }
    }
}


CPU.prototype.power = function(){
    this.remaininhCycles = 0;
    P.set(0x04);
    A[0] = 0;
    X[0] = 0;
    Y[0] = 0;
    S[0] = 0;
    ram.fill(0xFF);
    this.nmi = false;
    this.irq = false;
    this.INT(IntType.REST);
}


CPU.prototype.run_frame = function(){
    this.remaininhCycles += TOTAL_CYCLES;
    while (this.remaininhCycles > 0){
        if (this.nmi) this.INT(IntType.NMI);
        else if (this.irq && P.index(Flag.I)) this.INT(IntType.IRQ);
        this.exec();
    }
    // console.log("index", PC[0])
    // console.log("test:", count)
    // this.nes.ppu.debugPixels()
    // this.nes.ppu.debugInfo();
    // this.debugInfo()
}

module.exports = CPU

