import { actions } from './actions.js';

let gAddPath = 1;

export const pathsReducer = (shapes, action) => {
    switch (action.type) {
        case actions.PATHS_ADD: 
            const pos = 50 * gAddPath++;
            return { ...shapes, 
                selected: shapes.data.length,
                data : [ ...shapes.data, {
                    type: 'path',
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
            edit: { 
                ...state.edit,
                grid: gridReducer(state.edit.grid, action)
            }
        };
    }
    else {
        return state;
    }
    /*
    switch (action.type) {
        case actions.PATHS_ADD:
            return { ...state, 
                paths : [...state.paths, pathReducer(state, action)],
                edit: {...state.edit, selectedPath: state.paths.length}
            };
        case actions.GRID_CYCLE_SIZE:
            const grid = state.edit.grid;
            return { ...state,
                edit: {...state.edit, 
                    grid: {...grid,
                        sizeIndex: (grid.sizeIndex + 1) % grid.sizePresets.length
                    }
                }
            }
        default:
            return state;
    }
    */
};

