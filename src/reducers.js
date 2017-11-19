import { actions, modes } from './consts.js'; 
import * as St from './state.js';
import * as Psst from './persist.js';


const snap = (cur, unit, increase) => {
    unit = unit || 1;
    return increase ?
        cur + unit - (cur % unit) :
        cur - (cur % unit === 0 ? unit : (cur % unit));
};

const snapNotZero = (cur, unit, increase) => St.notZero(cur, snap(cur, unit, increase));

const translateMove = action => {
    let isY = false;
    let isIncrease = false;
    if (action.match(/UP$/)) {
        isY = true;
    } else if (action.match(/DOWN$/)) {
        isY = true;
        isIncrease = true;
    } else if (action.match(/RIGHT$/)) {
        isIncrease = true;
    }
    return {isY, isIncrease};
};

const isReverse = action => !!action.match(/RV$/);
const isHorizontal = action => !!action.match(/HZ$/);
const isEnlarge = action => !!action.match(/ENLARGE/);

const pointReducer = (state, action) => {
    switch (action.type) {
        case actions.POINT_MOVE_UP:
        case actions.POINT_MOVE_DOWN:
        case actions.POINT_MOVE_LEFT:
        case actions.POINT_MOVE_RIGHT:
            const {isY, isIncrease} = translateMove(action.type);
            const unit = St.gridSize(state);
            return St.updateSelectedShape(state, shape => {
                const selectedPoint = shape.selectedPoint;
                if (shape.type === 'path') {
                    const xi = 1 + selectedPoint * 2;
                    const yi = 2 + selectedPoint * 2;
                    return St.updatePathSegment(shape, seg => St.movePathSegment(
                        seg,
                        isY ? 0 : snap(seg[xi], unit, isIncrease) - seg[xi], 
                        isY ? snap(seg[yi], unit, isIncrease) - seg[yi] : 0,
                        selectedPoint, 
                    ));
                } else if (shape.type === 'ellipse') {
                    return {
                        ...shape,
                        cx: (selectedPoint === 0 && !isY) ? snap(shape.cx, unit, isIncrease) : shape.cx,
                        cy: (selectedPoint === 0 && isY) ? snap(shape.cy, unit, isIncrease) : shape.cy,
                        rx: (selectedPoint === 0 && !isY) ? St.notZero(snap(shape.rx, unit, isIncrease), shape.rx) : shape.rx,
                        ry: (selectedPoint === 0 && isY) ? St.notZero(snap(shape.ry, unit, isIncrease), shape.ry) : shape.ry,
                    };
                }
            });
        case actions.POINT_CYCLE_SELECTION:
        case actions.POINT_CYCLE_SELECTION_RV:
            const rv = isReverse(action.type);
            return St.updateSelectedShape(state, shape => {
                if (shape.type === 'path') {
                    return St.cyclePathPoints(shape, rv);
                } else if (shape.type === 'ellipse') {
                    return St.cycleEllipsePoints(shape, rv);
                }
            });
    }
};

