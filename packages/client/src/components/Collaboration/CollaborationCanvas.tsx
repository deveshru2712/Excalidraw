import { useEffect, useRef } from 'react';

import { socket } from '@/lib/socket';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useToolStore } from '@/stores/useToolStore';
import ApplyDashedStyle from '@/utils/applyStrokeStyle';
import GetElementsToErase from '@/utils/getElementToErase';
import GetElementToMove from '@/utils/getElementToMove';
import getPanning from '@/utils/getPanning';

interface CollaborationCanvasProps {
    roomId: string;
}

export default function CollaborationCanvas({
    roomId,
}: CollaborationCanvasProps) {
    const drawingStore = useDrawingStore();
    const toolStore = useToolStore();
    const elements = useDrawingStore((state) => state.elements);
    const isPanning = useDrawingStore((state) => state.isPanning);
    const zoomDirection = useDrawingStore((state) => state.zoomDirection);

    // for pencil stroke tracking
    const inProgressStrokes = useRef<Map<string, PencilElement>>(new Map());

    // for rectangle and circle tracking
    const inProgressShapes = useRef<
        Map<string, RectangleElement | CircleElement>
    >(new Map());

    const activeStrokeIdRef = useRef<string>('');

    const erasedIdsRef = useRef<Set<string>>(new Set());

    // for text element
    const activeInputRef = useRef<HTMLInputElement | null>(null);
    const activeInputPositionRef = useRef<Point>({ x: 0, y: 0 });

    // for drag and move
    const draggedElementIdRef = useRef<string | null>(null);
    const draggedElementSnapShotRef = useRef<Point>({ x: 0, y: 0 });

    // for rectangle element
    const rectangleElementSnapShotRef = useRef<Point>({ x: 0, y: 0 });

    // for circle element
    const circleElementCenterRef = useRef<Point>({ x: 0, y: 0 });

    // for panning canvas
    const lastPanningSnapShot = useRef<Point>({ x: 0, y: 0 });
    const panningOffset = useRef<Point>({ x: 0, y: 0 });

    // for zooming
    const zoomLevelRef = useRef<number>(1);

    useEffect(() => {
        if (!zoomDirection) return;

        if (zoomDirection === 'in') {
            zoomLevelRef.current = Math.min(5, zoomLevelRef.current + 0.1);
        } else {
            zoomLevelRef.current = Math.max(0.1, zoomLevelRef.current - 0.1);
        }

        drawingStore.setZoomLevel(zoomLevelRef.current);
        redraw();
        drawingStore.setZoomDirection(null);
    }, [zoomDirection]);

    function redraw(skipIds: Set<string> = new Set()) {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;

        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        // saving the current state
        ctx.save();
        ctx.translate(panningOffset.current.x, panningOffset.current.y);
        // for zooming
        ctx.scale(zoomLevelRef.current, zoomLevelRef.current);

        storeRef.current.elements.forEach((element) => {
            if (skipIds.has(element.id)) return;

            if (element.type === 'pencil') {
                const points = element.points;
                if (points.length < 2) return;

                ctx.beginPath();
                ctx.strokeStyle = element.strokeColor;
                ctx.lineWidth = element.strokeWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ApplyDashedStyle(ctx, element.strokeDash, element.strokeWidth);

                ctx.moveTo(points[0].x, points[0].y);

                for (let i = 1; i < points.length - 1; i++) {
                    const currentMid = {
                        x: (points[i].x + points[i + 1].x) / 2,
                        y: (points[i].y + points[i + 1].y) / 2,
                    };
                    ctx.quadraticCurveTo(
                        points[i].x,
                        points[i].y,
                        currentMid.x,
                        currentMid.y,
                    );
                }

                ctx.lineTo(
                    points[points.length - 1].x,
                    points[points.length - 1].y,
                );
                ctx.stroke();
                ctx.setLineDash([]);
            } else if (element.type === 'text') {
                ctx.font = `${element.fontSize}px 'Shantell Sans'`;
                ctx.fillStyle = element.strokeColor;
                ctx.fillText(element.content, element.point.x, element.point.y);
            } else if (element.type === 'rectangle') {
                ctx.strokeStyle = element.strokeColor;
                ctx.lineWidth = element.strokeWidth;
                ApplyDashedStyle(ctx, element.strokeDash, element.strokeWidth);
                ctx.strokeRect(
                    element.point.x,
                    element.point.y,
                    element.width,
                    element.height,
                );
            } else if (element.type === 'circle') {
                ctx.strokeStyle = element.strokeColor;
                ctx.lineWidth = element.strokeWidth;
                ApplyDashedStyle(ctx, element.strokeDash, element.strokeWidth);
                ctx.beginPath();
                ctx.arc(
                    element.center.x,
                    element.center.y,
                    element.radius,
                    0,
                    Math.PI * 2,
                );
                ctx.stroke();
                ctx.setLineDash([]);
            }
        });

        // the other user is actively drawing using pencil

        for (const [, value] of inProgressStrokes.current) {
            const points = value.points;
            if (points.length < 2) return;

            ctx.beginPath();
            ctx.strokeStyle = value.strokeColor;
            ctx.lineWidth = value.strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ApplyDashedStyle(ctx, value.strokeDash, value.strokeWidth);

            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length - 1; i++) {
                const currentMid = {
                    x: (points[i].x + points[i + 1].x) / 2,
                    y: (points[i].y + points[i + 1].y) / 2,
                };
                ctx.quadraticCurveTo(
                    points[i].x,
                    points[i].y,
                    currentMid.x,
                    currentMid.y,
                );
            }

            ctx.lineTo(
                points[points.length - 1].x,
                points[points.length - 1].y,
            );
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // the other user is drawing shapes
        for (const [, value] of inProgressShapes.current) {
            if (value.type === 'rectangle') {
                ctx.strokeStyle = value.strokeColor;
                ctx.lineWidth = value.strokeWidth;
                ApplyDashedStyle(ctx, value.strokeDash, value.strokeWidth);
                ctx.strokeRect(
                    value.point.x,
                    value.point.y,
                    value.width,
                    value.height,
                );
            } else if (value.type === 'circle') {
                ctx.strokeStyle = value.strokeColor;
                ctx.lineWidth = value.strokeWidth;
                ApplyDashedStyle(ctx, value.strokeDash, value.strokeWidth);
                ctx.beginPath();
                ctx.arc(
                    value.center.x,
                    value.center.y,
                    value.radius,
                    0,
                    Math.PI * 2,
                );
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        ctx.restore();
    }

    const storeRef = useRef({
        tool: toolStore.tool,
        elements: drawingStore.elements,
        addElement: drawingStore.addElement,
        removeElement: drawingStore.removeElements,
        updateElement: drawingStore.updateElement,
        pushToUndoStack: drawingStore.pushToUndoStack,
        isPanning: drawingStore.isPanning,
        setIsPanning: drawingStore.setIsPanning,
        strokeColor: toolStore.strokeColor,
        strokeWidth: toolStore.strokeWidth,
        strokeDash: toolStore.strokeDash,
        fontSize: toolStore.fontSize,
    });

    // add text if the user prematurely switches tool
    useEffect(() => {
        const { addElement, strokeColor } = storeRef.current;
        const x = activeInputPositionRef.current.x;
        const y = activeInputPositionRef.current.y;
        if (activeInputRef.current && activeInputRef.current.value.length > 0) {
            const id = crypto.randomUUID();
            addElement({
                id,
                type: 'text',
                point: { x, y },
                strokeColor,
                fontSize: storeRef.current.fontSize,
                content: activeInputRef.current.value,
            });
        }
        activeInputRef.current?.remove();
        activeInputRef.current = null;
    }, [toolStore.tool]);

    useEffect(() => {
        storeRef.current = {
            tool: toolStore.tool,
            elements: drawingStore.elements,
            addElement: drawingStore.addElement,
            removeElement: drawingStore.removeElements,
            updateElement: drawingStore.updateElement,
            pushToUndoStack: drawingStore.pushToUndoStack,
            isPanning: drawingStore.isPanning,
            setIsPanning: drawingStore.setIsPanning,
            strokeColor: toolStore.strokeColor,
            strokeWidth: toolStore.strokeWidth,
            strokeDash: toolStore.strokeDash,
            fontSize: toolStore.fontSize,
        };
    }, [
        toolStore.tool,
        drawingStore.elements,
        drawingStore.addElement,
        drawingStore.removeElements,
        drawingStore.updateElement,
        drawingStore.pushToUndoStack,
        drawingStore.isPanning,
        drawingStore.setIsPanning,
        toolStore.strokeColor,
        toolStore.strokeWidth,
        toolStore.strokeDash,
        toolStore.fontSize,
    ]);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const isActive = useRef(false);
    const currentPoints = useRef<Point[]>([]);
    const lastPoint = useRef({ x: 0, y: 0 });
    const lastMid = useRef({ x: 0, y: 0 });

    function focusContent() {
        if (!isPanning) return;
        if (!ctxRef.current || !canvasRef.current) return;

        const res = getPanning(ctxRef.current, storeRef.current.elements);
        const centerX = (res.minX + res.maxX) / 2;
        const centerY = (res.minY + res.maxY) / 2;

        panningOffset.current.x = window.innerWidth / 2 - centerX;
        panningOffset.current.y = window.innerHeight / 2 - centerY;
        redraw();
        storeRef.current.setIsPanning(false);
    }

    // helper func to get current coordinate
    function getCoords(e: MouseEvent) {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    //setting up the canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;

        function resizeCanvas() {
            if (!canvas) return;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.scale(dpr, dpr);
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = 'black';
            ctxRef.current = ctx;

            redraw();
        }

        resizeCanvas();

        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const threshold = 8;

    // socket listner to update the canvas
    useEffect(() => {
        // for adding element to the canvas
        const handleAddElement = (data: AddEventPayload) => {
            const elementId = data.element.id;
            const elementType = data.element.type;
            // removing the element
            if (elementType === 'pencil') {
                inProgressStrokes.current.delete(elementId);
            } else {
                inProgressShapes.current.delete(elementId);
            }

            storeRef.current.addElement(data.element);
        };

        // for removing element from the canvas
        const handleRemoveElement = (data: RemoveEventPayload) => {
            console.log('element removed');
            storeRef.current.removeElement(data.elementIds);
        };

        //for updating elment location in the canvas
        const handleUpdateElement = (data: UpdateEventPayload) => {
            console.log(
                elements.map((element) => element.id == data.elementIds),
            );
            storeRef.current.updateElement(
                data.elementIds,
                data.offsetX,
                data.offsetY,
            );
        };

        //for updating the redo/undo history
        const handlePushToUndo = (data: PushEventPayload) => {
            console.log('element pushed');
            storeRef.current.pushToUndoStack(data.elements);
        };

        // preview
        const handlePreviewElement = (data: PreviewPayload) => {
            if (data.type === 'pencil') {
                inProgressStrokes.current.set(data.strokeId, {
                    id: data.strokeId,
                    type: 'pencil',
                    points: data.points,
                    strokeColor: data.strokeColor,
                    strokeDash: data.strokeDash,
                    strokeWidth: data.strokeWidth,
                });
            } else if (data.type === 'rectangle') {
                inProgressShapes.current.set(data.strokeId, {
                    id: data.strokeId,
                    type: 'rectangle',
                    point: data.point,
                    height: data.height,
                    width: data.width,
                    strokeColor: data.strokeColor,
                    strokeWidth: data.strokeWidth,
                    strokeDash: data.strokeDash,
                });
            } else {
                inProgressShapes.current.set(data.strokeId, {
                    id: data.strokeId,
                    type: 'circle',
                    center: data.center,
                    radius: data.radius,
                    strokeColor: data.strokeColor,
                    strokeWidth: data.strokeWidth,
                    strokeDash: data.strokeDash,
                });
            }
            redraw();
        };

        socket.on('element:added', handleAddElement);
        socket.on('element:removed', handleRemoveElement);
        socket.on('element:updated', handleUpdateElement);
        socket.on('history:pushed', handlePushToUndo);
        socket.on('element:preview', handlePreviewElement);

        return () => {
            socket.off('element:added', handleAddElement);
            socket.off('element:removed', handleRemoveElement);
            socket.off('element:updated', handleUpdateElement);
            socket.off('history:pushed', handlePushToUndo);
            socket.off('element:preview', handlePreviewElement);
        };
    }, []);

    // actual writing and erasing logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseDown = (e: MouseEvent) => {
            const { x, y } = getCoords(e);

            const id = crypto.randomUUID();
            activeStrokeIdRef.current = id;

            const wx = (x - panningOffset.current.x) / zoomLevelRef.current;
            const wy = (y - panningOffset.current.y) / zoomLevelRef.current;

            isActive.current = true;
            const { tool, strokeWidth, strokeColor, addElement } =
                storeRef.current;

            if (tool === 'eraser') {
                const Ex = (x - panningOffset.current.x) / zoomLevelRef.current;
                const Ey = (y - panningOffset.current.y) / zoomLevelRef.current;
                const list = GetElementsToErase(
                    ctxRef.current!,
                    storeRef.current.elements,
                    Ex,
                    Ey,
                    strokeWidth * 3,
                );
                list.forEach((id) => erasedIdsRef.current.add(id));
                redraw(erasedIdsRef.current);
            } else if (tool === 'pencil') {
                inProgressStrokes.current.set(activeStrokeIdRef.current, {
                    id: activeStrokeIdRef.current,
                    points: [{ x: wx, y: wy }],
                    strokeColor: storeRef.current.strokeColor,
                    strokeDash: storeRef.current.strokeDash,
                    strokeWidth: storeRef.current.strokeWidth,
                    type: 'pencil',
                });

                lastPoint.current = { x: wx, y: wy };
                lastMid.current = { x: wx, y: wy };
                currentPoints.current = [];
                // generating id for the element
            } else if (tool === 'text') {
                activeInputPositionRef.current.x = wx;
                activeInputPositionRef.current.y = wy;

                const inputElem = document.createElement('input');
                activeInputRef.current = inputElem;
                inputElem.style.position = 'fixed';
                inputElem.style.left = `${x}px`;
                inputElem.style.top = `${y}px`;
                inputElem.style.color = strokeColor;
                inputElem.style.font = `${storeRef.current.fontSize}px 'Shantell Sans'`;
                document.body.appendChild(inputElem);
                inputElem.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                });
                inputElem.focus();
                setTimeout(() => inputElem.focus(), 0);
                inputElem.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === 'Enter') {
                        const id = crypto.randomUUID();
                        addElement({
                            id,
                            type: 'text',
                            point: { x: wx, y: wy },
                            strokeColor,
                            fontSize: storeRef.current.fontSize,
                            content: inputElem.value,
                        });
                        document.body.removeChild(inputElem);
                        activeInputPositionRef.current.x = 0;
                        activeInputPositionRef.current.y = 0;
                    }
                });
            } else if (tool === 'drag') {
                const point = GetElementToMove(
                    ctxRef.current!,
                    storeRef.current.elements,
                    wx,
                    wy,
                    threshold,
                );

                // saving the dragged element id
                draggedElementIdRef.current = point;
                // saving the dragged element snapshot
                draggedElementSnapShotRef.current = { x: wx, y: wy };
                // updating the undo history
                storeRef.current.pushToUndoStack(storeRef.current.elements);
                // emit evet to update undo history
                const updateUndoHistory: PushEventPayload = {
                    roomId,
                    elements: [...storeRef.current.elements],
                };
                socket.emit('history:push', updateUndoHistory);
            } else if (tool === 'rectangle') {
                // saving snapshot for rectangle element
                rectangleElementSnapShotRef.current.x = wx;
                rectangleElementSnapShotRef.current.y = wy;

                // creating a entry
                inProgressShapes.current.set(activeStrokeIdRef.current, {
                    id: activeStrokeIdRef.current,
                    type: 'rectangle',
                    height: 0,
                    width: 0,
                    point: {
                        x: rectangleElementSnapShotRef.current.x,
                        y: rectangleElementSnapShotRef.current.y,
                    },
                    strokeColor: storeRef.current.strokeColor,
                    strokeDash: storeRef.current.strokeDash,
                    strokeWidth: storeRef.current.strokeWidth,
                });
            } else if (tool === 'circle') {
                // saving the center snapshot for circle element
                circleElementCenterRef.current.x = wx;
                circleElementCenterRef.current.y = wy;
                inProgressShapes.current.set(activeStrokeIdRef.current, {
                    id: activeStrokeIdRef.current,
                    type: 'circle',
                    center: {
                        x: circleElementCenterRef.current.x,
                        y: circleElementCenterRef.current.y,
                    },
                    radius: 0,
                    strokeColor: storeRef.current.strokeColor,
                    strokeDash: storeRef.current.strokeDash,
                    strokeWidth: storeRef.current.strokeWidth,
                });
            } else if (tool === 'pan') {
                lastPanningSnapShot.current.x = x;
                lastPanningSnapShot.current.y = y;
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isActive.current) return;
            const ctx = ctxRef.current;
            if (!ctx) return;

            const { x, y } = getCoords(e);

            const wx = (x - panningOffset.current.x) / zoomLevelRef.current;
            const wy = (y - panningOffset.current.y) / zoomLevelRef.current;

            const { tool, strokeColor, strokeWidth, strokeDash } =
                storeRef.current;
            if (tool === 'pencil') {
                const currentMid = {
                    x: (lastPoint.current.x + wx) / 2,
                    y: (lastPoint.current.y + wy) / 2,
                };

                ctx.beginPath();
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = strokeWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ApplyDashedStyle(ctx, strokeDash, strokeWidth);
                ctx.moveTo(
                    lastMid.current.x * zoomLevelRef.current +
                        panningOffset.current.x,
                    lastMid.current.y * zoomLevelRef.current +
                        panningOffset.current.y,
                );
                ctx.quadraticCurveTo(
                    lastPoint.current.x * zoomLevelRef.current +
                        panningOffset.current.x,
                    lastPoint.current.y * zoomLevelRef.current +
                        panningOffset.current.y,
                    currentMid.x * zoomLevelRef.current +
                        panningOffset.current.x,
                    currentMid.y * zoomLevelRef.current +
                        panningOffset.current.y,
                );
                ctx.stroke();

                lastMid.current = currentMid;
                lastPoint.current = { x: wx, y: wy };
                currentPoints.current.push({ x: wx, y: wy });

                // pushing an event to the server
                const strokeId = activeStrokeIdRef.current;
                const currentElement = inProgressStrokes.current.get(
                    activeStrokeIdRef.current,
                );
                if (!currentElement) return;

                // pushing now cords
                currentElement.points.push({ x: wx, y: wy });

                const data: PreviewPayload = {
                    roomId,
                    strokeId,
                    ...currentElement,
                };
                socket.emit('element:preview', data);
            } else if (tool === 'eraser') {
                const Ex = (x - panningOffset.current.x) / zoomLevelRef.current;
                const Ey = (y - panningOffset.current.y) / zoomLevelRef.current;
                const list = GetElementsToErase(
                    ctxRef.current!,
                    storeRef.current.elements,
                    Ex,
                    Ey,
                    strokeWidth * 3,
                );
                list.forEach((id) => erasedIdsRef.current.add(id));
                redraw(erasedIdsRef.current);

                // emit event to remove element
                const removeElementData: RemoveEventPayload = {
                    roomId,
                    elementIds: [...erasedIdsRef.current],
                };

                socket.emit('element:remove', removeElementData);
            } else if (tool === 'drag') {
                // meaning none element is selected
                if (!draggedElementIdRef.current) return;

                // if the element is selected

                const delta: Point = { x: 0, y: 0 };
                delta.x = wx - draggedElementSnapShotRef.current.x;
                delta.y = wy - draggedElementSnapShotRef.current.y;

                // calling the update function
                storeRef.current.updateElement(
                    draggedElementIdRef.current,
                    delta.x,
                    delta.y,
                );

                // updating the co ordinates
                draggedElementSnapShotRef.current.x = wx;
                draggedElementSnapShotRef.current.y = wy;

                // emit event to update element position
                const updateElementData: UpdateEventPayload = {
                    roomId,
                    elementIds: draggedElementIdRef.current,
                    offsetX: delta.x,
                    offsetY: delta.y,
                };
                socket.emit('element:update', updateElementData);
            } else if (tool === 'rectangle') {
                if (!ctxRef.current) return;
                const w = wx - rectangleElementSnapShotRef.current.x;
                const h = wy - rectangleElementSnapShotRef.current.y;

                // drawing the rectangle
                redraw();
                ctx.strokeStyle = storeRef.current.strokeColor;
                ctx.lineWidth = storeRef.current.strokeWidth;
                ApplyDashedStyle(
                    ctx,
                    storeRef.current.strokeDash,
                    storeRef.current.strokeWidth,
                );
                ctxRef.current.strokeRect(
                    rectangleElementSnapShotRef.current.x *
                        zoomLevelRef.current +
                        panningOffset.current.x,
                    rectangleElementSnapShotRef.current.y *
                        zoomLevelRef.current +
                        panningOffset.current.y,
                    w * zoomLevelRef.current,
                    h * zoomLevelRef.current,
                );

                // emit preview event for rectangle
                const strokeId = activeStrokeIdRef.current;
                const currentElement = inProgressShapes.current.get(strokeId);

                if (currentElement?.type === 'rectangle') {
                    currentElement.height = h;
                    currentElement.width = w;
                }

                const data: PreviewPayload = {
                    roomId,
                    strokeId,
                    ...currentElement!,
                };
                socket.emit('element:preview', data);
            } else if (tool === 'circle') {
                if (!ctxRef.current) return;

                const center: Point = { x: 0, y: 0 };

                // calculating the center
                center.x = (circleElementCenterRef.current.x + wx) / 2;
                center.y = (circleElementCenterRef.current.y + wy) / 2;

                // calculating the center
                const radius = Math.sqrt(
                    (circleElementCenterRef.current.x - center.x) ** 2 +
                        (circleElementCenterRef.current.y - center.y) ** 2,
                );

                redraw();

                ctx.strokeStyle = storeRef.current.strokeColor;
                ctx.lineWidth = storeRef.current.strokeWidth;
                ApplyDashedStyle(
                    ctx,
                    storeRef.current.strokeDash,
                    storeRef.current.strokeWidth,
                );

                ctx.beginPath();
                ctx.arc(
                    center.x * zoomLevelRef.current + panningOffset.current.x,
                    center.y * zoomLevelRef.current + panningOffset.current.y,
                    radius * zoomLevelRef.current,
                    0,
                    Math.PI * 2,
                );
                ctx.stroke();
                ctx.setLineDash([]);

                // emit preview event for circle
                const strokeId = activeStrokeIdRef.current;
                const currentElement = inProgressShapes.current.get(strokeId);

                if (currentElement?.type === 'circle') {
                    currentElement.center = center;
                    currentElement.radius = radius;
                }

                const data: PreviewPayload = {
                    roomId,
                    strokeId,
                    ...currentElement!,
                };

                socket.emit('element:preview', data);
            } else if (tool === 'pan') {
                // calculating the offset
                const offsetX = x - lastPanningSnapShot.current.x;
                const offsetY = y - lastPanningSnapShot.current.y;

                panningOffset.current.x = panningOffset.current.x + offsetX;
                panningOffset.current.y = panningOffset.current.y + offsetY;

                lastPanningSnapShot.current.x = x;
                lastPanningSnapShot.current.y = y;
                redraw();
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!isActive.current) return;
            const { x, y } = getCoords(e);

            const wx = (x - panningOffset.current.x) / zoomLevelRef.current;
            const wy = (y - panningOffset.current.y) / zoomLevelRef.current;

            isActive.current = false;
            const {
                tool,
                addElement,
                removeElement,
                strokeColor,
                strokeWidth,
                strokeDash,
            } = storeRef.current;

            if (tool === 'eraser') {
                if (erasedIdsRef.current.size === 0) return;
                removeElement([...erasedIdsRef.current]);
                erasedIdsRef.current.clear();
            } else if (tool === 'pencil') {
                if (currentPoints.current.length === 0) return;

                addElement({
                    id: activeStrokeIdRef.current,
                    type: 'pencil',
                    points: currentPoints.current,
                    strokeColor,
                    strokeWidth,
                    strokeDash,
                });

                const addElementData: AddEventPayload = {
                    roomId,
                    element: {
                        id: activeStrokeIdRef.current,
                        type: 'pencil',
                        points: currentPoints.current,
                        strokeColor,
                        strokeWidth,
                        strokeDash,
                    },
                };

                // clearing ref
                inProgressStrokes.current = new Map();

                socket.emit('element:add', addElementData);

                currentPoints.current = [];
            } else if (tool === 'drag') {
                // resetting the dragged element
                draggedElementIdRef.current = null;
                draggedElementSnapShotRef.current = { x: 0, y: 0 };
            } else if (tool === 'rectangle') {
                // calling the add  function to add the rectangle to update
                addElement({
                    id: activeStrokeIdRef.current,
                    type: 'rectangle',
                    point: {
                        x: rectangleElementSnapShotRef.current.x,
                        y: rectangleElementSnapShotRef.current.y,
                    },
                    height: wy - rectangleElementSnapShotRef.current.y,
                    width: wx - rectangleElementSnapShotRef.current.x,
                    strokeColor,
                    strokeWidth,
                    strokeDash,
                });

                // emit event to add rectangle
                const addRectangleElement: AddEventPayload = {
                    roomId,
                    element: {
                        id: activeStrokeIdRef.current,
                        type: 'rectangle',
                        point: {
                            x: rectangleElementSnapShotRef.current.x,
                            y: rectangleElementSnapShotRef.current.y,
                        },
                        height: wy - rectangleElementSnapShotRef.current.y,
                        width: wx - rectangleElementSnapShotRef.current.x,
                        strokeColor,
                        strokeWidth,
                        strokeDash,
                    },
                };
                socket.emit('element:add', addRectangleElement);

                // resetting the rectangle snapshot
                rectangleElementSnapShotRef.current.x = 0;
                rectangleElementSnapShotRef.current.y = 0;
            } else if (tool === 'circle') {
                const center: Point = { x: 0, y: 0 };

                // calculating the center
                center.x = (circleElementCenterRef.current.x + wx) / 2;
                center.y = (circleElementCenterRef.current.y + wy) / 2;

                // calculating the center
                const radius = Math.sqrt(
                    (circleElementCenterRef.current.x - center.x) ** 2 +
                        (circleElementCenterRef.current.y - center.y) ** 2,
                );

                addElement({
                    id: activeStrokeIdRef.current,
                    type: 'circle',
                    center: {
                        x: center.x,
                        y: center.y,
                    },
                    radius,
                    strokeColor,
                    strokeWidth,
                    strokeDash,
                });

                // emit to add circle element
                const addCircleElement: AddEventPayload = {
                    roomId,
                    element: {
                        id: activeStrokeIdRef.current,
                        type: 'circle',
                        center: {
                            x: center.x,
                            y: center.y,
                        },
                        radius,
                        strokeColor,
                        strokeWidth,
                        strokeDash,
                    },
                };
                socket.emit('element:add', addCircleElement);

                // resetting the circle ref
                circleElementCenterRef.current.x = 0;
                circleElementCenterRef.current.y = 0;
            }
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    useEffect(() => {
        if (isPanning) focusContent();
    }, [isPanning]);

    useEffect(() => {
        redraw();
    }, [elements]);

    return <canvas ref={canvasRef} className="cursor-none bg-neutral-100" />;
}
