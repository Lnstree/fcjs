var Scanline = {VISIBLE:0, POST:1, NMI:2, PRE:3}
var Mirroring = { VERTICAL:0, HORIZONTAL:1}

// var nesRgb =
// [ 0x7C7C7CFF, 0x0000FCFF, 0x0000BCFF, 0x4428BCFF, 0x940084FF, 0xA80020FF, 0xA81000FF, 0x881400FF,
//   0x503000FF, 0x007800FF, 0x006800FF, 0x005800FF, 0x004058FF, 0x000000FF, 0x000000FF, 0x000000FF,
//   0xBCBCBCFF, 0x0078F8FF, 0x0058F8FF, 0x6844FCFF, 0xD800CCFF, 0xE40058FF, 0xF83800FF, 0xE45C10FF,
//   0xAC7C00FF, 0x00B800FF, 0x00A800FF, 0x00A844FF, 0x008888FF, 0x000000FF, 0x000000FF, 0x000000FF,
//   0xF8F8F8FF, 0x3CBCFCFF, 0x6888FCFF, 0x9878F8FF, 0xF878F8FF, 0xF85898FF, 0xF87858FF, 0xFCA044FF,
//   0xF8B800FF, 0xB8F818FF, 0x58D854FF, 0x58F898FF, 0x00E8D8FF, 0x787878FF, 0x000000FF, 0x000000FF,
//   0xFCFCFCFF, 0xA4E4FCFF, 0xB8B8F8FF, 0xD8B8F8FF, 0xF8B8F8FF, 0xF8A4C0FF, 0xF0D0B0FF, 0xFCE0A8FF,
//   0xF8D878FF, 0xD8F878FF, 0xB8F8B8FF, 0xB8F8D8FF, 0x00FCFCFF, 0xF8D8F8FF, 0x000000FF, 0x000000FF ];


  var nesRgb = [
  0xFF7C7C7C,0xFFFC0000,0xFFBC0000,0xFFBC2844,0xFF840094,0xFF2000A8,0xFF0010A8,0xFF001488,
  0xFF003050,0xFF007800,0xFF006800,0xFF005800,0xFF584000,0xFF000000,0xFF000000,0xFF000000,
  0xFFBCBCBC,0xFFF87800,0xFFF85800,0xFFFC4468,0xFFCC00D8,0xFF5800E4,0xFF0038F8,0xFF105CE4,
  0xFF007CAC,0xFF00B800,0xFF00A800,0xFF44A800,0xFF888800,0xFF000000,0xFF000000,0xFF000000,
  0xFFF8F8F8,0xFFFCBC3C,0xFFFC8868,0xFFF87898,0xFFF878F8,0xFF9858F8,0xFF5878F8,0xFF44A0FC,
  0xFF00B8F8,0xFF18F8B8,0xFF54D858,0xFF98F858,0xFFD8E800,0xFF787878,0xFF000000,0xFF000000,
  0xFFFCFCFC,0xFFFCE4A4,0xFFF8B8B8,0xFFF8B8D8,0xFFF8B8F8,0xFFC0A4F8,0xFFB0D0F0,0xFFA8E0FC,
  0xFF78D8F8,0xFF78F8D8,0xFFB8F8B8,0xFFD8F8B8,0xFFFCFC00,0xFFF8D8F8,0xFF000000,0xFF000000];
