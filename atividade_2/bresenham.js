function bresenham(p0, p1) {
    const x0 = p0[0];
    const y0 = p0[1];
    const x1 = p1[0];
    const y1 = p1[1];

    const line = [];

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);

    let decisionFactor = 2*dy-dx;

    let incInf = 2*dy;
    let incSup = 2*(dy-dx);

    let x = x0;
    let y = y0;

    line.push([x, y]);

    while (x < x1) {
        if (decisionFactor < 0) {
            decisionFactor = decisionFactor + incInf;
        } else {
            decisionFactor = decisionFactor + incSup;
            y++;
        }
        x++;
        line.push([x, y]);
    }

    return line;
}
