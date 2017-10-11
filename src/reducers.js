import { actions, modes } from './consts.js'; 
import * as St from './state.js';

export const pointReducer = (segment, gridSize, action) => {
    let x = segment[1]; // assuming 'M' or 'L' for now
    let y = segment[2]; //   "
    switch (action) {
        case actions.POINT_MOVE_UP:
            y = y - (y % gridSize === 0 ? gridSize : (y % gridSize));
            break;
        case actions.POINT_MOVE_DOWN:
            y = y + gridSize - (y % gridSize);
            break;
        case actions.POINT_MOVE_LEFT:
            x = x - (x % gridSize === 0 ? gridSize : (x % gridSize));
            break;
        case actions.POINT_MOVE_RIGHT:
            x = x + gridSize - (x % gridSize);
            break;
        default:
            break;
    }

    return [segment[0], x, y];
};

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

export const mainReducer = (state, action) => {
    if (action.type.indexOf("PATH") === 0) {
        return pathReducer(state, action);
    }
    else if (action.type.indexOf("SHAPES") === 0) {
        return shapesReducer(state, action);
    }
    else if (action.type.indexOf("GRID") === 0) {
        return gridReducer(state, action);
    }
    else if (action.type.indexOf("MODE") === 0) {
        return modeReducer(state, action);
    }

    return state;
};

