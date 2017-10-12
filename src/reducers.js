import { actions, modes } from './consts.js'; 
import * as St from './state.js';

const snap = (cur, unit, increase) => {
    unit = unit || 1;
    return increase ?
        cur + unit - (cur % unit) :
        cur - (cur % unit === 0 ? unit : (y % unit));
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

const pointReducer = (state, action) => St.updatePathSegment(state, seg => {
        let x = seg[1]; // assuming 'M' or 'L' for now
        let y = seg[2]; //   "
        const unit = St.gridSize(state);
        switch (action.type) {
            case actions.POINT_MOVE_UP:
                y = snap(y, unit, false);
                break;
            case actions.POINT_MOVE_DOWN:
                y = snap(y, unit, true);
                break;
            case actions.POINT_MOVE_LEFT:
                x = snap(x, unit, false);
                break;
            case actions.POINT_MOVE_RIGHT:
                x = snap(x, unit, true);
                break;
            default:
                break;
        }
        
        return [seg[0], x, y];
    });

const pathReducer = (state, action) => {
    switch (action.type) {
        case actions.PATH_CYCLE_SEGMENT_SELECTION:
            return St.cyclePathSegment(state, false);
        case actions.PATH_CYCLE_SEGMENT_SELECTION_RV:
            return St.cyclePathSegment(state, true);
        case actions.PATH_ADD_SEGMENT:
            const curPath = St.curShape(state);
            const lastSeg = curPath.segments[curPath.segments.length - 1];
            return St.addPathSegment(state, ['L', lastSeg[1] + 32, lastSeg[2]]);
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
                segments: path.segments.map(seg => [seg[0], isY ? seg[1] : seg[1] + diff, isY ? seg[2] + diff : seg[2]])
            }));

        default:
            return state;
    }
};

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
                segments: [['M', pos, pos], ['L', pos + 32, pos]]});

            
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
