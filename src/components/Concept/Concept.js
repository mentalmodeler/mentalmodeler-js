import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    conceptMove,
    conceptFocus
} from '../../actions/index';
import './Concept.css';

class Concept extends Component {
    constructor(props) {
        super(props);
    }

    toggleDragHandlers(on, e) {
        const { x, y } = this.props;
        const func = on ? 'addEventListener' : 'removeEventListener';
        window[func]('mousemove', this.onMouseMove);
        window[func]('mouseup', this.onMouseUp);
        this.setDragStarts(e, x, y);
    }

    setDragStarts(e, x, y) {
        this.startScreenX = e.screenX;
        this.startScreenY = e.screenY;
        this.startX = parseInt(x);
        this.startY = parseInt(y);
    }

    onMouseDown = (e) => {
        const { id, conceptFocus } = this.props;
        conceptFocus(id);
        this.toggleDragHandlers(true, e);
    }

    onMouseMove = (e) => {
        const {id, conceptMove } = this.props;
        const deltaX = e.screenX - this.startScreenX;
        const deltaY = e.screenY - this.startScreenY;
        const newX = deltaX + this.startX;
        const newY = deltaY + this.startY;
        conceptMove(id, Math.max(0, newX), Math.max(0, newY));
    }

    onMouseUp = (e) => {
        this.toggleDragHandlers(false, e);
    }

    render() {
        const {id, name, x, y, focused} = this.props
        const rootStyle = {
            left: `${x}px`,
            top: `${y}px`
        }

        const rootClass = `Concept${focused ? ' Concept--focused' : ''}`
        return (
            <div
                className={rootClass}
                style={rootStyle}
                onMouseDown={this.onMouseDown}
            >
                <textarea className="Concept__textarea" value={name}/>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        conceptMove: (id, x, y) => {
            dispatch(conceptMove(id, x, y))
        },

        conceptFocus: (id) => {
            dispatch(conceptFocus(id))
        }
    };
}

export default connect(null, mapDispatchToProps)(Concept);