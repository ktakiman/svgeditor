import * as St from './state.js';

const persistKey = 'svg-editor-data';

// localStorage version -------------------------------------------
 
let persisted = {};
let allUndos = {};

const json = localStorage[persistKey];
if (json) {
    persisted = JSON.parse(json);
    allUndos = Object.keys(persisted).reduce((ag, id) => { 
        ag[id] = { pos: 0, stack: [ persisted[id] ] };
        return ag;
    }, {});
}

const save = () => {
    localStorage[persistKey] = JSON.stringify(persisted);
};

const addNew = () => {
    const newState = St.createInitialState();
    persisted[newState.persistId] = newState.shapes; 
    allUndos[newState.persistId] = { pos: 0, stack: [ newState.shapes ] };
    return newState.persistId;
}

const getNextId = (curId, isReverse) => {
    const ids = Object.keys(persisted);
    const curIndex = ids.indexOf(curId);
    if (curIndex >= 0) {
        const nextIndex = St.cycle(ids, curIndex, isReverse);
        return ids[nextIndex];
    }
};

export const listDrawings = () => Object.keys(persisted).map(id => ({ persistId: id, name: persisted[id].name }));
export const loadDrawing = id => persisted[id];

export const loadFirstOrNewDrawing = () => {
    const ids = Object.keys(persisted);
    const id = ids.length > 0 ? ids[0] : addNew();
    return { persistId: id, undo: allUndos[id], shapes: persisted[id] };
}

export const loadNextDrawing = (curId, isReverse) => {
    const nextId = getNextId(curId, isReverse);
    if (nextId) {
        return { persistId: nextId, undo: allUndos[nextId], shapes: persisted[nextId] };
    }
}

export const createNewDrawing = () => {
    const id = addNew();
    return { persistId: id, undo: allUndos[id], shapes: persisted[id] };
}

export const saveDrawing = state => {
    persisted[state.persistId] = state.shapes;
    allUndos[state.persistId] = state.undo;
    save();
}

export const deleteDrawing = id => {
    let nextId = getNextId(id, false);
    if (nextId === id) {
        nextId = addNew();
    }
    delete persisted[id];
    delete allUndos[id];
    save();
    return { persistId: nextId, undo: allUndos[nextId], shapes: persisted[nextId] };
}


