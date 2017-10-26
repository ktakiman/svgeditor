const persistKey = 'svg-editor-data';

// localStorage version -------------------------------------------
 
let persisted;

const json = localStorage[persistKey];
if (json) {
    persisted = JSON.parse(json);
}

persisted = persisted || {};

export const listDrawings = () => Object.keys(persisted).map(id => ({ persistId: id, name: persisted[id].name }));
export const loadDrawing = id => persisted[id];
export const saveDrawing = state => {
    persisted[state.persistId] = state.shapes;
    localStorage[persistKey] = JSON.stringify(persisted);
}