// var nesRgb =
// [ 0x7C7C7C, 0x0000FC, 0x0000BC, 0x4428BC, 0x940084, 0xA80020, 0xA81000, 0x881400,
//   0x503000, 0x007800, 0x006800, 0x005800, 0x004058, 0x000000, 0x000000, 0x000000,
//   0xBCBCBC, 0x0078F8, 0x0058F8, 0x6844FC, 0xD800CC, 0xE40058, 0xF83800, 0xE45C10,
//   0xAC7C00, 0x00B800, 0x00A800, 0x00A844, 0x008888, 0x000000, 0x000000, 0x000000,
//   0xF8F8F8, 0x3CBCFC, 0x6888FC, 0x9878F8, 0xF878F8, 0xF85898, 0xF87858, 0xFCA044,
//   0xF8B800, 0xB8F818, 0x58D854, 0x58F898, 0x00E8D8, 0x787878, 0x000000, 0x000000,
//   0xFCFCFC, 0xA4E4FC, 0xB8B8F8, 0xD8B8F8, 0xF8B8F8, 0xF8A4C0, 0xF0D0B0, 0xFCE0A8,
//   0xF8D878, 0xD8F878, 0xB8F8B8, 0xB8F8D8, 0x00FCFC, 0xF8D8F8, 0x000000, 0x000000 ];

var Sprite    = function(){
    this.id   = new Uint8Array(1)
    this.x    = new Uint8Array(1)
    this.y    =  new Uint8Array(1)
    this.tile = new Uint8Array(1)
    this.attr = new Uint8Array(1)
    this.dataL = new Uint8Array(1)
    this.dataH = new Uint8Array(1)
}

Sprite.prototype.copy = function(item){
    this.id[0] = item.id[0]
    this.x[0]  = item.x[0]
    this.y[0]  = item.y[0]
    this.tile[0] = item.tile[0]
    this.attr[0] = item.attr[0]
    this.dataL[0] = item.dataL[0]
    this.dataH[0] = item.dataH[0]
}


var Ctrl = function(){
    this.data = 0
    // this.nt = 2 
    // this.incr = 1
    // this.sprTbl = 1
    // this.bgTbl  = 1
    // this.sprSz  = 1
    // this.slave  = 1
    // this.nmi    = 1
    // this.r      = 8
}

Ctrl.prototype.set_nt = function(v){
    v &= 0x3;
    this.data &= ~(0x3);
    this.data |= v;
}
 
Ctrl.prototype.get_nt = function(v){
    return this.data & 0x3;
}

Ctrl.prototype.set_incr = function(v){
    this.data &= ~(0x4);
    this.data |= v << 2;
}

Ctrl.prototype.get_incr = function(){
    return (this.data & 0x4) >> 2;
}

Ctrl.prototype.set_sprTbl = function(v){
    this.data &= ~(0x8);
    this.data |= v << 3;
}

Ctrl.prototype.get_sprTbl = function(){
    return (this.data & 0x8) >> 3;
}

Ctrl.prototype.set_bgTbl = function(v){
    data &= ~(0x10);
    data |= v << 4;
}

Ctrl.prototype.get_bgTbl =function(){
    return (this.data & 0x10) >> 4;
}


Ctrl.prototype.set_sprSz = function(v){
    this.data &= ~(0x20);
    this.data |= v << 5;
}

Ctrl.prototype.get_sprSz =function(){
    return (this.data & 0x20) >> 5;
}

Ctrl.prototype.set_slave = function(v){
    this.data &= ~(0x40);
    this.data |= v << 6;
}

Ctrl.prototype.get_slave =function(){
    return (v & 0x20) >> 6;
}

Ctrl.prototype.set_nmi= function(v){
    this.data &= ~(0x80);
    this.data |= v << 7;
}

Ctrl.prototype.get_nmi=function(){
    return (this.data & 0x80) >> 7;
}

Ctrl.prototype.set_r = function(v){
    this.data = v;
}

Ctrl.prototype.get_r = function(v){
    return this.data;
}



var Mask = function(){
    // struct
    // {
    //     unsigned gray    : 1;  // Grayscale.
    //     unsigned bgLeft  : 1;  // Show background in leftmost 8 pixels.
    //     unsigned sprLeft : 1;  // Show sprite in leftmost 8 pixels.
    //     unsigned bg      : 1;  // Show background.
    //     unsigned spr     : 1;  // Show sprites.
    //     unsigned red     : 1;  // Intensify reds.
    //     unsigned green   : 1;  // Intensify greens.
    //     unsigned blue    : 1;  // Intensify blues.
    // };
    // u8 r;
    this.data = 0;
}

