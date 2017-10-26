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
    drawings: [{persistId: ..., name: ...}],
    persistId: number,
    shapes: {
        name: 'name',
        selected: index
        data: [
            { 
                type: 'path',
                selectedSegment: index,
                selectedPoint: index, 
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

export const createInitialState = () => {
    const persistId = generateId(); 
    const name = 'untitled';
    return { 
        containerSize: [800, 500], 
        grid: { 
            sizePresets: [0, 8, 16, 32],
            sizeIndex: 2
        },
        keyMapping: {
            'universal': {
            },
            [modes.TOP]: {
                'g': actions.GRID_CYCLE_SIZE,
                'G': actions.GRID_CYCLE_SIZE_RV,
                ' ': actions.MODE_PUSH_PATH_SELECTED,  // temporary, depends on a currently selected shape type
                'E': actions.DRAWING_NEW,
                'd': actions.DRAWING_CYCLE_SELECTION,
                'D': actions.DRAWING_CYCLE_SELECTION_RV,
                'R': actions.MODE_PUSH_RENAME_DRAWING,
                'p': actions.SHAPES_ADD_PATH,
                'x': actions.SHAPES_DELETE_SHAPE,
                'n': actions.SHAPES_CYCLE_SELECTION,
                'N': actions.SHAPES_CYCLE_SELECTION_RV,
                'h': actions.PATH_MOVE_LEFT,
                'l': actions.PATH_MOVE_RIGHT,
                'k': actions.PATH_MOVE_UP,
                'j': actions.PATH_MOVE_DOWN,
            },
            [modes.PATH_SELECTED]: {
                'g': actions.GRID_CYCLE_SIZE,
                'G': actions.GRID_CYCLE_SIZE_RV,
                ' ': actions.MODE_PUSH_PATH_SEGMENT_SELECTED,
                'Escape': actions.MODE_POP,
                'ctrl-[': actions.MODE_POP,
                'f': actions.SHAPE_TOGGLE_FILL,
                't': actions.PATH_ADD_LINE,
                'q': actions.PATH_ADD_QUADRATIC_BEZIER,
                'c': actions.PATH_ADD_CUBIC_BEZIER,
                'i': actions.PATH_INSERT_POINT,
                'x': actions.PATH_DELETE_POINT,
                'n': actions.PATH_CYCLE_SEGMENT_SELECTION,
                'N': actions.PATH_CYCLE_SEGMENT_SELECTION_RV, 
                'h': actions.PATH_MOVE_LEFT,
                'l': actions.PATH_MOVE_RIGHT,
                'k': actions.PATH_MOVE_UP,
                'j': actions.PATH_MOVE_DOWN,
                's': actions.PATH_TOGGLE_CLOSE,
                'H': actions.POINT_MOVE_LEFT,
                'L': actions.POINT_MOVE_RIGHT,
                'K': actions.POINT_MOVE_UP,
                'J': actions.POINT_MOVE_DOWN,
            },
            [modes.PATH_SEGMENT_SELECTED]: {
                'g': actions.GRID_CYCLE_SIZE,
                'G': actions.GRID_CYCLE_SIZE_RV,
                'Escape': actions.MODE_POP_PATH_SEGMENT_SELECTED,
                'ctrl-[': actions.MODE_POP_PATH_SEGMENT_SELECTED,
                'h': actions.POINT_MOVE_LEFT,
                'l': actions.POINT_MOVE_RIGHT,
                'k': actions.POINT_MOVE_UP,
                'j': actions.POINT_MOVE_DOWN,
                'n': actions.POINT_CYCLE_SELECTION,
                'N': actions.POINT_CYCLE_SELECTION_RV,
            },
            [modes.RENAME_DRAWING]: {
                'Escape': actions.MODE_POP,
                'ctrl-[': actions.MODE_POP,
                'Enter': actions.MODE_POP,
            },
        },
        modes: [ modes.TOP ],
        drawings: [{persistId: persistId, name: name}],
        persistId: persistId,
        shapes: {
            name: name,
            selected: -1,
            data: [],
        },
    };
};


export const generateId = () => {
    const temp = new Uint32Array(1);
    window.crypto.getRandomValues(temp);
    return "ID" + temp[0];
};

// helper methods (TODO: move to a different .js file)

export const cycle = (arrayOrLen, cur, isReverse) => {
    const len = arrayOrLen.length || arrayOrLen;  // incorrect result if array length is 0
    return isReverse ? (cur === 0 ? len - 1 : cur - 1) : ((cur + 1) % len);
}

export const updateArrayItem = (array, index, update) => {
    const copy = [...array];
    copy[index] = update(copy[index]); // update function must create a new object if array holds non-primitive time
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
    {...shape, selectedSegment: cycle(shape.segments, shape.selectedSegment, isReverse), selectedPoint: 0}));

const getSelectedPoint = (curSelection, segment, isReverse) => {
    const factor = segment[0] === 'C' ? 3 : (segment[0] === 'Q' ? 2 : 1);
    return cycle(factor, curSelection, isReverse);
}

export const cyclePathPoints = (state, isReverse) => updateSelectedShape(state, shape => (
    {...shape, selectedPoint: getSelectedPoint(shape.selectedPoint, shape.segments[shape.selectedSegment], isReverse)}));

export const addPathSegment = (state, createNewSegment) => updateSelectedShape(state, shape => (
    {
        ...shape, 
        selectedSegment: shape.segments.length, 
        selectedPoint: 0,
        segments: [...shape.segments, createNewSegment(shape.segments[shape.segments.length - 1])]
    }));
    
export const updatePathSegment = (state, update) => updateSelectedShape(state, shape => (
    {...shape, segments: updateArrayItem(shape.segments, shape.selectedSegment, update)}));

export const movePathSegment = (segment, selectedPoint, dx, dy) => {
    const newSeg = [...segment];
    const updatePoint1 = selectedPoint === 0;
    const updatePoint2 = segment.length > 3 && (selectedPoint === 0 || selectedPoint === 1);
    const updatePoint3 = segment.length > 5 && (selectedPoint === 0 || selectedPoint === 2);
    if (updatePoint1) {
        newSeg[1] += dx;
        newSeg[2] += dy;
    }
    if (updatePoint2) {
        newSeg[3] += dx;
        newSeg[4] += dy;
    }
    if (updatePoint3) {
        newSeg[5] += dx;
        newSeg[6] += dy;
    }
    return newSeg;
}

// svg
const pathSvg = path => {
    let svg = path.segments.map(s => {
        switch (s[0]) {
            case 'M':
            case 'L':
                return s.join(' ');
            case 'Q':
                return [s[0], s[3], s[4], s[1], s[2]].join(' ');
            case 'C':
                return [s[0], s[3], s[4], s[5], s[6], s[1], s[2]].join(' ');
            default:
                return '';
        }}).join(' ');
    if (path.closed) { svg += 'Z'; }
    return svg;
};

export const svg  = shape => {
    let svg = '';
    switch (shape.type) {
        case 'path':
            svg = pathSvg(shape);        
            break;
        default:
            break;
    }
    return svg;
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

