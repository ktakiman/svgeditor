import { actions, modes } from './consts.js';

/*  
{
    containerSize: [w, y],
    grid: {
        sizePresets: [0, size1, size2, ....],
        sizeIndex: index
    },
    modes: [....],   // used as stack
    keyMapping: {
        'universal': { key1: action1, key2: action2 },
        mode1: { key1: action1, key2: action2 },
        mode2: { key1: action1, key2: action2 },
    },
    shapes: {
        selected: index
        data: [
            { 
                type: 'path',
                selectedSegment: index,
                closed: bool,
                fill: bool,
                segments: [
                    ['M,L,etc...', n, n, ...]
                ]
            }
        ]
    }
} 
*/

export const createInitialState = () => ({ 
    containerSize: [800, 500], 
    grid: { 
        sizePresets: [0, 8, 16, 32],
        sizeIndex: 0
    },
    keyMapping: {
        'universal': {
            'g': actions.GRID_CYCLE_SIZE,
            'G': actions.GRID_CYCLE_SIZE_RV,
            'Escape': actions.MODE_POP,
            'ctrl-[': actions.MODE_POP,
        },
        [modes.TOP_DEFAULT]: {
            ' ': actions.MODE_PUSH_PATH_SELECT_SEGMENT,  // temporary, depends on a currently selected shape type
            'p': actions.SHAPES_ADD_PATH,
            'D': actions.SHAPES_DELETE_SHAPE,
            'n': actions.SHAPES_CYCLE_SELECTION,
            'N': actions.SHAPES_CYCLE_SELECTION_RV,
            'h': actions.PATH_MOVE_LEFT,
            'l': actions.PATH_MOVE_RIGHT,
            'k': actions.PATH_MOVE_UP,
            'j': actions.PATH_MOVE_DOWN,
        },
        [modes.PATH_SELECT_SEGMENT]: {
            //' ': actions.MODE_PUSH_PATH_SELECT_POINT,
            'a': actions.PATH_ADD_POINT,
            'i': actions.PATH_INSERT_POINT,
            'n': actions.PATH_CYCLE_SEGMENT_SELECTION,
            'N': actions.PATH_CYCLE_SEGMENT_SELECTION_RV, 
            'h': actions.PATH_MOVE_LEFT,
            'l': actions.PATH_MOVE_RIGHT,
            'k': actions.PATH_MOVE_UP,
            'j': actions.PATH_MOVE_DOWN,
            'c': actions.PATH_TOGGLE_CLOSE,
            'f': actions.SHAPE_TOGGLE_CLOSE,
            'H': actions.POINT_MOVE_LEFT,
            'L': actions.POINT_MOVE_RIGHT,
            'K': actions.POINT_MOVE_UP,
            'J': actions.POINT_MOVE_DOWN,
            'D': actions.PATH_DELETE_POINT,
        },
        [modes.PATH_SELECT_POINT]: {
        },
        [modes.PATH_EDIT_POINT]: {
            'h': actions.POINT_MOVE_LEFT,
            'l': actions.POINT_MOVE_RIGHT,
            'k': actions.POINT_MOVE_UP,
            'j': actions.POINT_MOVE_DOWN,
        }
    },
    modes: [ modes.TOP_DEFAULT ],
    shapes: {
        selected: -1,
        data: [],
    },
});

// helper methods (TODO: move to a different .js file)
const cycle = (array, cur, isReverse) => isReverse ? (cur == 0 ? array.length - 1 : cur - 1) : ((cur + 1) % array.length);

export const updateArrayItem = (array, index, update) => {
    const copy = [...array];
    copy[index] = update(copy[index]);
    return copy;
}
    
export const shiftIndex = (index, length) => (index < length - 1) ? index : index - 1;
export const sliceOther = (array, index) => [...array.slice(0, index), ...array.slice(index + 1, array.length)];
export const insertAt = (array, index, item) => {
    const copy = [...array];
    copy.splice(index + 1, 0, item);
    return copy;
}

// shape

export const updateShapes = (state, update) => ({...state, shapes: update(state.shapes)});

export const curShape = (state, callback) => {
    const shape = state.shapes.data[state.shapes.selected];
    return callback ? callback(shape) : shape;
};

export const cycleShape = (state, isReverse) => updateShapes(state, shapes => (
    {...shapes, selected: cycle(shapes.data, shapes.selected, isReverse)}));

export const addShape = (state, newShape) => updateShapes(state, shapes => 
    ({...shapes, selected: shapes.data.length, data: [...shapes.data, newShape]}));

export const updateSelectedShape = (state, update) => updateShapes(state, shapes => (
    {...shapes, data: updateArrayItem(shapes.data, shapes.selected, update)}));

// path
export const curSegment = (state, callback) => curShape(state, shape => {
    const seg = shape.segments[shape.selectedSegment];
    return callback ? callback(seg) : seg;
});

export const cyclePathSegment = (state, isReverse) => updateSelectedShape(state, shape => (
    {...shape, selectedSegment: cycle(shape.segments, shape.selectedSegment, isReverse)}));

export const addPathSegment = (state, newSeg) => updateSelectedShape(state, shape => (
    {...shape, selectedSegment: shape.segments.length, segments: [...shape.segments, newSeg]}));

export const updatePathSegment = (state, update) => updateSelectedShape(state, shape => (
    {...shape, segments: updateArrayItem(shape.segments, shape.selectedSegment, update)}));

export const svg  = shape => {
    let base = shape.segments.map(s => s.join(' ')).join(' ');
    switch (shape.type) {
        case 'path':
            if (shape.closed) { base += 'Z'; }
            break;
        default:
            break;
    }
    return base;
};

// mode
export const curMode = state => state.modes[state.modes.length - 1];
export const pushMode = (state, newMode) => ({...state, modes: [...state.modes, newMode]});
export const popMode = state => state.modes.length == 1 ? state : {...state, modes: [...state.modes].slice(0, state.modes.length - 1)};

// grid
export const gridSize = state => state.grid.sizePresets[state.grid.sizeIndex];

export const updateGrid = (state, update) => ({...state, grid: update(state.grid) });

export const cycleGridSize = (state, isReverse) => updateGrid(state, grid => (
    {...grid, sizeIndex: cycle(grid.sizePresets, grid.sizeIndex, isReverse)}));

