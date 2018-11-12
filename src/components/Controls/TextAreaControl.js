import React, { Component } from 'react';

import './Controls.css';

class TextAreaControl extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value,
            isDirty: false
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
                value,
                isDirty: true
            });
            if (this.props.onChange) {
                this.props.onChange(value);
            }
        }
    }

    setRef = (ref) => {
        this.textarea = ref;
    }

    onBlur = (e) => {
        const {value, isDirty} = this.state;
        if (this.props.onBlur) {
            this.props.onBlur({
                event: e,
                value,
                isDirty
            });

            if (isDirty) {
                this.setState({
                    isDirty: false
                })
            }
        }
    }

    onFocus = (e) => {
        if (this.props.onFocus) {
            this.props.onFocus(e);
        }
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
                onBlur={this.onBlur}
                onFocus={this.onFocus}
                placeholder={this.props.placeholder || ''}
            />
        );
    }
}

export default TextAreaControl;
