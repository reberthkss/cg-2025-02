function setXZSquareVertices() {
    let v = 0.6;
    return new Float32Array([
        // Triângulo 1
        -v, -1, -v,  // canto inferior esquerdo
         v, -1, -v,  // canto inferior direito  
        -v, -1,  v,  // canto superior esquerdo

        // Triângulo 2
        -v, -1,  v,  // canto superior esquerdo
         v, -1, -v,  // canto inferior direito
         v, -1,  v,  // canto superior direito
    ]);
}

function setXZSquareColors() {
    // let colors = [Math.random(), Math.random(), Math.random()]

    let color = [Math.random(), Math.random(), Math.random()];


    return new Float32Array([
        ...color, ...color, ...color,  // 3 vértices do triângulo 1
        ...color, ...color, ...color   // 3 vértices do triângulo 2
    ]);
}

function drawXZSquare(VertexBuffer, ColorBuffer, squareVertices, squareColors, gl, positionLocation, colorLocation, modelViewMatrix, viewingMatrix, projectionMatrix, modelViewMatrixUniformLocation, viewingMatrixUniformLocation, projectionMatrixUniformLocation, theta, tx, ty, tz) {
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, squareVertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, squareColors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    modelViewMatrix = m4.identity();
    modelViewMatrix = m4.yRotate(modelViewMatrix, degToRad(theta));
    modelViewMatrix = m4.translate(modelViewMatrix, tx, ty, tz);

    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
    gl.uniformMatrix4fv(viewingMatrixUniformLocation, false, viewingMatrix);
    gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}