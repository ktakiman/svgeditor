import { actions, modes } from './consts.js'; 
import * as St from './state.js';

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
            return St.updatePathSegment(state, seg => St.movePathSegment(
                seg,
                isY ? 0 : snap(seg[1], unit, isIncrease) - seg[1], 
                isY ? snap(seg[2], unit, isIncrease) - seg[2] : 0
            ));
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
        case actions.PATH_ADD_BEZIER:
            return St.addPathSegment(state, lastSeg => ['Q', lastSeg[1] + 32, lastSeg[2], lastSeg[1], lastSeg[2] + 32]);
        case actions.PATH_ADD_CUBIC_BEZIER:
            return St.addPathSegment(state, lastSeg => ['C', 
                lastSeg[1] + 32, lastSeg[2], 
                lastSeg[1] + 16, lastSeg[2] - 32, 
                lastSeg[1] + 16, lastSeg[2] + 32]);
        case actions.PATH_INSERT_POINT:
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

                const newPt = ['L', (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
                return { 
                    ...shape, 
                    selectedSegment: shape.selectedSegment + 1,
                    segments: St.insertAt(shape.segments, shape.selectedSegment, newPt)
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
            return St.updateSelectedShape(state, path => ({
                ...path, 
                segments: path.segments.map(seg => St.movePathSegment(seg, isY ? 0 : diff, isY ? diff : 0))
            }));

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
            return state;
    }
};

const modeReducer = (state, action) => {
    switch (action.type) {
        case actions.MODE_POP:
            return St.popMode(state);
        case actions.MODE_PUSH_PATH_SELECT_SEGMENT:
            return St.pushMode(state, modes.PATH_SELECT_SEGMENT);
        case actions.MODE_PUSH_PATH_SELECT_POINT:
            const ptType = St.curSegment(state)[0];
            const newMode = ptType === 'M' || ptType === 'L' ? modes.PATH_EDIT_POINT : modes.PATH_SELECT_POINT;
            return St.pushMode(state, newMode);
        default:
            return state;
    }
};

const mapReducers = [
    { prefix: "PATH", reducer: pathReducer },
    { prefix: "SHAPES", reducer: shapesReducer },
    { prefix: "SHAPE", reducer: shapeReducer },
    { prefix: "GRID", reducer: gridReducer },
    { prefix: "MODE", reducer: modeReducer },
    { prefix: "POINT", reducer: pointReducer }
];

export const mainReducer = (state, action) => {
    for (const mi of mapReducers) {
        if (action.type.indexOf(mi.prefix) === 0) {
            return mi.reducer(state, action);
        }
    }

    return state;
} 
