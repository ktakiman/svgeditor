import React from 'react';
import * as ReactRedux from 'react-redux';

import { modes } from './consts.js';
import * as St from './state.js';

//------------------------------------------------------------------------------
const Path = ({segments, isSelected, selectedSegment, mode}) => {
    let pts = [];
    if (isSelected && (mode === modes.PATH_SELECT_SEGMENT || mode === modes.PATH_EDIT_POINT)) {
        pts = segments.map((p, i) => {
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
            const segmentSelected = selectedSegment === i;
            const radius = segmentSelected ? 5 : 3;
            const className = 'point' + (segmentSelected && mode === modes.PATH_EDIT_POINT ? ' selected' : '');
            return <circle className={className} cx={x} cy={y} r={radius} key={i}/>;
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
            case 'path': return (
                <Path 
                    segments={sh.segments} 
                    isSelected={i == selected} 
                    selectedSegment={sh.selectedSegment} 
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

let Display = ({mode, selectedShape}) => {
    let seg = [];
    if (selectedShape) {
        seg.push(<div key='type'>{selectedShape.type}</div>);

        const pts = selectedShape.segments.map((p, i) => {
            const cn = 'point' + (i === selectedShape.selectedSegment ? ' selected' : '');
            return <span className={cn} key={i}>{p.join(' ')}</span>;
        });
        seg.push(<div key='segments'>{pts}</div>);
    }
    return (
        <div className='display'>
            <h3>{mode}</h3>
            {seg}
        </div>
    );
};

Display = ReactRedux.connect(
    state => ({ mode: St.curMode(state), selectedShape: St.curShape(state)}),
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