Mask.prototype.set_gray = function(v){
    this.data &= ~(0x1);
    this.data |= v;
}
 
Mask.prototype.get_gray = function(v){
    return this.data & 0x1;
}

Mask.prototype.set_bgLeft = function(v){
    this.data &= ~(0x2);
    this.data |= v << 1;
}

Mask.prototype.get_bgLeft = function(){
    return (this.data & 0x2) >> 1;
}

Mask.prototype.set_sprLeft = function(v){
    this.data &= ~(0x4);
    this.data |= v << 2;
}

Mask.prototype.get_sprLeft = function(){
    return (this.data & 0x4) >> 2;
}

Mask.prototype.set_bg= function(v){
    this.data &= ~(0x8);
    this.data |= v << 3;
}

Mask.prototype.get_bg= function(){
    return (this.data & 0x8) >> 3;
}

Mask.prototype.set_spr= function(v){
    data &= ~(0x10);
    data |= v << 4;
}

Mask.prototype.get_spr=function(){
    return (this.data & 0x10) >> 4;
}


Mask.prototype.set_red= function(v){
    this.data &= ~(0x20);
    this.data |= v << 5;
}

Mask.prototype.get_red=function(){
    return (this.data & 0x20) >> 5;
}

Mask.prototype.set_green= function(v){
    this.data &= ~(0x40);
    this.data |= v << 6;
}

Mask.prototype.get_green=function(){
    return (v & 0x40) >> 6;
}

Mask.prototype.set_blue= function(v){
    this.data &= ~(0x80);
    this.data |= v << 7;
}

Mask.prototype.get_blue=function(){
    return (this.data & 0x80) >> 7;
}

Mask.prototype.set_r = function(v){
    this.data = v;
}

Mask.prototype.get_r = function(v){
    return this.data;
}

var Status = function(){
    /*  struct
    {
        unsigned bus    : 5;  // Not significant.
        unsigned sprOvf : 1;  // Sprite overflow.
        unsigned sprHit : 1;  // Sprite 0 Hit.
        unsigned vBlank : 1;  // In VBlank?
    };
    u8 r;
    */
    this.data = 0;
}

Status.prototype.set_bus = function(v){
    v &= 0x1F;
    this.data &= ~(v  & 0x1F);
    this.data |= v;
}

Status.prototype.get_bus = function(){
    return this.data & 0x1F;
}

Status.prototype.set_sprOvf = function(v){
    this.data &= ~(0x20)
    this.data |= v << 5;
}

Status.prototype.get_sprOvf = function(v){
    return (this.data & 0x20) >> 5;
}

Status.prototype.set_sprHit = function(v){
    this.data &= ~(0x40)
    this.data |= v << 6;
}

Status.prototype.get_sprHit = function(v){
    return (this.data & 0x40) >> 6;
}

Status.prototype.get_vBlank = function(v){
    return (this.data & 0x80) >> 7;
}

Status.prototype.set_vBlank = function(v){
    this.data &= ~(0x80)
    this.data |= v << 7;
};

Status.prototype.get_r = function(){
    return this.data;
}

Status.prototype.set_r = function(v){
    this.data = v;
}


var Addr  = function(){
    this.data = 0;
    // struct
    // {
    //     unsigned cX : 5;  // Coarse X.
    //     unsigned cY : 5;  // Coarse Y.
    //     unsigned nt : 2;  // Nametable.
    //     unsigned fY : 3;  // Fine Y.
    // };
    // struct
    // {
    //     unsigned l : 8;
    //     unsigned h : 7;
    // };
    // unsigned addr : 14;
    // unsigned r : 15;
}


Addr.prototype.set_cX = function(v){
    v &= 0x1F;
    this.data &= ~(0x1F);
    this.data |= v;
}

