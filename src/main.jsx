import React from "react";
import ReactDOM from "react-dom";

import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';

import { mainReducer } from './reducers.js';
import { actions, modes } from './consts.js';

import * as St from './state.js';

import { SvgEditor } from './components.jsx';

const persistKey = 'svg-editor-data';

//----------------------------------------------------------------------------------------------------
const generateId = () => {
    const temp = new Uint32Array(1);
    window.crypto.getRandomValues(temp);
    return "ID" + temp[0];
};

let persisted = JSON.parse(localStorage[persistKey] || "{}");

//----------------------------------------------------------------------------------------------------
const logger = store => next => action => {
    next(action);
    console.log(action);

    const newState = store.getState();
    console.log(newState); 
    
    persisted[newState.persistId] = newState.shapes;
    localStorage[persistKey] = JSON.stringify(persisted); 
}

const middleware = Redux.applyMiddleware(logger);

const defaultState = St.createInitialState();

let state;
const id = Object.keys(persisted).find(k => k.indexOf("ID") === 0);

if (id) {
    const shapes = persisted[id];
    state = { 
        ...defaultState,
        shapes: shapes,
        persistId: id
    };
} else {
    state = {
        ...defaultState,
        persistId: generateId()
    };
}

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

//----------------------------------------------------------------------------------------------------
ReactDOM.render((
    <ReactRedux.Provider store={store}>
        <SvgEditor/>
    </ReactRedux.Provider>), document.getElementById("contents"));
