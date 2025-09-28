var MATRIX_TRANSFORMATION = {
  identity: function(){
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  },

  multiply: function(a,b){
    var a00 = a[0*3+0];
    var a01 = a[1*3+0];
    var a02 = a[2*3+0];
    var a10 = a[0*3+1];
    var a11 = a[1*3+1];
    var a12 = a[2*3+1];
    var a20 = a[0*3+2];
    var a21 = a[1*3+2];
    var a22 = a[2*3+2];

    var b00 = b[0*3+0];
    var b01 = b[1*3+0];
    var b02 = b[2*3+0];
    var b10 = b[0*3+1];
    var b11 = b[1*3+1];
    var b12 = b[2*3+1];
    var b20 = b[0*3+2];
    var b21 = b[1*3+2];
    var b22 = b[2*3+2];

    return [
      a00*b00+a01*b10+a02*b20,
      a10*b00+a11*b10+a12*b20,
      a20*b00+a21*b10+a22*b20,
      a00*b01+a01*b11+a02*b21,
      a10*b01+a11*b11+a12*b21,
      a20*b01+a21*b11+a22*b21,
      a00*b02+a01*b12+a02*b22,
      a10*b02+a11*b12+a12*b22,
      a20*b02+a21*b12+a22*b22,
    ];
  },

  translation: function(tx,ty){
    return [
      1,  0,  0,
      0,  1,  0,
      tx, ty, 1
    ];
  },

  scaling: function(sx,sy){
    return [
      sx, 0,  0,
      0,  sy, 0,
      0,  0,  1
    ];
  },

  rotation: function(angleInRadians){
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
       c,  s, 0,
      -s,  c, 0,
       0,  0, 1
    ];
  },

  translate: function(m,tx,ty){
    var t = MATRIX_TRANSFORMATION.translation(tx,ty);
    return MATRIX_TRANSFORMATION.multiply(t,m);
  },

  scale: function(m,sx,sy){
    var s = MATRIX_TRANSFORMATION.scaling(sx,sy);
    return MATRIX_TRANSFORMATION.multiply(s,m);
  },

  rotate: function(m,angleInRadians){
    var r = MATRIX_TRANSFORMATION.rotation(angleInRadians);
    return MATRIX_TRANSFORMATION.multiply(r,m);
  }
};