import React from "react";
import ReactDOM from "react-dom";

import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';

import { mainReducer } from './reducers.js';
import { actions, modes } from './consts.js';


import { SvgEditor } from './components.jsx';

// state -------------------------------------------------------
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

const initialState = { 
    containerSize: [800, 500], 
    grid: { 
        sizePresets: [0, 5, 10, 20, 40],
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
            'a': actions.PATH_ADD_SEGMENT,
            'j': actions.PATH_CYCLE_SEGMENT_SELECTION,
            'k': actions.PATH_CYCLE_SEGMENT_SELECTION_RV, 
        }
    },
    modes: [ modes.TOP_DEFAULT ],
    shapes: {
        data: [],
    },
};


//----------------------------------------------------------------------------------------------------

const logger = store => next => action => {
    next(action);
    console.log(action);
    console.log(store.getState()); 
}

const middleware = Redux.applyMiddleware(logger);

const store = Redux.createStore(mainReducer, initialState, middleware);


//----------------------------------------------------------------------------------------------------
document.addEventListener('keydown', event => {
    const key = (event.ctrlKey ? 'ctrl-' : '') + event.key;
    const state = store.getState();

    // check universal mapping first
    let action = state.keyMapping.universal[key];

    if (!action) {
        const mode = state.modes[state.modes.length - 1];
        action = state.keyMapping[mode][key];
    }
    
    if (action) { store.dispatch({type: action}); }
    
    console.log('key = ' + event.key);
});

//----------------------------------------------------------------------------------------------------
ReactDOM.render((
    <ReactRedux.Provider store={store}>
        <SvgEditor/>
    </ReactRedux.Provider>), document.getElementById("contents"));