const pathReducer = (state, action) => {
    switch (action.type) {
        case actions.PATH_CYCLE_SEGMENT_SELECTION:
            return St.cyclePathSegment(state, false);
        case actions.PATH_CYCLE_SEGMENT_SELECTION_RV:
            return St.cyclePathSegment(state, true);
        case actions.PATH_TOGGLE_CLOSE:
            return St.updateSelectedShape(state, path => ({
                ...path,
                closed: !path.closed
            }));
        case actions.PATH_ADD_LINE:
            return St.addPathSegment(state, lastSeg => ['L', lastSeg[1] + 32, lastSeg[2]]);
        case actions.PATH_ADD_QUADRATIC_BEZIER:
            return St.addPathSegment(state, lastSeg => ['Q', lastSeg[1] + 32, lastSeg[2], lastSeg[1] + 16, lastSeg[2]]);
        case actions.PATH_ADD_CUBIC_BEZIER:
            return St.addPathSegment(state, lastSeg => ['C', 
                lastSeg[1] + 32, lastSeg[2], 
                lastSeg[1] + 8, lastSeg[2], 
                lastSeg[1] + 24, lastSeg[2]]);
        case actions.PATH_INSERT_LINE:
        case actions.PATH_INSERT_QUADRATIC_BEZIER:
        case actions.PATH_INSERT_CUBIC_BEZIER:
            return St.updateSelectedShape(state, shape => {
                let from = shape.segments[shape.selectedSegment];
                let to;
                if (shape.selectedSegment < shape.segments.length - 1) {
                    to = shape.segments[shape.selectedSegment + 1];
                } else if (shape.closed) {
                    to = shape.segments[0];
                } else {
                    return shape;
                }
                const dx = (to[1] - from[1]) / 2;
                const dy = (to[2] - from[2]) / 2;
                const x = from[1] + dx;
                const y = from[2] + dy;

                let newPt;

                switch (action.type)
                {
                    case actions.PATH_INSERT_LINE:
                        newPt = ['L', x, y];
                        break;
                    case actions.PATH_INSERT_QUADRATIC_BEZIER:
                        newPt = ['Q', x, y, from[1] + dx /2, from[2] + dy / 2];
                        break;
                    case actions.PATH_INSERT_CUBIC_BEZIER:
                        newPt = ['C', x, y, from[1] + dx / 3, from[2] + dy / 3, from[1] + 2 * dx / 3, from[2] + 2 * dy / 3];
                        break;
                    default:
                        break;
                }
                return { 
                    ...shape, 
                    selectedSegment: shape.selectedSegment + 1,
                    segments: St.insertAt(shape.segments, shape.selectedSegment, St.roundSegment(newPt))
                };
            });
        case actions.PATH_DELETE_SEGMENT:
            return St.updateSelectedShape(state, shape => {
                if (shape.segments.length > 2) {
                    let newSegments = St.sliceOther(shape.segments, shape.selectedSegment);
                    newSegments = St.updateArrayItem(newSegments, 0, segments => St.updateArrayItem(segments, 0, act => 'M'));
                    return {
                        ...shape,
                        selectedSegment: St.shiftIndex(shape.selectedSegment, shape.segments.length),
                        segments: newSegments
                   }
                }
                return shape;
            });
        case actions.PATH_PROMOTE_BEZIER:
            return St.updateSelectedShape(state, shape => {
                return St.updatePathSegment(shape, seg => {
                    switch (seg[0])
                    {
                        case 'L':
                            return ['Q', seg[1], seg[2], seg[1], seg[2] - 16];
                        case 'Q':
                            return ['C', seg[1], seg[2], seg[3], seg[4], seg[3], seg[4] -16];
                        default:
                            return seg;
                    }
                });
            });
        case actions.PATH_DEMOTE_BEZIER:
            return St.updateSelectedShape(state, shape => {
                return St.updatePathSegment(shape, seg => {
                    switch (seg[0])
                    {
                        case 'Q':
                            return ['L', seg[1], seg[2]];
                        case 'C':
                            return ['Q', seg[1], seg[2], seg[3], seg[4]];
                        default:
                            return seg;
                    }
                });
            });
        default:
            return state;
    }
};

const ellipseReducer = (state, action) => {
    switch (action.type) {
        case actions.ELLIPSE_ENLARGE_HZ:
        case actions.ELLIPSE_SHRINK_HZ:
        case actions.ELLIPSE_SHRINK_VT:
        case actions.ELLIPSE_ENLARGE_VT:
            const isHz = isHorizontal(action.type);
            const isIncrease = isEnlarge(action.type);
            const grid = St.gridSize(state);
            return St.updateSelectedShape(state, shape => ({
                ...shape,
                rx: isHz ? snapNotZero(shape.rx, grid, isIncrease) : shape.rx,
                ry: isHz ? shape.ry : snapNotZero(shape.ry, grid, isIncrease),
            }));
        default:
            break;
    }

    return state;
};

