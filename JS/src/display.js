function Display(gl) {
    this.gl = gl
}

Display.prototype.createShader = function(gl, type, sourceCode) {
    // 编译着色器类型：顶点着色器及片元着色器。
    var gl  = this.gl
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var info = gl.getShaderInfoLog(shader);
      console.log("无法编译 WebGL 程序。 \n\n" + info);
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  

Display.prototype.initShader = function (vshader, fshader) {
    // 创建着色器对象
    var vertexShader = this.createShader(this.gl, this.gl.VERTEX_SHADER, vshader);
    var fragmentShader = this.createShader(this.gl, this.gl.FRAGMENT_SHADER, fshader);
    if (!vertexShader || !fragmentShader) {
        return null;
    }

    // 创建编程对象
    var program = this.gl.createProgram();
    if (!program) {
        return null;
    }

    // 赋值已创建的着色器对象
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);

    // 连接编程对象
    this.gl.linkProgram(program);

    // 检查链接结果
    var linked = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
    if (!linked) {
        var error = this.gl.getProgramInfoLog(program);
        console.log('链接程序失败：' + error);
        this.gl.deleteProgram(program);
        this.gl.deleteShader(fragmentShader);
        this.gl.deleteShader(vertexShader);
        return null;
    }

    this.gl.useProgram(program);
    this.program = program;
}

Display.prototype.draw = function(frame){
    var gl = this.gl
  this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  this.gl.clear(gl.COLOR_BUFFER_BIT);

  var program = this.program
  // look up where the vertex data needs to go.
  var positionLocation = this.gl.getAttribLocation(program, "a_position");
  // var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

  // lookup uniforms
  var matrixLocation = this.gl.getUniformLocation(program, "u_matrix");
  var textureLocation = this.gl.getUniformLocation(program, "u_texture");

  // Create a buffer.
    var positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
  // Put a unit quad in the buffer
  var positions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW)
  this.gl.enableVertexAttribArray(positionLocation);
  this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

  var framebuffer = new Uint8Array(frame.buffer)
  // console.log(frame, framebuffer)
  // 绑定新的纹理
  this.createSolidTexture(this.gl, framebuffer)
  var dstX = 0;
  var dstY = 0;
  var dstWidth = this.gl.canvas.width
  var dstHeight = this.gl.canvas.height

  // convert dst pixel coords to clipspace coords      
  var clipX =       dstX / this.gl.canvas.width * 2 - 1;
  var clipY =       dstY / this.gl.canvas.height * -2 + 1;
  var clipWidth =   dstWidth / this.gl.canvas.width * 2;
  var clipHeight =   dstHeight / this.gl.canvas.height * -2;

  this.gl.uniformMatrix3fv(matrixLocation, false, [
    clipWidth, 0, 0,
    0, clipHeight, 0,
    clipX, clipY, 1,
  ]);

  
  // Draw the rectangle.
  this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  // console.log("draw frame", gl.canvas.width, gl.canvas.height, "A")
}

Display.prototype.createSolidTexture = function(gl,data) {
  var texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
}

Display.prototype.init = function () {
    var VSHADER_SOURCE = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform mat3 u_matrix;
    varying vec2 v_texCoord;
      void main() {
          gl_Position = vec4(u_matrix * vec3(a_position, 1), 1);
          v_texCoord = a_position;
      }
   `
    var FSHADER_SOURCE = `
    precision mediump float;
    uniform sampler2D u_image;
    varying vec2 v_texCoord;

    void main() {
        gl_FragColor = texture2D(u_image, v_texCoord);
    } 
  `
  this.initShader(VSHADER_SOURCE, FSHADER_SOURCE);
  // 清除颜色和深度缓存
  this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  console.log("GL init")
}


module.exports = Display