Addr.prototype.get_cX = function(v){
    return this.data & 0x1F;
}

Addr.prototype.set_cY = function(v){
    this.data &= ~(0x3E0);
    this.data |= (v << 5) & 0x3E0;
}

Addr.prototype.get_cY = function(){
    return (this.data & 0x3E0) >> 5;
}

Addr.prototype.set_nt = function(v){
    this.data &= ~(0xC00);
    this.data |= (v << 10) & 0xC00;
}

Addr.prototype.get_nt = function(){
    return (this.data & 0xC00) >> 10
}

Addr.prototype.set_fY = function(v){
    this.data &= ~(0x7000);
    this.data |= (v << 12) & 0x7000;
}

Addr.prototype.get_fY = function(){
    return (this.data  & 0x7000) >> 12;
}

Addr.prototype.set_l = function(v){
    v &= 0xFF;
    this.data &= ~(0xFF);
    this.data |= v;
}

Addr.prototype.get_l = function(v){
    return this.data & 0xFF;
}


Addr.prototype.set_h = function(v){
    this.data &= ~(0x7F00)
    this.data |= (v << 8) & 0x7F00;
}

Addr.prototype.get_h = function(){
    return (this.data & 0x7F00) >> 8;
}

Addr.prototype.set_addr = function(v){
    v &= 0x3fff;
    this.data &= ~(0x3fff);
    this.data |= v;
}

Addr.prototype.get_addr = function(){
    return this.data & 0x3fff;
}


Addr.prototype.set_r = function(v){
    this.data = v;
}

Addr.prototype.get_r = function(){
    return this.data;
}




/////test

var pixels    = new Uint32Array(256 * 240);
var ciRam     = new Uint8Array(0x800);
var cgRam     = new Uint8Array(0x20);
var oamMem    = new Uint8Array(0x100);

var oam       = new Array(8);
var secOam    = new Array(8);

var vAddr     = new Addr();
var tAddr     = new Addr();
var fX        = 0;
var oamAddr   = new Uint8Array(1);


var ctrl = new Ctrl();
var mask = new Mask();
var status = new Status();

// Background latches
var nt  = 0;
var at  = 0;
var bgL = 0;
var bgH = 0;

// Background shift registers
var atShiftL = new Uint8Array(1);
var atShiftH = new Uint8Array(1);
var bgShiftL = new Uint16Array(1);
var bgShiftH = new Uint16Array(1);

var atLatchL = false;
var atLatchH = false;
var scanline = 0;
var dot = 0;
var frameOdd = 0;
var cycle_addr = 0; 

var addr_VISIBLE = new Uint16Array(1);
var addr_Post = new Uint16Array(1);
var addr_NMI = new Uint16Array(1);
var addr_PRE =new Uint16Array(1);

// var addr_array = new Uint16Array(4)


function rendering(){
    return mask.get_bg() || mask.get_spr();
}

function spr_height(){
    return ctrl.get_sprSz() ? 16 : 8;
}

function nt_addr(){
    return 0x2000 | (vAddr.get_r() & 0xFFF);
}

function at_addr(){
    return 0x23C0 | (vAddr.get_nt() << 10) |  ((vAddr.get_cY() / 4) << 3) | (vAddr.get_cX()/4);
}

function bg_addr(){
    return (ctrl.get_bgTbl() * 0x1000) + (nt * 16) + vAddr.get_fY();
}

function h_scroll(){
    if (!rendering()) return; 
    if (vAddr.get_cX() == 31) 
        vAddr.set_r(vAddr.get_r() ^0x41F);
    else 
        vAddr.set_cX(vAddr.get_cX() + 1);
}

