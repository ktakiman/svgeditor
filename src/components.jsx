import React from 'react';
import * as ReactRedux from 'react-redux';

import { modes } from './consts.js';
import * as St from './state.js';

const getPointRadius = isLarge => isLarge ? 5 : 3;
//------------------------------------------------------------------------------
const Path = ({shape, selected, mode}) => {
    let pts = [];
    const extraPts = [];
    const isSegSelMode = mode === modes.PATH_SEGMENT_SELECTED;
    if (selected && (mode === modes.PATH_SELECTED || isSegSelMode)) {
        pts = shape.segments.map((p, i) => {
            const x = p[1];
            const y = p[2];
            const segSelected = shape.selectedSegment === i;
            let largePt = segSelected;
            const className = ['point'];
            if (segSelected && isSegSelMode) {
                className.push('selected');
                if (p[0] === 'Q' || p[0] === 'C') {
                    largePt = shape.selectedPoint === 0;

                    let radius = getPointRadius(shape.selectedPoint === 1);
                    extraPts.push(<circle className={className.join(' ')} cx={p[3]} cy={p[4]} r={radius} key='ex1'/>);
                    
                    if (p[0] === 'C') {
                        radius = getPointRadius(shape.selectedPoint === 2);
                        extraPts.push(<circle className={className.join(' ')} cx={p[5]} cy={p[6]} r={radius} key='ex2'/>);
                    }
                }
            }
            return <circle className={className.join(' ')} cx={x} cy={y} r={getPointRadius(largePt)} key={i}/>;
        });
    }
    const path = St.svg(shape);
    const classNames = [];
    if (selected) { classNames.push('selected'); }
    if (shape.closed) { classNames.push('closed'); }
    if (shape.fill) { classNames.push('fill'); }
    return (
        <g>
            <path className={classNames.join(' ')} d={path}/>
            {pts}
            {extraPts}
        </g>);
};

//------------------------------------------------------------------------------
const Shapes = ({shapes, selected, mode}) => {
    const ps = shapes.data.map((sh, i) => {
        switch (sh.type)
        {
            case 'path': return (
                <Path 
                    shape={sh} 
                    selected={i === shapes.selected} 
                    mode={mode} 
                    key={i}/>);
            default: return null;
        }
    });
    return <g>{ps}</g>;
};

//------------------------------------------------------------------------------
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
let SvgContainer = ({containerSize, shapes, gridSize, mode}) => {
    const width = containerSize[0];
    const height = containerSize[1];
    const gridLines = gridSize > 0 ? <Grid width={width} height={height} size={gridSize}/> : null;
    return (
        <svg width={width} height={height}>
            {gridLines}
            <Shapes shapes={shapes} selected={shapes.selected} mode={mode}/>
        </svg>
    );
};

//----------------------------------------------------------------------------------------------------
SvgContainer = ReactRedux.connect(
    state => ({
        containerSize: state.containerSize,
        shapes: state.shapes,
        gridSize: St.gridSize(state),
        mode: state.modes[state.modes.length - 1]
    }),
    null
)(SvgContainer);



//----------------------------------------------------------------------------------------------------
const displayContents = {
    segmentDetails : {
        [modes.PATH_SELECT_SEGMENT] : '',
        [modes.PATH_EDIT_POINT] : '',
        [modes.PATH_ADD_SEGMENT] : '',
    }
};

const addKeyMapDOM = (map, array, keyPrefix) => {
    array.push.apply(array, Object.keys(map).map((k, i) => (
        //<p key={keyPrefix+i}><span className='key'>{'\'' + k + '\''}</span> - {map[k]}</p>
        <tr key={keyPrefix+i}><td key='c1' className='col-one'>{'\'' + k + '\''}</td><td key='c2'>{map[k]}</td></tr>
    )));
};

let Display = ({filename, persistId, mode, selectedShape, keyMapping}) => {
    const seg = [];
    if (selectedShape) {
        seg.push(<div key='type'>{'TYPE: ' + selectedShape.type}</div>);

        const pts = selectedShape.segments.map((p, i) => {
            const cn = 'point' + (i === selectedShape.selectedSegment ? ' selected' : '');
            return <span className={cn} key={i}>{p.join(' ')}</span>;
        });
        
        if (selectedShape.type === 'path' && selectedShape.closed) {
            pts.push(<span className='point' key={selectedShape.segments.length}>Z</span>);
        }

        seg.push(<div key='segments'>{pts}</div>);
    }
    const keyMap = [];
    addKeyMapDOM(keyMapping['universal'], keyMap, 'd');
    addKeyMapDOM(keyMapping[mode], keyMap, 'm');
    
    return (
        <div className='display'>
            <h3 className='filename'>{filename + " (" + persistId + ")"}</h3>
            <h3>{mode}</h3>
            {seg}
            <h3>Keyboard Mapping</h3>
            <table className='keyboard-mapping'><tbody>
                {keyMap}
            </tbody></table>
        </div>
    );
};

Display = ReactRedux.connect(
    state => ({ filename: state.filename, persistId: state.persistId, mode: St.curMode(state), selectedShape: St.curShape(state), keyMapping: state.keyMapping}),
    dispatch => ({
    })
)(Display);

//----------------------------------------------------------------------------------------------------
export const SvgEditor = ({state}) => {
    return (
        <div>
            <div className='svg-container'><SvgContainer/></div>
            <Display/>
        </div>
    );
};
