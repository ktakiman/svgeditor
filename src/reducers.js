import { actions, modes } from './consts.js'; 
import * as St from './state.js';
import * as Psst from './persist.js';

const snap = (cur, unit, increase) => {
    unit = unit || 1;
    return increase ?
        cur + unit - (cur % unit) :
        cur - (cur % unit === 0 ? unit : (cur % unit));
};

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

const pointReducer = (state, action) => {
    switch (action.type) {
        case actions.POINT_MOVE_UP:
        case actions.POINT_MOVE_DOWN:
        case actions.POINT_MOVE_LEFT:
        case actions.POINT_MOVE_RIGHT:
            const {isY, isIncrease} = translateMove(action.type);
            const unit = St.gridSize(state);
            const selectedPoint = St.curShape(state).selectedPoint;
            const xi = 1 + selectedPoint * 2;
            const yi = 2 + selectedPoint * 2;
            return St.updatePathSegment(state, seg => St.movePathSegment(
                seg,
                isY ? 0 : snap(seg[xi], unit, isIncrease) - seg[xi], 
                isY ? snap(seg[yi], unit, isIncrease) - seg[yi] : 0,
                selectedPoint, 
            ));
        case actions.POINT_CYCLE_SELECTION:
            return St.cyclePathPoints(state, false);
        case actions.POINT_CYCLE_SELECTION_RV:
            return St.cyclePathPoints(state, false);
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
        case actions.PATH_INSERT_POINT:
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
                    case actions.PATH_INSERT_POINT:
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
        case actions.PATH_DELETE_POINT:
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
        case actions.PATH_MOVE_UP:
        case actions.PATH_MOVE_DOWN:
        case actions.PATH_MOVE_LEFT:
        case actions.PATH_MOVE_RIGHT:
            const {isY, isIncrease} = translateMove(action.type);
            const curSeg = St.curSegment(state);
            const vPrev = curSeg[isY ? 2 : 1];
            const vNew = snap(vPrev, St.gridSize(state), isIncrease);
            const diff = vNew - vPrev;
            return St.updateSelectedShape(state, shape => St.moveShape(shape, isY ? 0 : diff, isY ? diff : 0));
        default:
            return state;
    }
};

const shapeReducer = (state, action) => {
    switch (action.type) {
        case actions.SHAPE_TOGGLE_FILL:
            return St.updateSelectedShape(state, shape => ({...shape, fill: !shape.fill}));
        default:
            return state;
    }
}

let gAddPath = 1;

const shapesReducer = (state, action) => {
    switch (action.type) {
        case actions.SHAPES_CYCLE_SELECTION:
            return St.cycleShape(state, false);
        case actions.SHAPES_CYCLE_SELECTION_RV:
            return St.cycleShape(state, true);
        case actions.SHAPES_ADD_PATH:
            const pos = 32 * gAddPath++;
            return St.addShape(state, {
                type: 'path',
                selectedSegment: 0,
                closed: false,
                fill: false,
                segments: [['M', pos, pos], ['L', pos + 32, pos]]});
        case actions.SHAPES_DUPLICATE_SHAPE:
            return St.updateShapes(state, shapes => ({
                ...shapes,
                selected: shapes.data.length,
                data: [...shapes.data, {...St.moveShape(St.curShape(state), 10, 10)}]
            }));
        case actions.SHAPES_DELETE_SHAPE:
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
                return {
                    ...zoom, 
                    scale: newZoom,
                    translate: [
                        St.calcMoveZoom(zoom.translate[0], state.containerSize[0], newZoom, 0),
                        St.calcMoveZoom(zoom.translate[1], state.containerSize[1], newZoom, 0)
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
        case actions.MODE_PUSH_PATH_SELECTED:
            if (state.shapes.selected >= 0) {
                return St.pushMode(state, modes.PATH_SELECTED);
            }
            break;
        case actions.MODE_PUSH_PATH_SEGMENT_SELECTED:
            return St.pushMode(state, modes.PATH_SEGMENT_SELECTED);
        case actions.MODE_POP_PATH_SEGMENT_SELECTED:
            return St.popMode(St.updateSelectedShape(state, shape => ({...shape, selectedPoint: 0})));
        case actions.MODE_PUSH_RENAME_DRAWING:
            return St.pushMode(state, modes.RENAME_DRAWING);
        case actions.MODE_PUSH_CONFIG_IMAGE_OVERLAY:
            return St.pushMode(state, modes.CONFIG_IMAGE_OVERLAY);
        case actions.MODE_PUSH_SET_IMAGE_URL:
            return St.pushMode(state, modes.SET_IMAGE_URL);
        default:
            break;
    }
    return state;
};

const cycleDrawing = (state, isReverse) => {
    const curIndex = state.drawings.findIndex(d => d.persistId === state.persistId);
    const newIndex = St.cycle(state.drawings.length, curIndex, isReverse);
    const newId = state.drawings[newIndex].persistId;

    const newShapes = Psst.loadDrawing(newId);
    return {...state, persistId: newId, shapes: newShapes };
};

const drawingReducer = (state, action) => {
    switch (action.type) {
        case actions.DRAWING_SET_NAME:
            return {...state, shapes: {...state.shapes, name: action.name }};
        case actions.DRAWING_NEW:
            var newState = St.createInitialState();
            return {...state, drawings: [...state.drawings, ...newState.drawings], persistId: newState.persistId, shapes: newState.shapes};
        case actions.DRAWING_CYCLE_SELECTION:
            return cycleDrawing(state, false);
        case actions.DRAWING_CYCLE_SELECTION_RV:
            return cycleDrawing(state, true);
        default:
            break;
    }

    return state;
};

const imageOverlayReducer = (state, action) => {
    switch (action.type) {
        case actions.IMAGE_OVERLAY_SET_URL:
            return St.updateImageOverlay(state, overlay => ({...overlay, url: action.url})); case actions.IMAGE_OVERLAY_ENLARGE:
        case actions.IMAGE_OVERLAY_SHRINK:
        {
            const delta = action.type === actions.IMAGE_OVERLAY_ENLARGE ? 0.1 : -0.1;
            return St.updateImageOverlay(state, overlay => ({
                ...overlay, 
                scale: St.increment(overlay.scale, delta, 0.1, 10.0)
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

const mapReducers = [
    { prefix: "PATH", reducer: pathReducer },
    { prefix: "SHAPES", reducer: shapesReducer },
    { prefix: "SHAPE", reducer: shapeReducer },
    { prefix: "GRID", reducer: gridReducer },
    { prefix: "MODE", reducer: modeReducer },
    { prefix: "POINT", reducer: pointReducer },
    { prefix: "DRAWING", reducer: drawingReducer },
    { prefix: "IMAGE_OVERLAY", reducer: imageOverlayReducer },
    { prefix: "ZOOM", reducer: zoomReducer },
];

export const mainReducer = (state, action) => {
    for (const mi of mapReducers) {
        if (action.type.indexOf(mi.prefix) === 0) {
            return mi.reducer(state, action);
        }
    }

    return state;
} 