function v_scroll(){
    if (!rendering()) return;
    if (vAddr.get_fY() < 7) vAddr.set_fY(vAddr.get_fY() + 1);
    else 
    {
        vAddr.set_fY(0);
        if (vAddr.get_cY() == 31)  vAddr.set_cY(0);
        else if (vAddr.get_cY() == 29) {
            vAddr.set_cY(0); 
            vAddr.set_nt(vAddr.get_nt() ^ 0x2);
        }
        else {
            vAddr.set_cY(vAddr.get_cY() + 1);
        }
    }
}

function h_update() {
    if (!rendering()) return;
    vAddr.set_r((vAddr.get_r() & ~0x041F)| (tAddr.get_r() & 0x041F));
}

function v_update(){
    if (!rendering()) return;
    vAddr.set_r((vAddr.get_r() & ~0x7BE0) | (tAddr.get_r() & 0x7BE0));
}


function reload_shift(){
    bgShiftL[0] = (bgShiftL[0] & 0xFF00) | bgL;
    bgShiftH[0] = (bgShiftH[0] & 0xFF00) | bgH;

    atLatchL = (at & 1)
    atLatchH = (at & 2)
}


function clear_oam(){
    // console.log("clear")
    for (var i = 0; i <= 8; i++)
    {
        // if (secOam[i] == undefined){
        //     secOam[i] = new Sprite()
        // }
        secOam[i].id[0]    = 64;
        secOam[i].y[0]     = 0xFF;
        secOam[i].tile[0]  = 0xFF;
        secOam[i].attr[0]  = 0xFF;
        secOam[i].x[0]     = 0xFF;
        secOam[i].dataL[0] = 0;
        secOam[i].dataH[0] = 0;
    }
}


function eval_sprites(){
    var n = 0;
    for (var i = 0; i < 64; i++)
    {
        var line = (scanline == 261 ? -1 : scanline) - oamMem[i*4 + 0];
        // If the sprite is in the scanline, copy its properties into secondary OAM:
        if (line >= 0 && line < spr_height())
        {
            // if (secOam[n] == undefined){
            //     secOam[n] = new Sprite();
            // }
            // console.log(secOam, n)
            secOam[n].id[0]   = i;
            secOam[n].y[0]    = oamMem[i*4 + 0];
            secOam[n].tile[0] = oamMem[i*4 + 1];
            secOam[n].attr[0] = oamMem[i*4 + 2];
            secOam[n].x[0]    = oamMem[i*4 + 3];

            if (++n > 8)
            {
                status.set_sprOvf(1);
                break;
            }
        }
    }
}


function  NTH_BIT(x, n) { return ((x) >> (n)) & 1;}

var PPU = function(nes){
    this.nes = nes;
}


PPU.prototype.set_display = function(display){
    this.display = display;
}

PPU.prototype.nt_mirror = function(addr){
    switch(this.mirroring){
        case Mirroring.VERTICAL: return addr % 0x800;
        case Mirroring.HORIZONTAL: return ((addr/2)&0x400) + (addr % 0x400);
        default:  return addr - 0x2000;
    }
}

// PPU.prototype.set_mirroring = function(mode) {
//     this.mirroring = mode;
// }

PPU.prototype.debugInfo = function(){
    console.log("nt:", nt, " at:", at, " bgL:", bgL, " bgH:", bgH, "vAddr:", vAddr.get_r(), "mask:", mask.get_r(), "status:", status.get_r())
    console.log("atShiftL:",atShiftL[0], "atShiftH:", atShiftH[0], "bgShiftL:", bgShiftL[0], "bgShiftH:", bgShiftH[0])
    console.log("atLatchL:",atLatchL > 0, "atLatchH:", atLatchH > 0,  "scanline:", scanline, "dot:", dot, "frameOdd:", frameOdd > 0)
}

PPU.prototype.debugPixels = function(){
    console.log(pixels[0] + "   " +  pixels[1]);
}


