import React, { Component } from 'react';

import {ELEMENT_TYPE} from '../../utils/util';

import './Controls.css';

const groups = ['', '', '', '', '', ''];

class GroupControl extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...this.getGroupNames()
        };
    }

    // componentWillReceiveProps(nextProps) {
    //     if (nextProps.value !== this.state.value) {
    //         this.setState({
    //             value: nextProps.value
    //         });
    //     }
    // }

    getGroupNames() {
        const {groupNames} = this.props;
        const names = {};
        groups.forEach((a, index) => {
            names[`value-${index}`] = groupNames[index] || '';
            names[`isDirty-${index}`] = false;
        });
        return names;
    }

    onRadioChange = (e) => {
        const {onSelectionChange} = this.props;
        const index = e.target.dataset.index;
        if (onSelectionChange) {
            onSelectionChange({
                event: e,
                groupIndex: index
            });
        }
    }

    onTextChange = (e) => {
        const index = e.target.dataset.index;
        const value = e.target.value;
        console.log('onTextChange, index:',index, ', value:', value);
        if (this.state[`value-${index}`] !== value) {
            this.setState({
                [`value-${index}`]: value,
                [`isDirty-${index}`]: true
            });
        }
    }

    onTextFocus = (e) => {}
    onTextBlur = (e) => {
        const {onNameChange} = this.props;
        const index = e.target.dataset.index;
        if (this.state[`isDirty-${index}`]) {
            onNameChange({
                event: e,
                groupIndex: index,
                value: [`value-${index}`]
            });

            this.setState({
                [`isDirty-${index}`]: false
            });
        }
    }

    render() {
        const {selectedData, groupNames} = this.props;
        const {value} = this.state;
        const group = parseInt(selectedData.group, 10);
        return (
            <ul className="group-control control-panel__body-content">
                {groups.map((a, index) => {
                    const name = groupNames[index];
                    return (
                        <li
                            key={`group-control-${index}`}
                            className={`group-control__item group-control__item--${index}`}
                        >
                            <input
                                type="radio"
                                name="groupName"
                                checked={index === group}
                                data-index={index}
                                onChange={this.onRadioChange}
                            />
                            <input
                                type="text"
                                value={this.state[`value-${index}`]}
                                className={`group-control__text group-control__text--${index}`}
                                data-index={index}
                                onChange={this.onTextChange}
                                onFocus={this.onTextFocus}
                                onBlur={this.onTextBlur}
                                placeholder="Enter group name"
                            />
                        </li>
                    );
                })}
            </ul>
        );
    }
}

export default GroupControl;