const shapeReducer = (state, action) => {
    if (state.shapes.selected < 0) { return state; }
    switch (action.type) {
        case actions.SHAPE_MOVE_UP:
        case actions.SHAPE_MOVE_DOWN:
        case actions.SHAPE_MOVE_LEFT:
        case actions.SHAPE_MOVE_RIGHT:
            const {isY, isIncrease} = translateMove(action.type);
            return St.updateSelectedShape(state, shape =>  {
                let vPrev = 0;
                switch (shape.type) {
                    case 'path':
                        vPrev = shape.segments[shape.selectedSegment][isY ? 2 : 1]; 
                        break;
                    case 'circle':
                    case 'ellipse':
                        vPrev = shape.center[isY ? 1 : 0];
                        break;
                }
                const vNew = snap(vPrev, St.gridSize(state), isIncrease);
                const diff = vNew - vPrev;
                return St.moveShape(shape, isY ? 0 : diff, isY ? diff : 0);
            });
        case actions.SHAPE_TOGGLE_FILL:
            return St.updateSelectedShape(state, shape => ({...shape, fill: !shape.fill}));
        case actions.SHAPE_ENLARGE:
        case actions.SHAPE_SHRINK:
            const increase = action.type === actions.SHAPE_ENLARGE;
            const grid = St.gridSize(state) || 1;
            return St.updateSelectedShape(state, shape => {
                switch (shape.type) {
                    case 'path':
                        return {...shape, segments: St.resizePath(shape.segments, grid, increase)};
                    case 'circle':
                        return {...shape, radius: snapNotZero(shape.radius, grid, increase)};
                    case 'ellipse':
                        return {...shape, rx: snapNotZero(shape.rx, grid, increase), ry: snapNotZero(shape.ry, grid, increase)};
                    default:
                        return shape;
                }
             });
            // assume path for now
            return St.updateSelectedShape(state, shape => ({...shape, segments: St.resizePath(shape.segments, 1/1.1)}));
        default:
            return state;
    }
}

const gAddIncrement = 32;
let gAddX = 1;
let gAddY = 1;

const getNewShapePos = containerSize => {
    let x = gAddX * gAddIncrement;
    let y = gAddY * gAddIncrement;
    if (x >= containerSize[0]) {
        x = 1 * gAddIncrement;
        gAddX = 2;
    } else {
        gAddX++;
    }
    if (y >= containerSize[1]) {
        y = 1 * gAddIncrement;
        gAddY = 2;
    } else {
        gAddY++;
    }

    return {x , y}; 
}


const shapesReducer = (state, action) => {
    switch (action.type) {
        case actions.SHAPES_CYCLE_SELECTION:
            return St.cycleShape(state, false);
        case actions.SHAPES_CYCLE_SELECTION_RV:
            return St.cycleShape(state, true);
        case actions.SHAPES_ADD_PATH:
            {
                const {x, y} = getNewShapePos(state.containerSize);
                return St.addShape(state, {
                    type: 'path',
                    selectedSegment: 0,
                    selectedPoint: 0,
                    closed: false,
                    fill: false,
                    segments: [['M', x, y], ['L', x + 32, y]]
                });
            }
        case actions.SHAPES_ADD_CIRCLE:
            {
                const {x, y} = getNewShapePos(state.containerSize);
                return St.addShape(state, {
                    type: 'circle',
                    fill: false,
                    center: [x, y],
                    radius: 32,
                });
            }
        case actions.SHAPES_ADD_ELLIPSE:
            {
                const {x, y} = getNewShapePos(state.containerSize);
                return St.addShape(state, {
                    type: 'ellipse',
                    fill: false,
                    center: [x, y],
                    rx: 32,
                    ry: 16,
                });
            }
        case actions.SHAPES_DUPLICATE_SHAPE:
            if (state.shapes.selected < 0) { return state; }
            return St.updateShapes(state, shapes => ({
                ...shapes,
                selected: shapes.data.length,
                data: [...shapes.data, {...St.moveShape(St.curShape(state), 10, 10)}]
            }));
        case actions.SHAPES_DELETE_SHAPE:
            if (state.shapes.selected < 0) { return state; }
            return St.updateShapes(state, shapes => ({
                ...shapes,
                selected: St.shiftIndex(shapes.selected, shapes.data.length),
                data: St.sliceOther(shapes.data, shapes.selected)
            }));
    }
};