PPU.prototype.load_sprites = function(){
    var addr;
    for (var i = 0; i < 8; i++)
    {
        // oam[i] =  JSON.parse(JSON.stringify(secOam[i]));  // Copy secondary OAM into primary.
        // console.log(oam,i)
        oam[i].copy(secOam[i])
        // Different address modes depending on the sprite height:
        if (spr_height() == 16)
            addr = ((oam[i].tile[0] & 1) * 0x1000) + ((oam[i].tile[0] & ~1) * 16);
        else
            addr = ( ctrl.get_sprTbl() * 0x1000) + ( oam[i].tile[0]       * 16);

        var sprY = new Uint8Array(1);
        sprY[0] = (scanline - oam[i].y[0]) % spr_height();  // Line inside the sprite.
        if (oam[i].attr[0] & 0x80) {
            sprY[0] ^= spr_height() - 1;      // Vertical flip.
        }
        // console.log(sprY[0])
        addr += sprY[0] + (sprY[0] & 8);  // Select the second tile if on 8x16.

        oam[i].dataL[0] = this.rd(addr + 0);
        oam[i].dataH[0] = this.rd(addr + 8);
    }
}


PPU.prototype.pixel = function(){
    var palette = new Uint8Array(1);
    var objPalette = new Uint8Array(1);
    var objPriority = 0;

    var x = dot - 2;
    if (scanline < 240 && x >= 0 && x < 256)
    {
        if (mask.get_bg() &&  !(!mask.get_bgLeft() && x < 8))
        {
            // Background:
            palette[0] = (NTH_BIT(bgShiftH[0], 15 - fX) << 1) |
                       NTH_BIT(bgShiftL[0], 15 - fX);
            if (palette[0])
                palette[0] |= ((NTH_BIT(atShiftH[0],  7 - fX) << 1) |
                             NTH_BIT(atShiftL[0],  7 - fX))      << 2;
        }
        // Sprites:
        if (mask.get_spr() && !(!mask.get_sprLeft() && x < 8))
            for (var i = 7; i >= 0; i--)
            {
                if (oam[i].id[0] == 64) continue;  // Void entry.
                var sprX = new Uint8Array(1);
                sprX[0] = x - oam[i].x[0];
                if (sprX[0] >= 8) continue;            // Not in range.


                if (oam[i].attr[0] & 0x40) {
                    sprX[0] ^= 7;  // Horizontal flip.
                }

                var sprPalette = new Uint8Array(1);
                sprPalette[0] = (NTH_BIT(oam[i].dataH[0], 7 - sprX[0]) << 1) |
                                 NTH_BIT(oam[i].dataL[0], 7 - sprX[0]);
                if (sprPalette[0] == 0) continue;  // Transparent pixel.

                if (oam[i].id[0] == 0 && palette[0] && x != 255) {
                    status.set_sprHit(true);
                }
                sprPalette[0] |= (oam[i].attr[0] & 3) << 2;
                objPalette[0]  = sprPalette[0] + 16;
                objPriority = oam[i].attr[0] & 0x20;
            }
        // Evaluate priority:
        if (objPalette[0] && (palette[0] == 0 || objPriority == 0)) {
            palette[0] = objPalette[0];
        }
        var paletteIndex = this.rd(0x3F00 + (rendering() ? palette[0] : 0));
        // console.log(paletteIndex)
        // pixels[scanline*256 + x] = nesRgb[this.rd(0x3F00 + (rendering() ? palette[0] : 0))];
        pixels[scanline*256 + x] = nesRgb[paletteIndex];
    }
    // Perform background shifts:
    bgShiftL[0] <<= 1;
    bgShiftH[0] <<= 1;
    atShiftL[0] = (atShiftL[0] << 1) | (atLatchL > 0)
    atShiftH[0] = (atShiftH[0] << 1) | (atLatchH > 0)
}



