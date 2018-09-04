import React, { Component } from 'react';
import { connect } from 'react-redux';

import { dragConcept } from '../../actions/index';
import './Concept.css';

class Concept extends Component {
    constructor(props) {
        super(props);

        this.x = 0;
        this.y = 0;
    }

    onMouseDown = (e) => {
        console.log('down');
        this.toggleDragHandlers(true);
    }

    toggleDragHandlers(on) {
        const func = on ? 'addEventListener' : 'removeEventListener';
        window[func]('mousemove', this.onMouseMove);
        window[func]('mouseup', this.onMouseUp);
    }

    onMouseMove = (e) => {
        console.log('\tmove, x:', e.clientX, ', y:', e.clientY, '\noffsetX:', e.offsetX, ', offsetY:', e.offsetY);
    }

    onMouseUp = (e) => {
        console.log('up, e:', e);
        this.toggleDragHandlers(false);
    }

    render() {
        const {name, x, y} = this.props
        const rootStyle = {
            left: `${x}px`,
            top: `${y}px`
        }
        return (
            <div
                className="Concept"
                style={rootStyle}
                onMouseDown={this.onMouseDown}
            >
                <textarea className="Concept__textarea" value={name}/>
            </div>
        );
    }
}

export default connect()(Concept);