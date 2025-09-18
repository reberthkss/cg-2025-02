function bresenhamCircle(centerX, centerY, radius) {
    const circlePoints = [];
    
    let x = 0;
    let y = radius;
    let d = 3 - 2 * radius; // Termo de decisão inicial
    
    // Função auxiliar para adicionar os 8 pontos simétricos
    function addCirclePoints(cx, cy, x, y) {
        const points = [];
        points.push([cx + x, cy + y]);  // Octante 1
        points.push([cx - x, cy + y]);  // Octante 2
        points.push([cx + x, cy - y]);  // Octante 3
        points.push([cx - x, cy - y]);  // Octante 4
        points.push([cx + y, cy + x]);  // Octante 5
        points.push([cx - y, cy + x]);  // Octante 6
        points.push([cx + y, cy - x]);  // Octante 7
        points.push([cx - y, cy - x]);  // Octante 8
        return points;
    }
    
    // Adicionar pontos iniciais
    circlePoints.push(...addCirclePoints(centerX, centerY, x, y));
    
    while (y >= x) {
        x++;
        
        // Atualizar termo de decisão
        if (d > 0) {
            y--;
            d = d + 4 * (x - y) + 10;
        } else {
            d = d + 4 * x + 6;
        }
        
        // Adicionar os 8 pontos simétricos
        circlePoints.push(...addCirclePoints(centerX, centerY, x, y));
    }
    
    return circlePoints;
}

function bresenhamCircleFromCenterAndPoint(center, radius) {
    // Calcular raio a partir do centro e um ponto na circunferência
    const dx = point[0] - center[0];
    const dy = point[1] - center[1];
    
    return bresenhamCircle(center[0], center[1], radius);
}