import React from "react";
import ReactDOM from "react-dom";

import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';

import { mainReducer } from './reducers.js';
import { actions, modes } from './consts.js';

import * as St from './state.js';
import * as Psst from './persist.js';

import { SvgEditor } from './components.jsx';

const persistKey = 'svg-editor-data';

//----------------------------------------------------------------------------------------------------
const logger = store => next => action => {
    next(action);
    console.log(action);

    const newState = store.getState();
    console.log(newState); 
    
    Psst.saveDrawing(newState);
}

const middleware = Redux.applyMiddleware(logger);

const defaultState = St.createInitialState();

const drawing = Psst.loadFirstOrNewDrawing();

const state = { 
    ...defaultState,
    containerSize: St.getDrawingContainerSize(true),
    persistId: drawing.persistId,
    shapes: drawing.shapes,
};

const store = Redux.createStore(mainReducer, state, middleware);

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

window.addEventListener('resize', event => store.dispatch({type: actions.DRAWING_RESET_CONTAINER_SIZE}));

//----------------------------------------------------------------------------------------------------
ReactDOM.render((
    <ReactRedux.Provider store={store}>
        <SvgEditor/>
    </ReactRedux.Provider>), document.getElementById("contents"));
