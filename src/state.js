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
                type: 'path', // etc
                selectedSegment: index,
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
            'a': actions.PATHS_ADD,
            'j': actions.PATHS_CYCLE_SELECTION,
            'k': actions.PATHS_CYCLE_SELECTION_RV,
        },
        [modes.PATH_SELECT_SEGMENT]: {
            ' ': actions.MODE_PUSH_PATH_SELECT_POINT,
            'a': actions.PATH_ADD_SEGMENT,
            'j': actions.PATH_CYCLE_SEGMENT_SELECTION,
            'k': actions.PATH_CYCLE_SEGMENT_SELECTION_RV, 
        },
        [modes.PATH_SELECT_POINT]: {
        },
        [modes.PATH_EDIT_POINT]: {
        }
    },
    modes: [ modes.TOP_DEFAULT ],
    shapes: {
        data: [],
    },
});

export const curMode = state => state.modes[state.modes.length - 1];

export const curShape = state => state.shapes.data[state.shapes.selected];

export const curSegment = data => data.segments[data.selectedSegment];

export const svg = segments => segments.map(s => s.join(' ')).join(' ');