const gridReducer = (state, action) => {
    switch (action.type) {
        case actions.GRID_CYCLE_SIZE:
            return St.cycleGridSize(state, false);
        case actions.GRID_CYCLE_SIZE_RV:
            return St.cycleGridSize(state, true);
        default:
            break;
    }
    
    return state;
};

const zoomReducer = (state, action) => {
    switch (action.type) {
        case actions.ZOOM_IN:
        case actions.ZOOM_OUT:
            const factor = action.type === actions.ZOOM_IN ? 1.5 : 1 / 1.5;
            return St.updateZoom(state, zoom => {
                const newZoom = St.multiply(zoom.scale, factor, 1, 64);
                const xCenter = (1 / (2 * zoom.scale)) - zoom.translate[0] / state.containerSize[0]; // current center point by ratio
                const yCenter = (1 / (2 * zoom.scale)) - zoom.translate[1] / state.containerSize[1]; // "
                return {
                    ...zoom, 
                    scale: newZoom,
                    translate: [
                        state.containerSize[0] * St.enforceZoomTranslateRange(newZoom, (1 / ( 2 * newZoom) - xCenter)),
                        state.containerSize[1] * St.enforceZoomTranslateRange(newZoom, (1 / ( 2 * newZoom) - yCenter)),
                    ]
                };
            });
        case actions.ZOOM_MOVE_LEFT:
        case actions.ZOOM_MOVE_RIGHT:
        case actions.ZOOM_MOVE_UP:
        case actions.ZOOM_MOVE_DOWN:
            const {isY, isIncrease} = translateMove(action.type);
            const direct = isIncrease ? -1 : 1;
            return St.updateZoom(state, zoom => ({
                ...zoom,
                translate: [
                    isY ? zoom.translate[0] : St.calcMoveZoom(zoom.translate[0], state.containerSize[0], zoom.scale, direct),
                    isY ? St.calcMoveZoom(zoom.translate[1], state.containerSize[1], zoom.scale, direct) : zoom.translate[1] 
                ]
            }));
        default:
            break;
    }

    return state;
};

const modeReducer = (state, action) => {
    switch (action.type) {
        case actions.MODE_POP:
            return St.popMode(state);
        case actions.MODE_PUSH_SHAPE_SELECTED:
            if (state.shapes.selected >= 0) {
                switch (St.curShape(state, sh => sh.type))
                {
                    case 'path':
                        return St.pushMode(state, modes.PATH_SELECTED);
                    case 'ellipse':
                        return St.pushMode(state, modes.ELLIPSE_SELECTED);
                    default:
                        break;
                }
            }
            break;
        case actions.MODE_PUSH_RENAME_DRAWING:
            return St.pushMode(state, modes.RENAME_DRAWING);
        case actions.MODE_PUSH_CONFIG_IMAGE_OVERLAY:
            return St.pushMode(state, modes.CONFIG_IMAGE_OVERLAY);
        case actions.MODE_PUSH_SET_IMAGE_URL:
            return St.pushMode(state, modes.SET_IMAGE_URL);
        case actions.MODE_PUSH_SHOW_ENTIRE_SVG:
            return St.pushMode(state, modes.SHOW_ENTIRE_SVG);
        default:
            break;
    }
    return state;
};

const drawingReducer = (state, action) => {
    switch (action.type) {
        case actions.DRAWING_SET_NAME:
            return {...state, shapes: {...state.shapes, name: action.name }};
        case actions.DRAWING_NEW:
        {
            const newDrawing = Psst.createNewDrawing();
            return {...state, persistId: newDrawing.persistId, shapes: newDrawing.shapes};
        }
        case actions.DRAWING_DUPLICATE:
        {
            const newDrawing = Psst.createNewDrawing();
            return {...state, persistId: newDrawing.persistId, shapes: {...state.shapes, name: newDrawing.shapes.name}};
        }
        case actions.DRAWING_CYCLE_SELECTION:
        {
            const drawing = Psst.loadNextDrawing(state.persistId, false);
            return {...state, persistId: drawing.persistId, shapes: drawing.shapes };
        }
        case actions.DRAWING_CYCLE_SELECTION_RV:
        {
            const drawing = Psst.loadNextDrawing(state.persistId, true);
            return {...state, persistId: drawing.persistId, shapes: drawing.shapes };
        }
        case actions.DRAWING_RESET_CONTAINER_SIZE:
            return {...state, containerSize: St.getDrawingContainerSize(state.display.infoPaneVisible)};
        case actions.DRAWING_DELETE:
            if (window.confirm("Are you sure that you want to delete this drawing?")) {
                const drawing = Psst.deleteDrawing(state.persistId);
                return {...state, persistId: drawing.persistId, shapes: drawing.shapes};
            }
        default:
            break;
    }

    return state;
};

