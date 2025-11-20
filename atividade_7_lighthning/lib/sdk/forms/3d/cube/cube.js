function setCubeVertices(side){
  let v = side/2;
  return new Float32Array([
      // Front
      v, v, v,
      v, -v, v,
      -v, v, v,
      -v, v, v,
      v, -v, v,
      -v, -v, v,
  
      // Left
      -v, v, v,
      -v, -v, v,
      -v, v, -v,
      -v, v, -v,
      -v, -v, v,
      -v, -v, -v,
  
      // Back
      -v, v, -v,
      -v, -v, -v,
      v, v, -v,
      v, v, -v,
      -v, -v, -v,
      v, -v, -v,
  
      // Right
      v, v, -v,
      v, -v, -v,
      v, v, v,
      v, v, v,
      v, -v, v,
      v, -v, -v,
  
      // Top
      v, v, v,
      v, v, -v,
      -v, v, v,
      -v, v, v,
      v, v, -v,
      -v, v, -v,
  
      // Bottom
      v, -v, v,
      v, -v, -v,
      -v, -v, v,
      -v, -v, v,
      v, -v, -v,
      -v, -v, -v,
  ]);
}

function setCubeColors(){
  let colors = [];
  let color = [];
  for(let i=0;i<6;i++){
    color = [Math.random(),Math.random(),Math.random()];
    for(let j=0;j<6;j++)
      colors.push(...color);
  }

  return new Float32Array(colors);
}


function drawCube(VertexBuffer, ColorBuffer, NormalBuffer, cubeVertices, cubeColors, cubeNormals, gl, positionLocation, colorLocation, normalLocation, modelViewMatrix, viewingMatrix, projectionMatrix, modelViewMatrixUniformLocation, viewingMatrixUniformLocation, projectionMatrixUniformLocation, theta, tx, ty, tz, P0, viewPositionUniformLocation, lightPositionUniformLocation){
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  
      gl.enableVertexAttribArray(colorLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(normalLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, NormalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cubeNormals, gl.STATIC_DRAW);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
      
      modelViewMatrix = m4.identity();
      modelViewMatrix = m4.yRotate(modelViewMatrix,degToRad(theta));
      modelViewMatrix = m4.translate(modelViewMatrix,tx,ty,tz);

      gl.uniformMatrix4fv(modelViewMatrixUniformLocation,false,modelViewMatrix);
      gl.uniformMatrix4fv(viewingMatrixUniformLocation,false,viewingMatrix);
      gl.uniformMatrix4fv(projectionMatrixUniformLocation,false,projectionMatrix);

      gl.uniform3fv(viewPositionUniformLocation, new Float32Array(P0));
      gl.uniform3fv(lightPositionUniformLocation, new Float32Array([0.0,0.0,1.0]));

      gl.drawArrays(gl.TRIANGLES, 0, 6*6);
    }

function setCubeNormals(){
  return new Float32Array([
      // Front
      0.0,0.0,1.0,
      0.0,0.0,1.0,
      0.0,0.0,1.0,
      0.0,0.0,1.0,
      0.0,0.0,1.0,
      0.0,0.0,1.0,
  
      // Left
      -1.0,0.0,0.0,
      -1.0,0.0,0.0,
      -1.0,0.0,0.0,
      -1.0,0.0,0.0,
      -1.0,0.0,0.0,
      -1.0,0.0,0.0,
  
      // Back
      0.0,0.0,-1.0,
      0.0,0.0,-1.0,
      0.0,0.0,-1.0,
      0.0,0.0,-1.0,
      0.0,0.0,-1.0,
      0.0,0.0,-1.0,
  
      // Right
      1.0,0.0,0.0,
      1.0,0.0,0.0,
      1.0,0.0,0.0,
      1.0,0.0,0.0,
      1.0,0.0,0.0,
      1.0,0.0,0.0,
  
      // Top
      0.0,1.0,0.0,
      0.0,1.0,0.0,
      0.0,1.0,0.0,
      0.0,1.0,0.0,
      0.0,1.0,0.0,
      0.0,1.0,0.0,
  
      // Bottom
      0.0,-1.0,0.0,
      0.0,-1.0,0.0,
      0.0,-1.0,0.0,
      0.0,-1.0,0.0,
      0.0,-1.0,0.0,
      0.0,-1.0,0.0,
  ]);
}