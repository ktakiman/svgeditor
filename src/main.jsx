import React from "react";
import ReactDOM from "react-dom";

import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';

const t = { a: 1, b : 2 };
const t2 = { ...t };

const actions = {
    PATHS_ADD: "PATHS_ADD",
    PATHS_CYCLE_SELECTION: "PATHS_CYCLE_SELECTION",
    PATHS_CYCLE_SELECTION_RV: "PATHS_CYCLE_SELECTION_RV",
    GRID_CYCLE_SIZE: "GRID_CYCLE_SIZE",
    GRID_CYCLE_SIZE_RV: "GRID_CYCLE_SIZE_RV"
};

//const mode = {

// state -------------------------------------------------------
    /*  
    {
        containerSize: [w, y],
        edit: {
            grid: {
                sizePresets: [0, size1, size2, ....],
                sizeIndex: index
            },
        },
        shapes: {
            selected: index
            data: [
                { 
                    type: 'path', // etc
                    segments: [
                        ['M,L,etc...', n, n, ...]
                    ]
                }
            ]
        }
    } 
    */

const initialState = { 
    containerSize: [800, 500], 
    shapes: {
        data: [],
    },
    edit: {
        grid: { 
            sizePresets: [0, 5, 10, 20, 40],
            sizeIndex: 0
        }
    }
};

// reducers ----------------------------------------------------

let gAddPath = 1;

const pathsReducer = (shapes, action) => {
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

const gridReducer = (grid, action) => {
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

const mainReducer = (state, action) => {
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


// components --------------------------------------------------

const Path = ({segments, isSelected}) => {
    const path = segments.map(seg => seg.join(' ')).join(' ');
    return <path className={isSelected ? 'selected' : null} d={path}/>;
};

const Shapes = ({shapes, selected}) => {
    const ps = shapes.data.map((sh, i) => {
        switch (sh.type)
        {
            case 'path': return <Path segments={sh.segments} isSelected={i == selected} key={i}/>;
            default: return null;
        }
    });
    return <g>{ps}</g>;
};

const Grid = ({size, width, height}) => {
    const grid = [];
    for (let x = size; x < width; x += size) {
        grid.push(<line className='grid' x1={x} y1='0' x2={x} y2={height} key={'v' + x}/>);
    }

    for (let y = size; y < height; y += size) {
        grid.push(<line className='grid' x1='0' y1={y} x2={width} y2={y} key={'h' + y}/>);
    }
    return <g>{grid}</g>;
}

//----------------------------------------------------------------------------------------------------
let SvgContainer = ({containerSize, shapes, edit}) => {
    const width = containerSize[0];
    const height = containerSize[1];
    const gridSize = edit.grid.sizePresets[edit.grid.sizeIndex];
    const grid = gridSize > 0 ? <Grid width={width} height={height} size={gridSize}/> : null;
    return (
        <svg width={width} height={height}>
            {grid}
            <Shapes shapes={shapes} selected={shapes.selected}/>
        </svg>
    );
};

SvgContainer = ReactRedux.connect(
    state => ({
        containerSize: state.containerSize,
        shapes: state.shapes,
        edit: state.edit
    }),
    null
)(SvgContainer);


//----------------------------------------------------------------------------------------------------
let ActionButtons = ({onAddPath}) => {
    return (
        <div className='button-group'>
            <button onClick={onAddPath}>Add Path</button>
        </div>
    );
};

ActionButtons = ReactRedux.connect(
    state => ({}),
    dispatch => ({
        onAddPath: () => dispatch({type: actions.PATHS_ADD})
    })
)(ActionButtons);

//----------------------------------------------------------------------------------------------------
const SvgEditor = ({state}) => {
    return (
        <div>
            <div><SvgContainer/></div>
            <ActionButtons/>
        </div>
    );
}

//----------------------------------------------------------------------------------------------------

const logger = store => next => action => {
    next(action);
    console.log(action);
    console.log(store.getState()); 
}

const middleware = Redux.applyMiddleware(logger);

const store = Redux.createStore(mainReducer, initialState, middleware);

window.store = store;

//----------------------------------------------------------------------------------------------------
document.addEventListener('keydown', event => {
    switch (event.key)
    {
        case 'a':
            store.dispatch({type: actions.PATHS_ADD});
            break;
        case 'g':
            store.dispatch({type: actions.GRID_CYCLE_SIZE});
            break;
        case 'G':
            store.dispatch({type: actions.GRID_CYCLE_SIZE_RV});
            break;
        case 'k':
            store.dispatch({type: actions.PATHS_CYCLE_SELECTION_RV});
            break;
        case 'j':
            store.dispatch({type: actions.PATHS_CYCLE_SELECTION});
            break;
        default:
            break;
    }

    console.log(event.key);
});

//----------------------------------------------------------------------------------------------------
ReactDOM.render((
    <ReactRedux.Provider store={store}>
        <SvgEditor/>
    </ReactRedux.Provider>), document.getElementById("contents"));
