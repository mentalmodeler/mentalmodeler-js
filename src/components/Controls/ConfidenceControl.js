import React, { Component } from 'react';

import {CONFIDENCE__VALUES} from '../../utils/util';

import './Controls.css';

class ConfidenceControl extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value,
            isDirty: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.state.value) {
            this.setState({
                value: nextProps.value
            });
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
                this.props.onChange({
                    event: e,
                    value,
                    isDirty: true
                });
            }
        }
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

    render() {
        const max = CONFIDENCE__VALUES[0];
        const min = CONFIDENCE__VALUES[CONFIDENCE__VALUES.length - 1];
        const step = CONFIDENCE__VALUES[0] - CONFIDENCE__VALUES[1];

        return (
            <div className="confidence-control control-panel__body-content">
                <label className="confidence-control__label">
                    <span>{'Not'}</span>
                    <span>{'Very'}</span>
                </label>
                <div className="confidence-control__input-wrapper">
                    <div className="confidence-control__input-notches">
                        {CONFIDENCE__VALUES.map((value, index) => (
                            <div
                                key={`notch-${index}`}
                                className="confidence-control__input-notch"
                            />
                        ))}
                    </div>
                    <input
                        className="confidence-control__input"
                        type="range"
                        name="confidence"
                        min={min}
                        max={max}
                        step={step}
                        value={this.state.value}
                        onChange={this.onChange}
                        onBlur={this.onBlur}
                    />
                </div>
            </div>
        );
    }
}

export default ConfidenceControl;
