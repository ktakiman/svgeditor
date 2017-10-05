import { actions, modes } from './consts.js';

export const pathReducer = (data, action) => {
    switch (action.type) {
        case actions.PATH_CYCLE_SEGMENT_SELECTION:
            return { ...data,
                selectedSegment: (data.selectedSegment + 1) % data.segments.length
            };
        case actions.PATH_CYCLE_SEGMENT_SELECTION_RV:
            return { ...data,
                selectedSegment: data.selectedSegment == 0 ? data.segments.length - 1 : data.selectedSegment -1
            };
        case actions.PATH_ADD_SEGMENT:
            const last = data.segments[data.segments.length - 1];
            return { ...data,
                segments: [...data.segments, ['L', last[1] + 50, last[2]]],
                selectedSegment: data.segments.length
            }
        default:
            return data;
    }
}

let gAddPath = 1;

export const pathsReducer = (shapes, action) => {
    switch (action.type) {
        case actions.PATHS_ADD: 
            const pos = 50 * gAddPath++;
            return { ...shapes, 
                selected: shapes.data.length,
                data : [ ...shapes.data, {
                    type: 'path',
                    selectedSegment: 0,
                    segments: [['M', pos, pos], ['L', pos + 50, pos]]
                }]
            };
        case actions.PATHS_CYCLE_SELECTION:
            return { ...shapes,
                selected: (shapes.selected + 1) % shapes.data.length
            };
        case actions.PATHS_CYCLE_SELECTION_RV:
            return { ...shapes,
                selected: shapes.selected == 0 ? shapes.data.length - 1 : shapes.selected - 1
            };
        case actions.PATH_CYCLE_SEGMENT_SELECTION:
        case actions.PATH_CYCLE_SEGMENT_SELECTION_RV:
        case actions.PATH_ADD_SEGMENT:
            const dataCopy = [...shapes.data];
            dataCopy[shapes.selected] = pathReducer(dataCopy[shapes.selected], action);
            return { ...shapes,
                data: dataCopy
            };
        default:
            return shapes;
    }
};

export const gridReducer = (grid, action) => {
    switch (action.type) {
        case actions.GRID_CYCLE_SIZE:
            return {
                ...grid,
                sizeIndex: (grid.sizeIndex + 1) % grid.sizePresets.length
            };
        case actions.GRID_CYCLE_SIZE_RV:
            return {
                ...grid,
                sizeIndex: grid.sizeIndex == 0 ? grid.sizePresets.length - 1 : grid.sizeIndex - 1
            };
        default:
            return grid;
    }
}

export const mainReducer = (state, action) => {
    if (action.type.indexOf("PATH") == 0) {
        return {
            ...state,
            shapes: pathsReducer(state.shapes, action),
        };
    }
    else if (action.type.indexOf("GRID") == 0) {
        return {
            ...state,
            grid: gridReducer(state.grid, action)
        };
    }
    else if (action.type === actions.MODE_PUSH_PATH_SELECT_SEGMENT) {
        return {
            ...state,
            modes: [...state.modes, modes.PATH_SELECT_SEGMENT ]
        };
    }
    else if (action.type === actions.MODE_POP) {
        if (state.modes.length > 1) {
            return {
                ...state,
                modes: [...state.modes.slice(0, state.modes.length - 1)]
            };
        }
    }

    return state;
};

