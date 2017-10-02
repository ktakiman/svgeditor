import React from "react";
import ReactDOM from "react-dom";

import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';

import { mainReducer } from './reducers.js';
import { actions } from './actions.js';

import { SvgEditor } from './components.jsx';

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
