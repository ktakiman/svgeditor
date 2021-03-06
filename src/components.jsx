import React from 'react';
import * as ReactRedux from 'react-redux';

import { modes, actions } from './consts.js';
import { res } from './res.js';
import * as St from './state.js';

const getPointRadius = (isLarge, scale) => (isLarge ? 5 : 3) / scale;

const createClassNamesForShape = (isSelected, isFilled) => {
    var classNames = ['shape'];
    if (isSelected) { classNames.push('selected'); }
    if (isFilled) { classNames.push('fill'); }
    return classNames;
}

//------------------------------------------------------------------------------
const Path = ({shape, selected, mode, scale}) => {
    let pts = [];
    const extraPts = [];
    const isPathSelectedMode = mode === modes.PATH_SELECTED;
    if (selected && isPathSelectedMode) {
        pts = shape.segments.map((p, i) => {
            const x = p[1];
            const y = p[2];
            const segSelected = shape.selectedSegment === i;
            let largePt = segSelected;
            const className = ['point'];
            if (segSelected) {
                className.push('selected');
                if (p[0] === 'Q' || p[0] === 'C') {
                    largePt = shape.selectedPoint === 0;

                    let radius = getPointRadius(shape.selectedPoint === 1, scale);
                    extraPts.push(<circle className={className.join(' ')} cx={p[3]} cy={p[4]} r={radius} key='ex1'/>);
                    
                    if (p[0] === 'C') {
                        radius = getPointRadius(shape.selectedPoint === 2, scale);
                        extraPts.push(<circle className={className.join(' ')} cx={p[5]} cy={p[6]} r={radius} key='ex2'/>);
                    }
                }
            }
            return <circle className={className.join(' ')} cx={x} cy={y} r={getPointRadius(largePt, scale)} key={i}/>;
        });
    }
    const path = St.pathSvgData(shape);
    const classNames = createClassNamesForShape(selected, shape.fill);
    if (shape.closed) { classNames.push('closed'); }
    return (
        <g>
            <path className={classNames.join(' ')} d={path}/>
            {pts}
            {extraPts}
        </g>);
};
//------------------------------------------------------------------------------
const Circle = ({shape, selected}) => {
    const classNames = createClassNamesForShape(selected, shape.fill);
    return <circle cx={shape.center[0]} cy={shape.center[1]} r={shape.radius} className={classNames.join(' ')}/>;
}
//------------------------------------------------------------------------------
const Ellipse = ({shape, selected, mode, scale}) => {
    const classNames = createClassNamesForShape(selected, shape.fill);
    const pts = [];
    if (selected && mode === modes.ELLIPSE_SELECTED) {
        const ptRadius = getPointRadius(false, scale);
        pts.push(<circle className='point selected' cx={shape.center[0]} cy={shape.center[1] + shape.ry} r={ptRadius} key='1'/>);
        pts.push(<circle className='point selected' cx={shape.center[0] + shape.rx} cy={shape.center[1]} r={ptRadius} key='3'/>);
    }
    return (
        <g>
            <ellipse cx={shape.center[0]} cy={shape.center[1]} rx={shape.rx} ry={shape.ry} className={classNames.join(' ')}/>
            {pts}
        </g>);
} 
//------------------------------------------------------------------------------
const Shapes = ({shapes, selected, mode, scale}) => {
    const ps = shapes.data.map((sh, i) => {
        const isSelected = i === shapes.selected;
        switch (sh.type)
        {
            case 'path': return (
                <Path 
                    shape={sh} 
                    selected={isSelected} 
                    mode={mode} 
                    scale={scale}
                    key={i}/>);
            case 'circle': return (
                <Circle
                    shape={sh}
                    selected={isSelected}
                    key={i}/>);
            case 'ellipse': return (
                <Ellipse
                    shape={sh}
                    selected={isSelected}
                    mode={mode} 
                    scale={scale}
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

const Overlay = ({overlay}) => {
    if (overlay.url) {
        return <image href={overlay.url} x={overlay.left} y={overlay.top} width={overlay.width} height={overlay.height} style={{opacity: overlay.opacity}}/>;
    }

    return null;
}

//----------------------------------------------------------------------------------------------------
let SvgContainer = ({containerSize, shapes, gridSize, mode, zoom}) => {
    const width = containerSize[0];
    const height = containerSize[1];
    const gridLines = gridSize > 0 ? <Grid width={width} height={height} size={gridSize}/> : null;
    const transform = 'scale(' + zoom.scale + '), translate(' + zoom.translate[0] + ',' + zoom.translate[1] + ')';
    return (
        <svg width={width} height={height}>
            <g transform={transform}>
                <Overlay overlay={shapes.imageOverlay}/>
                {gridLines}
                <Shapes shapes={shapes} selected={shapes.selected} mode={mode} scale={zoom.scale}/>
            </g>
        </svg>
    );
};

//----------------------------------------------------------------------------------------------------
SvgContainer = ReactRedux.connect(
    state => ({
        containerSize: state.containerSize,
        shapes: state.shapes,
        gridSize: St.gridSize(state),
        mode: state.modes[state.modes.length - 1],
        zoom: state.zoom,
    }),
    null
)(SvgContainer);



//----------------------------------------------------------------------------------------------------
const addKeyMapDOM = (map, array, keyPrefix) => {
    if (map) {
        array.push.apply(array, Object.keys(map).map((k, i) => {
            const txt = res.kbdMap[map[k]] || map[k];
            return <tr key={keyPrefix+i}><td key='c1' className='col-one'>{'\'' + k + '\''}</td><td key='c2'>{txt}</td></tr>;
        }));
    } else {
        console.log(`ERROR: no mapping for ${keyPrefix}`);
    }
};

const shapeInfoMarkup = shape => {
    let seg = [];

    switch (shape.type) {
        case 'path':
            seg = shape.segments.map((p, i) => {
                const cn = 'point' + (i === shape.selectedSegment ? ' selected' : '');
                return <span className={cn} key={i}>{p.join(' ')}</span>;
            });
            
            if (shape.closed) {
                seg.push(<span className='point' key={shape.segments.length}>Z</span>);
            }

            break;
        case 'circle':
            seg.push(<span key='0'>{`[${shape.center[0]}, ${shape.center[1]}], r: ${shape.radius}`}</span>);
            break;
        case 'ellipse':
            seg.push(<span key='1'>{`[${shape.center[0]}, ${shape.center[1]}], rx: ${shape.rx}, ry: ${shape.ry}`}</span>);
            break;
    }

    return (
        <div>
            <h3>{'Selected: ' + shape.type}</h3>
            <div className='margin-top'>
                {seg}
            </div>
        </div>);
};

const keyboardMappingMarkup = (keyMapping, mode) => {
    const keyMap = [];
    addKeyMapDOM(keyMapping['universal'], keyMap, 'd');
    addKeyMapDOM(keyMapping[mode], keyMap, 'm');
    return (
        <div>
            <h3>Keyboard Mapping</h3>
            <table className='keyboard-mapping'><tbody>
                {keyMap}
            </tbody></table>
        </div>); 
};

let Display = ({name, persistId, mode, undo, shape, keyMapping, display, containerSize}) => {
    if (!display.infoPaneVisible) { return null; }
    
    const shapeInfo = (display.selectedShapeVisible && shape) ? shapeInfoMarkup(shape) : null;
    const keymap = display.keyboardMappingVisible ? keyboardMappingMarkup(keyMapping, mode) : null;

    const undoCt = undo.pos;
    const redoCt = undo.stack.length - undo.pos - 1;
    const style = { height: containerSize[1]};
    return (
        <div className='display' style={style}>
            <h3 className='filename'>{name + " (" + persistId + ")"}</h3>
            <h3>{`mode: ${mode}, undo/redo: [${undoCt}/${redoCt}]`}</h3>
            {shapeInfo}
            {keymap}
        </div>
    );
};

Display = ReactRedux.connect(
    state => ({ 
        name: state.shapes.name, 
        persistId: state.persistId, 
        mode: St.curMode(state), 
        undo: state.undo,
        shape: St.curShape(state), 
        keyMapping: state.keyMapping, 
        display: state.display, 
        containerSize: state.containerSize }),
    dispatch => ({
    })
)(Display);


let Dialog = ({state, setName, setImgUrl}) => {
    let type, header, value, callback;
    switch (St.curMode(state)) {
        case modes.RENAME_DRAWING:
            type = 'input';
            header = 'Name:';
            value = state.shapes.name;
            callback = setName;
            break;
        case modes.SET_IMAGE_URL:
            type = 'input';
            header = 'URL:';
            value = state.shapes.imageOverlay.url;
            callback = setImgUrl;
            break;
        case modes.SHOW_ENTIRE_SVG:
            type = 'input';
            header = 'SVG';
            value = St.svgMarkup(state);
            callback = () => {};
            break;
        default:
            break;
    }

    if (header) {
        return (
            <div>
                <div className='dlg-overlay'></div>;
                <div className='dlg'>
                    <h3>{header}</h3>
                    <input className='editbox' value={value} onChange={callback}/>
                </div>
            </div>
        );
    }

    return null;
};

Dialog = ReactRedux.connect(
    state => ({ state }),
    dispatch => ({ 
        setName: evt => dispatch({ type: actions.DRAWING_SET_NAME, name: evt.target.value }),
        setImgUrl: evt => dispatch({ type: actions.IMAGE_OVERLAY_SET_URL, url: evt.target.value }),
    })
)(Dialog);

//----------------------------------------------------------------------------------------------------
export const SvgEditor = ({state}) => {
    return (
        <div>
            <div className='svg-container'>
                <SvgContainer/>
            </div>
            <Display/>
            <Dialog/>
        </div>
    );
};
