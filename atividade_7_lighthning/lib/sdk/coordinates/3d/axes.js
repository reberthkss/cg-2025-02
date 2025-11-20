function defineCoordinateAxes(){
    return new Float32Array([
      // X axis
      -1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      // Y axis
      0.0, -1.0, 0.0,
      0.0, 1.0, 0.0,
      // Z axis
      0.0, 0.0, -1.0,
      0.0, 0.0, 1.0,
    ]);
}

function defineCoordinateAxesColors(){
    return new Float32Array([
      // X axis
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      // Y axis
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
      // Z axis
      1.0, 0.0, 0.0,
      1.0, 0.0, 0.0,
    ]);
}

function drawCoordinateAxes(VertexBuffer, ColorBuffer, coordinateAxes, coordinateAxesColors, gl, positionLocation, colorLocation, modelViewMatrix, viewingMatrix, projectionMatrix, modelViewMatrixUniformLocation, viewingMatrixUniformLocation, projectionMatrixUniformLocation){
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, coordinateAxes, gl.STATIC_DRAW);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(colorLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, coordinateAxesColors, gl.STATIC_DRAW);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
      
      modelViewMatrix = m4.identity();

      gl.uniformMatrix4fv(modelViewMatrixUniformLocation,false,modelViewMatrix);
      gl.uniformMatrix4fv(viewingMatrixUniformLocation,false,viewingMatrix);
      gl.uniformMatrix4fv(projectionMatrixUniformLocation,false,projectionMatrix);

      gl.drawArrays(gl.LINES, 0, 6);
    }