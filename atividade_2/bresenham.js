function bresenham(p0, p1) {
    let x0 = p0[0], y0 = p0[1];
    let x1 = p1[0], y1 = p1[1];

    const line = [];
    
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    
    let err = dx - dy;
    let x = x0, y = y0;

    while (true) {
        line.push([x, y]);
        
        if (x === x1 && y === y1) break;
        
        let e2 = 2 * err;
        
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }

    return line;
}