import { actions, modes } from './consts.js'; 

export const res = {
    kbdMap : {
        [actions.MODE_PUSH_SHAPE_SELECTED] : 'select shape',
        [actions.MODE_PUSH_RENAME_DRAWING] : 'rename drawing',
        [actions.MODE_PUSH_SHOW_ENTIRE_SVG] : 'show SVG markup',
        [actions.MODE_PUSH_CONFIG_IMAGE_OVERLAY] : 'configure image overlay',
        [actions.MODE_PUSH_SET_IMAGE_URL] : 'set overlay image url',
        [actions.MODE_POP] : 'go back to previous mode',
        [actions.GRID_CYCLE_SIZE] : 'cycle grid size',
        [actions.GRID_CYCLE_SIZE_RV] : 'cycle grid size (reverse)',
        [actions.ZOOM_IN] : 'zoom in',
        [actions.ZOOM_OUT] : 'zoom out',
        [actions.ZOOM_MOVE_LEFT] : 'move zoom window left',
        [actions.ZOOM_MOVE_RIGHT] : 'move zoom window right',
        [actions.ZOOM_MOVE_UP] : 'move zoom window up',
        [actions.ZOOM_MOVE_DOWN] : 'move zoom window down',
        [actions.DRAWING_NEW] : 'create a new drawing',
        [actions.DRAWING_DELETE] : 'delete current drawing', 
        [actions.DRAWING_DUPLICATE] : 'duplicate current drawing',
        [actions.DRAWING_CYCLE_SELECTION] : 'switch to next drawing',
        [actions.DRAWING_CYCLE_SELECTION_RV] : 'switch to previous drawing',
        [actions.DISPLAY_TOGGLE_INFO_PANE] : 'show/hide info pane',
        [actions.DISPLAY_TOGGLE_SELECTED_SHAPE_INFO] : 'show/hide selected shape info',
        [actions.DISPLAY_TOGGLE_KEYBOARD_MAPPING] : 'show/hide keyboard mapping', 
        [actions.SHAPES_CYCLE_SELECTION] : 'select next shape',
        [actions.SHAPES_CYCLE_SELECTION_RV] : 'select previous shape',
        [actions.SHAPES_ADD_PATH] : 'insert a new path',
        [actions.SHAPES_ADD_CIRCLE] : 'insert a new circle',
        [actions.SHAPES_ADD_ELLIPSE] : 'insert a new ellipse',
        [actions.SHAPES_DUPLICATE_SHAPE] : 'duplicate current shape',
        [actions.SHAPES_DELETE_SHAPE] : 'delete current shape',
        [actions.SHAPE_TOGGLE_FILL] : 'set/unset fill',
        [actions.SHAPE_MOVE_LEFT] : 'move selected shape to left',
        [actions.SHAPE_MOVE_RIGHT] : 'move selected shape to right',
        [actions.SHAPE_MOVE_UP] : 'move selected shape to up',
        [actions.SHAPE_MOVE_DOWN] : 'move selected shape to down',
        [actions.SHAPE_ENLARGE] : 'make selected shape bigger',
        [actions.SHAPE_SHRINK] : 'make selected shape smaller',
        [actions.PATH_CYCLE_SEGMENT_SELECTION] : 'select next path segment',
        [actions.PATH_CYCLE_SEGMENT_SELECTION_RV] : 'select previous path segment',
        [actions.PATH_ADD_LINE] : 'add a line segment to end',
        [actions.PATH_ADD_CUBIC_BEZIER] : 'add a cubic Bezier curve segment to end',
        [actions.PATH_ADD_QUADRATIC_BEZIER] : 'add a quadratic Bezier curve segment to end',
        [actions.PATH_INSERT_LINE] : 'insert a line segment',
        [actions.PATH_INSERT_QUADRATIC_BEZIER] : 'insert s quadratic Bezier curve segment',
        [actions.PATH_INSERT_CUBIC_BEZIER] : 'insert a cubic Bezier curve segment',
        [actions.PATH_DELETE_SEGMENT] : 'delete current path segment',
        [actions.PATH_TOGGLE_CLOSE] : 'close/un-close current path', 
        [actions.PATH_PROMOTE_BEZIER] : 'promote current segment curve type',
        [actions.PATH_DEMOTE_BEZIER] : 'demote current segment curve type',
        [actions.POINT_CYCLE_SELECTION] : 'select next segment point',
        [actions.POINT_CYCLE_SELECTION_RV] : 'select previous segment point',
        [actions.POINT_MOVE_LEFT] : 'move current segment point to left',
        [actions.POINT_MOVE_RIGHT] : 'move current segment point to right',
        [actions.POINT_MOVE_UP] : 'move current segment point to up',
        [actions.POINT_MOVE_DOWN] : 'move current segment point to down',
        [actions.ELLIPSE_ENLARGE_HZ] : 'make ellipse wider',
        [actions.ELLIPSE_SHRINK_HZ] : 'make ellipse narrower',
        [actions.ELLIPSE_ENLARGE_VT] : 'make ellipse taller',
        [actions.ELLIPSE_SHRINK_VT] : 'make ellipse shorter',
        [actions.IMAGE_OVERLAY_ENLARGE] : 'make overlay image larger',
        [actions.IMAGE_OVERLAY_SHRINK] : 'make overlay image smaller',
        [actions.IMAGE_OVERLAY_MOVE_LEFT] : 'move overlay image left',
        [actions.IMAGE_OVERLAY_MOVE_RIGHT] : 'move overlay image right',
        [actions.IMAGE_OVERLAY_MOVE_UP] : 'move overlay image up',
        [actions.IMAGE_OVERLAY_MOVE_DOWN] : 'move overlay image down',
        [actions.IMAGE_OVERLAY_LESS_OPAQUE] : 'make overlay image more transparent',
        [actions.IMAGE_OVERLAY_MORE_OPAQUE] : 'make overlay image more opaque',
    }
};
