import React from 'react';
import * as ReactRedux from 'react-redux';

import { modes } from './consts.js';

//------------------------------------------------------------------------------
const Path = ({segments, isSelected, mode}) => {
    let pts = [];
    if (isSelected && mode === modes.PATH_SELECT_SEGMENT) {
        pts = segments.filter(p => p[0] !== 'Z').map((p, i) => {
            let x, y;
            switch (p[0])
            {
                case 'M':
                case 'L':
                    x = p[1];
                    y = p[2];
                    break;
                case 'Q':
                    x = p[3];
                    y = p[4];
                    break;
                case 'C':
                    x = p[5];
                    y = p[6];
                    break; 
                default:
                    x = 0;
                    y = 0;
                    break;
            }
            return <circle className='point' cx={x} cy={y} r='3' key={i}/>;
        });
    }
    const path = segments.map(seg => seg.join(' ')).join(' ');
    return (
        <g>
            <path className={isSelected ? 'selected' : null} d={path}/>;
            {pts}
        </g>);
};

//------------------------------------------------------------------------------
const Shapes = ({shapes, selected, mode}) => {
    const ps = shapes.data.map((sh, i) => {
        switch (sh.type)
        {
            case 'path': return <Path segments={sh.segments} isSelected={i == selected} mode={mode} key={i}/>;
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
let SvgContainer = ({containerSize, shapes, grid, mode}) => {
    const width = containerSize[0];
    const height = containerSize[1];
    const gridSize = grid.sizePresets[grid.sizeIndex];
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
        grid: state.grid,
        mode: state.modes[state.modes.length - 1]
    }),
    null
)(SvgContainer);


//----------------------------------------------------------------------------------------------------
let Display = ({mode}) => {
    return (
        <div className='button-group'>
            <h3>{mode}</h3>
        </div>
    );
};

Display = ReactRedux.connect(
    state => ({ mode: state.modes[state.modes.length - 1]}),
    dispatch => ({
        onAddPath: () => dispatch({type: actions.PATHS_ADD})
    })
)(Display);

//----------------------------------------------------------------------------------------------------
export const SvgEditor = ({state}) => {
    return (
        <div>
            <div><SvgContainer/></div>
            <Display/>
        </div>
    );
}