PPU.prototype.scanline_cycle = function(s){
    // console.log("s:", s, dot)
    switch(s){
        case Scanline.NMI:
            cycle_addr = addr_NMI; break;
        case Scanline.POST:
            cycle_addr = addr_Post; break;
        case Scanline.VISIBLE:
            cycle_addr = addr_VISIBLE; break;
        case Scanline.PRE:
            cycle_addr = addr_PRE; break;
    }
    // cycle_addr = addr_array[s]

    // console.log(cycle_addr[0])
    if (s == Scanline.NMI && dot == 1) { 
        status.set_vBlank(true); 
        if (ctrl.get_nmi()) this.nes.cpu.set_nmi(); 
    }
    else if (s == Scanline.POST &&  dot == 0){
        if (this.display != undefined){
            this.display.draw(pixels)
        }
    } //NesWindow::setFrame(pixels); //GUI::new_frame(pixels);
    else if (s == Scanline.VISIBLE || s == Scanline.PRE)
    {
        // Sprites:
        switch (dot)
        {
            case   1: clear_oam(); 
            if (s == Scanline.PRE) { 
                status.set_sprOvf(false); 
                status.set_sprHit(false); 
            } break;
            case 257: eval_sprites(); break;
            case 321: this.load_sprites(); break;
        }


        if ((dot >= 2 && dot <= 255) || (dot >= 322 && dot <= 337)){

                this.pixel();
                switch (dot % 8)
                {
                    // Nametable:
                    case 1:  cycle_addr[0]  = nt_addr(); reload_shift(); break;
                    case 2:  nt    = this.rd(cycle_addr[0]);  break;
                    // Attribute:
                    case 3:  cycle_addr[0]  = at_addr(); break;
                    case 4:  at    = this.rd(cycle_addr[0]); 
                             if (vAddr.get_cY() & 2) at >>= 4;
                             if (vAddr.get_cX() & 2) at >>= 2; break;
                    // Background (low bits):
                    case 5:  cycle_addr[0]  = bg_addr(); break;
                    case 6:  bgL   = this.rd(cycle_addr[0]);  break;
                    // Background (high bits):
                    case 7:  cycle_addr[0] += 8;         break;
                    case 0:  bgH   = this.rd(cycle_addr[0]); 
                             h_scroll(); break;
                }
        }
        else if (dot == 256){
            this.pixel(); 
            bgH = this.rd(cycle_addr[0]); 
            v_scroll(); // Vertical bump.
        }
        else if (dot == 257){
            this.pixel();
            reload_shift();
            h_update();
        }
        else if (dot >= 280 && dot <= 304){
            if (s == Scanline.PRE)        
                v_update();
        }else if (dot == 1){
            cycle_addr[0]= nt_addr();
            if (s == Scanline.PRE)
               status.set_vBlank(false);
        }else if (dot == 321 || dot == 339){
            cycle_addr[0] = nt_addr();
        }else if (dot == 338){
            nt = this.rd(cycle_addr[0]);
        }else if (dot == 340){
            nt = this.rd(cycle_addr[0]);
            if (s == Scanline.PRE && rendering() && frameOdd) 
                dot++;
        }
        // Signal scanline to mapper:
        if (dot == 260 && rendering()) this.nes.cartridge.signal_scanline();
    }
}

PPU.prototype.rd = function(addr){
    if (addr <= 0x1FFF){
        return this.nes.cartridge.chr_access(0, addr);
    }else if (addr >= 0x2000 & addr <= 0x3EFF){
        return ciRam[this.nt_mirror(addr)];
    }else if (addr >= 0x3F00 && addr <= 0x3FFF){
        if ((addr & 0x13) == 0x10) {
            addr &= ~0x10;
        }
        return cgRam[addr & 0x1F] & (mask.get_gray() ? 0x30: 0xFF);
    }
    return 0;
}

PPU.prototype.wr = function(addr, v){
    if (addr <= 0x1FFF){
        this.nes.cartridge.chr_access(1, addr, v);
    }else if (addr >= 0x2000 && addr <= 0x3EFF){
        ciRam[this.nt_mirror(addr)] = v;
    }else if (addr >= 0x3F00 && addr <= 0x3FFF){
        if ((addr & 0x13) == 0x10) addr &= ~0x10;
        cgRam[addr & 0x1F] = v;
    }
}

