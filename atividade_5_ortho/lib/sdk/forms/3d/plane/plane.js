function setXZPlaneVertices() {
    let v = 0.6;
    return new Float32Array(
        [
            // Front
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,

            // Left
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,

            // Back
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,

            // Right
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,

            // Top
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,

            // Bottom
            v, -v, v,
            v, -v, -v,
            -v, -v, v,
            -v, -v, v,
            v, -v, -v,
            -v, -v, -v,
        ]
    )
}

function setXZPlaneColors() {
    // let colors = [Math.random(), Math.random(), Math.random()]

    let color = [Math.random(), Math.random(), Math.random()];


    return new Float32Array(
        [
            // Front
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            // Left
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            // Back
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            // Right
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            // Top
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            // Bottom
            ...color,
            ...color,
            ...color,
            ...color,
            ...color,
            ...color,
        ]
    );
}

function drawXZPlane(VertexBuffer, ColorBuffer, planeVertices, planeColors, gl, positionLocation, colorLocation, modelViewMatrix, viewingMatrix, projectionMatrix, modelViewMatrixUniformLocation, viewingMatrixUniformLocation, projectionMatrixUniformLocation, theta, tx, ty, tz) {
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, planeVertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, planeColors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    modelViewMatrix = m4.identity();
    modelViewMatrix = m4.yRotate(modelViewMatrix, degToRad(theta));
    modelViewMatrix = m4.translate(modelViewMatrix, tx, ty, tz);

    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
    gl.uniformMatrix4fv(viewingMatrixUniformLocation, false, viewingMatrix);
    gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
}