const imageOverlayReducer = (state, action) => {
    switch (action.type) {
        case actions.IMAGE_OVERLAY_SET_URL:
            return St.updateImageOverlay(state, overlay => ({...overlay, url: action.url})); 
        case actions.IMAGE_OVERLAY_ENLARGE:
        case actions.IMAGE_OVERLAY_SHRINK:
        {
            const factor = action.type === actions.IMAGE_OVERLAY_ENLARGE ? 1.1 : 1/1.1;
            return St.updateImageOverlay(state, overlay => ({
                ...overlay, 
                width: St.multiply(overlay.width, factor, 16, 3200),
                height: St.multiply(overlay.height, factor, 16, 3200),
                scale: undefined,
            }));
        }
        case actions.IMAGE_OVERLAY_MORE_OPAQUE:
        case actions.IMAGE_OVERLAY_LESS_OPAQUE:
        {
            const delta = action.type === actions.IMAGE_OVERLAY_MORE_OPAQUE ? 0.1 : -0.1;
            return St.updateImageOverlay(state, overlay => ({
                ...overlay,
                opacity: St.increment(overlay.opacity, delta, 0.1, 1.0)
            }));
        }
        case actions.IMAGE_OVERLAY_MOVE_LEFT:
        case actions.IMAGE_OVERLAY_MOVE_RIGHT:
        case actions.IMAGE_OVERLAY_MOVE_UP:
        case actions.IMAGE_OVERLAY_MOVE_DOWN:
            const {isY, isIncrease} = translateMove(action.type);
            return St.updateImageOverlay(state, overlay => {
                const vPrev = (isY ? overlay.top : overlay.left) || 0;
                const vNew = snap(vPrev, St.gridSize(state), isIncrease);
                return {...overlay, left: isY ? overlay.left : vNew, top: isY ? vNew : overlay.top};
            });
        default:
            break;
    }

    return state;
};

const displayReducer = (state, action) => {
    switch (action.type)
    {
        case actions.DISPLAY_TOGGLE_INFO_PANE:
            const visible = !state.display.infoPaneVisible;
            return {
                ...state, 
                display: {...state.display, infoPaneVisible: visible}, 
                containerSize: St.getDrawingContainerSize(visible),
            };
        case actions.DISPLAY_TOGGLE_SELECTED_SHAPE_INFO:
            return St.updateDisplay(state, display => ({...display, selectedShapeVisible: !display.selectedShapeVisible}));
        case actions.DISPLAY_TOGGLE_KEYBOARD_MAPPING:
            return St.updateDisplay(state, display => ({...display, keyboardMappingVisible: !display.keyboardMappingVisible}));
        default:
            break;
    }
    return state;
};

const mapReducers = [
    { prefix: "POINT_", reducer: pointReducer },
    { prefix: "PATH_", reducer: pathReducer },
    { prefix: "ELLIPSE_", reducer: ellipseReducer },
    { prefix: "SHAPE_", reducer: shapeReducer },
    { prefix: "SHAPES_", reducer: shapesReducer },
    { prefix: "GRID_", reducer: gridReducer },
    { prefix: "MODE_", reducer: modeReducer },
    { prefix: "DRAWING_", reducer: drawingReducer },
    { prefix: "IMAGE_OVERLAY_", reducer: imageOverlayReducer },
    { prefix: "ZOOM_", reducer: zoomReducer },
    { prefix: "DISPLAY_", reducer: displayReducer }
];

export const mainReducer = (state, action) => {
    for (const mi of mapReducers) {
        if (action.type.indexOf(mi.prefix) === 0) {
            return mi.reducer(state, action);
        }
    }

    return state;
} 
