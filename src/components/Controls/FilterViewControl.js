import React, { Component } from 'react';
import {ELEMENT_TYPE} from '../../utils/util';

import './Controls.css';

class FilterViewControl extends Component {
    constructor(props) {
        super(props);

        const {viewFilter} = this.props;
        this.state = {
            selectedIndex: typeof viewFilter !== 'undefined' && viewFilter !== null
                ? this.props.viewFilter
                : -1
        };
        this.filters = [
            'Only lines from',
            'Only lines to'
        ];
    }

    onFilterChange(selectedIndex) {
        this.props.onFilterChange(selectedIndex)
    }

    onRadioChange = (e) => {
        if (e.target && e.target.dataset) {
            const selectedIndex = parseInt(e.target.dataset.index, 10);
            this.setState({
                selectedIndex
            }, () => {
                this.onFilterChange(selectedIndex);
            });
        }
    }
    
    resetFilterView = () => {
        if (this.state.selectedIndex > -1) {
            this.setState({
                selectedIndex: -1
            }, () => {
                this.onFilterChange(-1);
            });
        }
    }

    render() {
        return (
            <div className="filter-view-control control-panel__body-content">
                <ul>
                    {this.props.selectedType === ELEMENT_TYPE.CONCEPT && this.filters.map((title, index) => {
                        return (
                            <li
                                key={`filter-view-${index}`}
                                className={`filter-view__item filter-view__item--${index}`}
                            >
                                <input
                                    type="radio"
                                    name="filterView"
                                    id={`filter-view-radio_${index}`}
                                    checked={this.state.selectedIndex === index}
                                    data-index={index}
                                    onChange={this.onRadioChange}
                                />
                                <label htmlFor={`filter-view-radio_${index}`}>
                                    {title}
                                </label>
                            </li>
                        );
                    })}
                </ul>
                <button
                    className="filter-view-control__reset"
                    onClick={this.resetFilterView}
                >
                    {'Reset'}
                </button>
            </div>
        );
    }
}

export default FilterViewControl;
