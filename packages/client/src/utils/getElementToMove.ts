import isPointNearSegment from '@/utils/pointToSegmentDistance';

function GetElementToMove(
    ctx: CanvasRenderingContext2D,
    elements: DrawingElement[],
    mouseX: number,
    mouseY: number,
    threshold: number,
): string | null {
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];

        // Handle text element
        if (element.type === 'text') {
            const textElement = element as TextElement;
            const textWidth = ctx.measureText(textElement.content).width;

            const isInside =
                textElement.point.x < mouseX &&
                mouseX < textElement.point.x + textWidth &&
                textElement.point.y - textElement.fontSize < mouseY &&
                mouseY < textElement.point.y;

            if (isInside) {
                return textElement.id;
            }
        } else if (element.type === 'rectangle') {
            // for rectangle
            const elem = elements[i] as RectangleElement;

            if (
                isPointNearSegment(
                    { x: elem.point.x, y: elem.point.y },
                    { x: elem.point.x + elem.width, y: elem.point.y },
                    mouseX,
                    mouseY,
                    threshold,
                ) ||
                isPointNearSegment(
                    { x: elem.point.x, y: elem.point.y + elem.height },
                    {
                        x: elem.point.x + elem.width,
                        y: elem.point.y + elem.height,
                    },
                    mouseX,
                    mouseY,
                    threshold,
                ) ||
                isPointNearSegment(
                    { x: elem.point.x, y: elem.point.y },
                    { x: elem.point.x, y: elem.point.y + elem.height },
                    mouseX,
                    mouseY,
                    threshold,
                ) ||
                isPointNearSegment(
                    { x: elem.point.x + elem.width, y: elem.point.y },
                    {
                        x: elem.point.x + elem.width,
                        y: elem.point.y + elem.height,
                    },
                    mouseX,
                    mouseY,
                    threshold,
                )
            ) {
                return elem.id;
            }
        } else if (element.type === 'circle') {
            const elem = elements[i] as CircleElement;
            const distanceToCenter = Math.sqrt(
                (mouseX - elem.center.x) ** 2 + (mouseY - elem.center.y) ** 2,
            );

            if (Math.abs(distanceToCenter - elem.radius) <= threshold) {
                return elem.id;
            }
        } else {
            // Handle pencil element
            const pencilElement = element as PencilElement;

            for (let j = 1; j < pencilElement.points.length; j++) {
                const pointA = pencilElement.points[j];
                const pointB = pencilElement.points[j - 1];

                const numerator =
                    (mouseX - pointA.x) * (pointB.x - pointA.x) +
                    (mouseY - pointA.y) * (pointB.y - pointA.y);

                const denominator =
                    (pointB.x - pointA.x) ** 2 + (pointB.y - pointA.y) ** 2;

                let t = numerator / denominator;
                t = Math.max(0, Math.min(1, t));

                const segmentVector: Point = {
                    x: pointB.x - pointA.x,
                    y: pointB.y - pointA.y,
                };

                const projectionPoint: Point = {
                    x: pointA.x + t * segmentVector.x,
                    y: pointA.y + t * segmentVector.y,
                };

                const distance = Math.sqrt(
                    (projectionPoint.x - mouseX) ** 2 +
                        (projectionPoint.y - mouseY) ** 2,
                );

                if (distance <= threshold) {
                    return pencilElement.id;
                }
            }
        }
    }

    return null;
}

export default GetElementToMove;
