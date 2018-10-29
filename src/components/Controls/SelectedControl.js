import React, { Component } from 'react';

import {ELEMENT_TYPE} from '../../utils/util';

import './Controls.css';

class SelectedControl extends Component {
    getDisplayText() {
        const {selectedType, selectedData, associatedData} = this.props;
        if (selectedType === ELEMENT_TYPE.CONCEPT) {
            return (
                <div className="selected-control__text">
                    {this.getConceptName(selectedData)}
                </div>
            );
        }
        const {influencer, influencee} = associatedData;
        return (
            <div className="selected-control__text">
                <div className="selected-control__relationship-concept-text">{this.getConceptName(associatedData.influencer)}</div>
                <div className="selected-control__relationship-influence-text">{this.getRelationshipName(selectedData)}</div>
                <div className="selected-control__relationship-concept-text">{this.getConceptName(associatedData.influencee)}</div>
            </div>
        );
    }

    getConceptName(selectedData) {
        return selectedData && selectedData.name || '[Component]';
    }

    getRelationshipName(relationship) {
        const influence = parseFloat(relationship.influence);
        if (isNaN(influence) || influence === 0) {
            return 'To'
        }
        return influence > 0
            ? `INCREASES (${influence})`
            : `DECREASES (${influence})`
    }

    shouldComponentUpdate(nextProps) {
        const {selectedType, selectedData, associatedData} = this.props;
        return (selectedType !== nextProps.selectedType)
            || (selectedData.id !== nextProps.selectedData.id)
            || (!!selectedData.influencer
                && !!selectedData.influencee
                && !!nextProps.selectedData.influencer
                && !!nextProps.selectedData.influencee
                && (selectedData.influencer !== nextProps.selectedData.influencer
                    || selectedData.influencee !== nextProps.selectedData.influencee)
        );
    }

    render() {
        return (
            <div className="selected-control">
                <div className="selected-control__text">
                    {this.getDisplayText()}
                </div>
            </div>
        );
    }
}

export default SelectedControl;
