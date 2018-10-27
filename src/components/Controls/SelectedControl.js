import React, { Component } from 'react';

import {ELEMENT_TYPE} from '../../utils/util';

import './Controls.css';

class SelectedControl extends Component {
    getDisplayText() {
        const {selectedType, selectedData} = this.props;
        if (selectedType === ELEMENT_TYPE.CONCEPT) {
            return selectedData && selectedData.name || '[Component]';
        }
        return '[Relationship]'
    }

    render() {
        console.log('SelectedControl > render\nthis.props:', this.props, '\n\n');
        return (
            <div className="selected-control">
                <span className="selected-control__text">
                    {this.getDisplayText()}
                </span>
            </div>
        );
    }
}

export default SelectedControl;
