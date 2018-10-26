import React, { Component } from 'react';
import { connect } from 'react-redux';
import debounce from 'lodash.debounce';
// import PropTypes from 'prop-types';

import {
    conceptMove,
    conceptFocus,
    conceptChange
} from '../../actions/index';
import './Concept.css';


const TEXTAREA_STYLES = {
    fontSize: 14,
    lineHeight: 18,
    padding: 6
};

class Concept extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.name || ''
        }

        this.height = 0;
    }

    componentDidMount() {
        if (this.textarea) {
            // initialize autoExpand;
            this.textarea.style.overflow = 'hidden';
            this.autoExpand();
        }
    }

    debouncedConceptChange = debounce(() => {
        if (this.root) {
            const {id, conceptChange} = this.props;
            const {value} = this.state;
            const {width, height} = this.root.getBoundingClientRect();
            conceptChange(id, value, Math.round(width), Math.round(height));
        }
    }, 300)

    componentDidUpdate(prevProps, prevState) {
        const valueChanged = this.state.value !== prevState.value;
        if (valueChanged) {
            this.autoExpand();
        }
    }

    toggleDragHandlers(on, e) {
        const func = on ? 'addEventListener' : 'removeEventListener';
        window[func]('mousemove', this.onMouseMove);
        window[func]('mouseup', this.onMouseUp);
    }

    autoExpand() {
        // Set the height to 0, so we can get the correct content height via scrollHeight
        // Also, running this through state changes causes a race condition when decreasing scrollHeight.
        this.textarea.style.overflow = 'hidden';
        this.textarea.style.height = '0px';
        
        // set height to scrollHeight, but add border-width * 2 since that is not reported in scrollHeight
        // but is used in box-sizing: border-box to determine height of textarea element
        const newHeight = this.textarea.scrollHeight;
        // console.log('newHeight:', newHeight);
        // const paddingAdj = TEXTAREA_STYLES.padding * 2;
        // console.log('newHeight:', newHeight);
        this.height = newHeight; // - paddingAdj;
        this.textarea.style.height = `${this.height}px`;

        this.debouncedConceptChange();
    }

    // getComputedStyleValues(defaults) {
    //     if (this.textArea && typeof window !== 'undefined') {
    //         const computedStyle = window.getComputedStyle(this.textArea);
    //         return {
    //             borderWidth: this.getStyleValue('border-width', computedStyle, defaults.borderWidth),
    //             lineHeight: this.getStyleValue('line-height', computedStyle, defaults.lineHeight),
    //             maxHeight: this.getStyleValue('max-height', computedStyle, NaN),
    //             paddingBottom: this.getStyleValue('padding-bottom', computedStyle, defaults.paddingBottom),
    //             paddingTop: this.getStyleValue('padding-top', computedStyle, defaults.paddingTop)
    //         };
    //     }
    //     return defaults;
    // }

    onChange = (e) => {
        const { value } = this.state;
        const newValue = e.target.value;
        if (newValue !== value) {
            this.setState({
                value: newValue
            });
        }
    }

    getSelectedConceptData() {
        const data = {};
        ['id', 'name', 'notes', 'units', 'preferredState', 'group', 'relationships', 'x', 'y', 'width', 'height'].forEach((key) => {
            data[key] = this.props[key];
        });
        return data;
    }

    onMouseDown = (e) => {
        const { id, selected, conceptFocus, x, y } = this.props;
        
        // store positions
        this.screenXBeforeDrag = e.screenX;
        this.screenYBeforeDrag = e.screenY;
        this.xBeforeDrag = parseInt(x, 10);
        this.yBeforeDrag = parseInt(y, 10);
        
        if (!selected) {
            conceptFocus(id);
        }
        
        this.toggleDragHandlers(true, e);
    }

    onMouseMove = (e) => {
        const { id, conceptMove, x, y } = this.props; // eslint-disable-line
        const deltaX = e.screenX - this.screenXBeforeDrag;
        const deltaY = e.screenY - this.screenYBeforeDrag;
        const newX = Math.max(deltaX + this.xBeforeDrag, 0);
        const newY = Math.max(deltaY + this.yBeforeDrag, 0);
        // const newX = Math.max(0, e.movementX + x);
        // const newY = Math.max(0, e.movementY + y);
        conceptMove(id, newX, newY);
    }

    onMouseUp = (e) => {
        this.toggleDragHandlers(false, e);
    }

    onFocus = (e) => {
        const {id, selected, conceptFocus} = this.props;
        if (!selected) {
            conceptFocus(id);
        }
    }

    onBlur = (e) => {}

    setRef = (ref) => {
        this.root = ref;
    }

    setTextareaRef = (ref) => {
        this.textarea = ref;
    }

    render() {
        const { id, name, selected, x, y} = this.props // eslint-disable-line
        const { value } = this.state
        const rootStyle = {
            left: `${x}px`,
            top: `${y}px`
        }

        const rootClass = `Concept${selected ? ' Concept--focused' : ''}`
        return (
            <div
                className={rootClass}
                style={rootStyle}
                ref={this.setRef}
                onMouseDown={this.onMouseDown}
            >
                <textarea
                    className="Concept__textarea"
                    value={value}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onChange={this.onChange}
                    ref={this.setTextareaRef}
                />
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
        },

        conceptChange: (id, text, width, height) => {
            dispatch(conceptChange(id, text, width, height))
        }
    };
}

export default connect(null, mapDispatchToProps)(Concept);