import React from 'react';
import * as ReactRedux from 'react-redux';

//------------------------------------------------------------------------------
const Path = ({segments, isSelected}) => {
    const path = segments.map(seg => seg.join(' ')).join(' ');
    return <path className={isSelected ? 'selected' : null} d={path}/>;
};

//------------------------------------------------------------------------------
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

//----------------------------------------------------------------------------------------------------
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
export const SvgEditor = ({state}) => {
    return (
        <div>
            <div><SvgContainer/></div>
            <ActionButtons/>
        </div>
    );
}