PPU.prototype.step = function(){
    // console.log("scanline:", scanline)
    if (scanline >= 0 && scanline <= 239){
        this.scanline_cycle(Scanline.VISIBLE);
    }
    else if (scanline == 240){
        this.scanline_cycle(Scanline.POST)
    }
    else if (scanline == 241){
        this.scanline_cycle(Scanline.NMI)
    }else if (scanline == 261){
        this.scanline_cycle(Scanline.PRE)
    }
    // Update dot and scanline counters:
    if (++dot > 340)
    {
        dot %= 341;
        if (++scanline > 261)
        {
            scanline = 0;
            frameOdd ^= 1;
        }
    }
}


var w_res = new Uint8Array(1);
var r_res = new Uint8Array(1);
var w_buffer = new Uint8Array(1);
var r_buffer = new Uint8Array(1);
var w_latch  = new Uint8Array(1);
var r_latch  = new Uint8Array(1);

var access_res = 0;
var access_buffer = 0;
var access_latch = 0;

PPU.prototype.access = function(write, index, v){
    // console.log("b:", write, index, v, access_res, status);
    if (write){
        access_res = w_res;
        access_latch = w_latch;
        access_buffer = w_buffer;

        access_res[0] = v;
        switch(index){
            case 0: ctrl.set_r(v); 
                    tAddr.set_nt(ctrl.get_nt()); 
                    break;
            case 1: mask.set_r(v); break;
            case 3: oamAddr[0] = v; break;
            case 4: oamMem[oamAddr[0]++] = v; break;
            case 5:
                if (!access_latch[0]) { fX = v & 7; tAddr.set_cX(v >> 3);}
                else {tAddr.set_fY(v & 7); tAddr.set_cY(v >> 3); }
                access_latch[0] = !access_latch[0]; break;
            case 6:
                if (!access_latch[0]) {tAddr.set_h(v & 0x3F);}
                else {tAddr.set_l(v); vAddr.set_r(tAddr.get_r());}
                access_latch[0] = !access_latch[0]; break;
            case 7:
                this.wr(vAddr.get_addr(), v); 
                vAddr.set_addr(vAddr.get_addr() + (ctrl.get_incr() ? 32 : 1));
        }
    }else{
        access_res = r_res;
        access_latch = r_latch;
        access_buffer = r_buffer;

        switch(index){
            case 2: access_res[0] = (access_res[0] & 0x1F) | status.get_r();  
                    status.set_vBlank(0); access_latch[0] = 0; break;
            case 4: access_res[0] = oamMem[oamAddr[0]]; break;
            case 7:
                if (vAddr.get_addr() <= 0x3EFF){
                    access_res[0] = access_buffer[0];
                    access_buffer[0] = this.rd(vAddr.get_addr());
                }else{
                    access_res[0] = access_buffer[0] = this.rd(vAddr.get_addr())
                }
                vAddr.set_addr(vAddr.get_addr() + (ctrl.get_incr() ? 32 : 1));
        }
    }

    // console.log("a:", write, index, v, access_res, status);
    return access_res[0];
}

PPU.prototype.reset = function(){
    frameOdd = false;
    scanline = dot = 0;
    ctrl.set_r(0);
    mask.set_r(0)
    status.set_r(0);

    pixels.fill(0);
    ciRam.fill(0xFF);
    oamMem.fill(0);

    for (var i = 0; i <= 8; ++i) {
        secOam[i] = new Sprite()
        oam[i] = new Sprite()
    }
    console.log("reset")
}


PPU.prototype.set_mirroring_vertical = function(){
    this.mirroring = Mirroring.VERTICAL;
}

PPU.prototype.set_mirroring_horizontal = function(){
    this.mirroring = Mirroring.HORIZONTAL;
}



module.exports = PPU