function getPanning(
    ctx: CanvasRenderingContext2D,
    elements: DrawingElement[],
): { minX: number; minY: number; maxX: number; maxY: number } {
    const res = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
    };

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        // Handle text element
        if (element.type === 'text') {
            const text = element as TextElement;
            const textWidth = ctx.measureText(text.content).width;

            res.minX = Math.min(res.minX, text.point.x);
            res.minY = Math.min(res.minY, text.point.y);
            res.maxX = Math.max(res.maxX, text.point.x + textWidth);
            res.maxY = Math.max(res.maxY, text.point.y + text.fontSize);
        } else if (element.type === 'rectangle') {
            // for rectangle
            const rectangle = elements[i] as RectangleElement;

            res.minX = Math.min(res.minX, rectangle.point.x);
            res.minY = Math.min(res.minY, rectangle.point.y);
            res.maxX = Math.max(res.maxX, rectangle.point.x + rectangle.width);
            res.maxY = Math.max(res.maxY, rectangle.point.y + rectangle.height);
        } else if (element.type === 'circle') {
            const circle = elements[i] as CircleElement;

            res.minX = Math.min(res.minX, circle.center.x - circle.radius);
            res.minY = Math.min(res.minY, circle.center.y - circle.radius);
            res.maxX = Math.max(res.maxX, circle.center.x + circle.radius);
            res.maxY = Math.max(res.maxY, circle.center.y + circle.radius);
        } else {
            // Handle pencil element
            const pencil = element as PencilElement;
            for (let j = 0; j < pencil.points.length; j++) {
                res.minX = Math.min(res.minX, pencil.points[j].x);
                res.minY = Math.min(res.minY, pencil.points[j].y);
                res.maxX = Math.max(res.maxX, pencil.points[j].x);
                res.maxY = Math.max(res.maxY, pencil.points[j].y);
            }
        }
    }
    return res;
}

export default getPanning;
