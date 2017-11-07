import { actions, modes } from './consts.js';

/*  
{
    containerSize: [w, y],
    grid: {
        sizePresets: [0, size1, size2, ....],
        sizeIndex: index
    },
    zoom: {
        scale: num,
        translate: [x, y],
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
        selected: index,
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
            },
            {
                type: 'circle',
                fill: bool,
                center: [x, y],
                radius: number
            }
        ],
        imageOverlay: {
            url: string,
            opacity: 0.1 ~ 1.0,
            scale: 0.1 ~ 1.0,
            left: x,
            top: y,
        }
    }
} 
*/

export const createInitialState = () => {
    const persistId = generateId(); 
    const name = 'untitled';
    return { 
        containerSize: [800, 576], 
        grid: { 
            sizePresets: [0, 8, 16, 32],
            sizeIndex: 2
        },
        zoom: {
            scale: 1,
            translate: [0, 0],
        },
        keyMapping: {
            'universal': {
            },
            [modes.TOP]: {
                'g': actions.GRID_CYCLE_SIZE,
                'G': actions.GRID_CYCLE_SIZE_RV,
                ' ': actions.MODE_PUSH_SHAPE_SELECTED,
                'W': actions.DRAWING_NEW,
                'y': actions.DRAWING_CYCLE_SELECTION,
                'Y': actions.DRAWING_CYCLE_SELECTION_RV,
                'R': actions.MODE_PUSH_RENAME_DRAWING,
                'I': actions.MODE_PUSH_CONFIG_IMAGE_OVERLAY,
                'p': actions.SHAPES_ADD_PATH,
                'c': actions.SHAPES_ADD_CIRCLE,
                'e': actions.SHAPES_ADD_ELLIPSE,
                'd': actions.SHAPES_DUPLICATE_SHAPE,
                'X': actions.SHAPES_DELETE_SHAPE,
                'n': actions.SHAPES_CYCLE_SELECTION,
                'N': actions.SHAPES_CYCLE_SELECTION_RV,
                'f': actions.SHAPE_TOGGLE_FILL,
                '<': actions.SHAPE_ENLARGE,
                '>': actions.SHAPE_SHRINK,
                'h': actions.SHAPE_MOVE_LEFT,
                'l': actions.SHAPE_MOVE_RIGHT,
                'k': actions.SHAPE_MOVE_UP,
                'j': actions.SHAPE_MOVE_DOWN,
                'z': actions.ZOOM_IN,
                'Z': actions.ZOOM_OUT,
                'H': actions.ZOOM_MOVE_LEFT,
                'L': actions.ZOOM_MOVE_RIGHT,
                'K': actions.ZOOM_MOVE_UP,
                'J': actions.ZOOM_MOVE_DOWN,
            },
            [modes.PATH_SELECTED]: {
                'g': actions.GRID_CYCLE_SIZE,
                'G': actions.GRID_CYCLE_SIZE_RV,
                'Escape': actions.MODE_POP,
                'ctrl-[': actions.MODE_POP,
                'f': actions.SHAPE_TOGGLE_FILL,
                't': actions.PATH_ADD_LINE,
                'q': actions.PATH_ADD_QUADRATIC_BEZIER,
                'c': actions.PATH_ADD_CUBIC_BEZIER,
                'T': actions.PATH_INSERT_POINT,
                'Q': actions.PATH_INSERT_QUADRATIC_BEZIER,
                'C': actions.PATH_INSERT_CUBIC_BEZIER,
                'x': actions.PATH_DELETE_POINT,
                'n': actions.PATH_CYCLE_SEGMENT_SELECTION,
                'N': actions.PATH_CYCLE_SEGMENT_SELECTION_RV, 
                's': actions.PATH_TOGGLE_CLOSE,
                'h': actions.POINT_MOVE_LEFT,
                'l': actions.POINT_MOVE_RIGHT,
                'k': actions.POINT_MOVE_UP,
                'j': actions.POINT_MOVE_DOWN,
                'm': actions.POINT_CYCLE_SELECTION,
                'M': actions.POINT_CYCLE_SELECTION_RV, 
                'p': actions.POINT_PROMOTE_BEZIER,
                'P': actions.POINT_DEMOTE_BEZIER,
                'z': actions.ZOOM_IN,
                'Z': actions.ZOOM_OUT,
                'H': actions.ZOOM_MOVE_LEFT,
                'L': actions.ZOOM_MOVE_RIGHT,
                'K': actions.ZOOM_MOVE_UP,
                'J': actions.ZOOM_MOVE_DOWN,
            },
            [modes.ELLIPSE_SELECTED]: {
                'g': actions.GRID_CYCLE_SIZE,
                'G': actions.GRID_CYCLE_SIZE_RV,
                'Escape': actions.MODE_POP,
                'ctrl-[': actions.MODE_POP,
                'f': actions.SHAPE_TOGGLE_FILL,
                '<': actions.SHAPE_ENLARGE,
                '>': actions.SHAPE_SHRINK,
                'h': actions.ELLIPSE_SHRINK_HZ,
                'l': actions.ELLIPSE_ENLARGE_HZ,
                'k': actions.ELLIPSE_SHRINK_VT,
                'j': actions.ELLIPSE_ENLARGE_VT,
                'z': actions.ZOOM_IN,
                'Z': actions.ZOOM_OUT,
                'H': actions.ZOOM_MOVE_LEFT,
                'L': actions.ZOOM_MOVE_RIGHT,
                'K': actions.ZOOM_MOVE_UP,
                'J': actions.ZOOM_MOVE_DOWN,
            },
            [modes.RENAME_DRAWING]: {
                'Escape': actions.MODE_POP,
                'ctrl-[': actions.MODE_POP,
                'Enter': actions.MODE_POP,
            },
            [modes.SET_IMAGE_URL]: {
                'Escape': actions.MODE_POP,
                'ctrl-[': actions.MODE_POP,
                'Enter': actions.MODE_POP,
            },
            [modes.CONFIG_IMAGE_OVERLAY]: {
                'Escape': actions.MODE_POP,
                'ctrl-[': actions.MODE_POP,
                'i': actions.MODE_PUSH_SET_IMAGE_URL,
                'g': actions.GRID_CYCLE_SIZE,
                'G': actions.GRID_CYCLE_SIZE_RV,
                '<': actions.IMAGE_OVERLAY_ENLARGE,
                '>': actions.IMAGE_OVERLAY_SHRINK,
                'o': actions.IMAGE_OVERLAY_MORE_OPAQUE,
                'O': actions.IMAGE_OVERLAY_LESS_OPAQUE,
                'h': actions.IMAGE_OVERLAY_MOVE_LEFT,
                'l': actions.IMAGE_OVERLAY_MOVE_RIGHT,
                'k': actions.IMAGE_OVERLAY_MOVE_UP,
                'j': actions.IMAGE_OVERLAY_MOVE_DOWN,
            },
        },
        modes: [ modes.TOP ],
        drawings: [{persistId: persistId, name: name}],
        persistId: persistId,
        shapes: {
            name: name,
            selected: -1,
            data: [],
            imageOverlay: {
                /*url: 'https://cdn.pixabay.com/photo/2016/05/30/20/54/bass-clef-1425777_960_720.png',*/
                url: 'http://n-jinny.com/wp-content/uploads/2013/12/img_486492_8491336_1.jpg',
                scale: 1.0,
                opacity: 0.4,
                left: 0,
                top: 0,
            },
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

export const increment = (value, delta, min, max) => Math.min(Math.max(value + delta, min), max);
export const multiply = (value, factor, min, max) => Math.min(Math.max(value * factor, min), max);
export const notZero = (orgValue, newValue) => newValue <= 0 ? orgValue : newValue;

export const round = num => Math.round(num * 100) / 100;

export const roundSegment = segment => segment.map((v, i) => i == 0 ? v : round(v));

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

export const cyclePathPoints = (shape, isReverse) => (
    {...shape, selectedPoint: getSelectedPoint(shape.selectedPoint, shape.segments[shape.selectedSegment], isReverse)});

export const cycleEllipsePoints = (state, isReverse) => updateSelectedShape(state, shape => (
    {...shape, selectedPoint: cycle(3, shape.selectedSegment, isReverse)}));

export const addPathSegment = (state, createNewSegment) => updateSelectedShape(state, shape => (
    {
        ...shape, 
        selectedSegment: shape.segments.length, 
        selectedPoint: 0,
        segments: [...shape.segments, createNewSegment(shape.segments[shape.segments.length - 1])]
    }));
    
export const updatePathSegment = (path, update) => (
    {...path, segments: updateArrayItem(path.segments, path.selectedSegment, update)});

export const movePathSegment = (segment, dx, dy, selectedPoint) => {
    const moveAll = selectedPoint === undefined;
    const newSeg = [...segment];
    const updatePoint1 = moveAll || selectedPoint === 0;
    const updatePoint2 = segment.length > 3 && (moveAll || selectedPoint === 1);
    const updatePoint3 = segment.length > 5 && (moveAll || selectedPoint === 2);
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
};

export const moveShape = (shape, dx, dy) => {
    switch (shape.type) {
        case 'path':
            return {
                ...shape, 
                segments: shape.segments.map(seg => movePathSegment(seg, dx, dy))
            };
        case 'circle':
        case 'ellipse':
            return {
                ...shape,
                center: [shape.center[0] + dx, shape.center[1] + dy]
            }
        default:
            break;
    }
};

const calcMinMax = ({min, max}, val) => ({ min: Math.min(min, val), max: Math.max(max, val) });
const joinMinMax = (mm1, mm2) => ({ min: Math.min(mm1.min, mm2.min), max: Math.max(mm1.max, mm2.max) });
    
const getPointMinMax = (segment) => {
    let x = { min: segment[1], max: segment[1] };
    let y = { min: segment[2], max: segment[2] };

    if (segment.length >= 5) {
        x = calcMinMax(x, segment[3]);
        y = calcMinMax(y, segment[4]);
    }

    if (segment.length >= 7) {
        x = calcMinMax(x, segment[5]);
        y = calcMinMax(y, segment[6]);
    }

    return { x, y };
};

export const resizePath = (segments, max, isIncrease) => {
    const minmax = segments.reduce((ag, seg) => {
        const ptMinMax = getPointMinMax(seg);
        return { x: joinMinMax(ag.x, ptMinMax.x), y: joinMinMax(ag.y, ptMinMax.y) };
    }, { x: { min: Number.MAX_VALUE, max: -Number.MAX_VALUE }, y: { min: Number.MAX_VALUE, max: -Number.MAX_VALUE }});

    const xRange = minmax.x.max - minmax.x.min;
    const yRange = minmax.y.max - minmax.y.min;
    const xCenter = minmax.x.min + xRange / 2;
    const yCenter = minmax.y.min + yRange / 2;
    let factor = 1 + max / Math.max(xRange, yRange) * (isIncrease ? 1 : -1);
    if (factor < 0) { factor = 1; }

    return segments.map(seg => seg.map((pt, i) => {
        if (i === 0) {
            return pt;
        } else if (i % 2 == 1) {
            return round(xCenter + (pt - xCenter) * factor);
        } else {
            return round(yCenter + (pt - yCenter) * factor);
        }
    }));
};

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

export const updateGrid = (state, update) => ({...state, grid: update(state.grid)});

export const cycleGridSize = (state, isReverse) => updateGrid(state, grid => (
    {...grid, sizeIndex: cycle(grid.sizePresets, grid.sizeIndex, isReverse)}));

// image-overlay
export const updateImageOverlay = (state, update) => updateShapes(state, shapes => ({...shapes, imageOverlay: update(shapes.imageOverlay)}));

// zoom
export const updateZoom = (state, update) => ({...state, zoom: update(state.zoom)});

export const enforceZoomTranslateRange = (scale, ratio) => Math.min(0, Math.max(ratio, 1 / scale - 1));

export const calcMoveZoom = (curValue, size, scale, factor) => 
    increment(curValue, factor * size / (4 * scale), -(scale - 1) * size / scale, 0);

