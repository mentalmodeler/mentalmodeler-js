import React, { Component } from 'react';

import {ELEMENT_TYPE} from '../../utils/util';

import './Controls.css';

class TextAreaControl extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value
        };
    }

    componentDidMount() {
        this.autoExpand();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.state.value) {
            this.setState({
                value: nextProps.value
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.value !== prevState.value) {
            this.autoExpand();
        }
    }

    autoExpand() {
        const {maxHeight} = this.props;
        if (this.textarea) {
            this.textarea.style.height = '0';
            this.textarea.style.overflow = 'hidden';
            const scrollHeight = this.textarea.scrollHeight;
            this.textarea.style.height = `${scrollHeight}px`;
            if (maxHeight && scrollHeight > maxHeight) {
                this.textarea.style.overflow = 'auto';
            }
        }
    }

    onChange = (e) => {
        const value = e.target.value;
        if (value !== this.state.value) {
            this.setState({
                value
            });
        }
    }

    setRef = (ref) => {
        this.textarea = ref;
    }

    getStyle() {
        const style = {};
        ['maxHeight', 'minHeight'].forEach((key) => {
            if (typeof this.props[key] !== 'undefined') {
                style[key] = this.props[key];
            }
        });
        return style;
        
    }
    render() {
        return (
            <textarea
                style={this.getStyle()}
                className={`control__text-area ${this.props.className}`}
                ref={this.setRef}
                onChange={this.onChange}
                value={this.state.value}
            />
        );
    }
}

export default TextAreaControl;
