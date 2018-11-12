import React, { Component } from 'react';
import classnames from 'classnames';
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
                <div className="selected-control__relationship-concept-text">{this.getConceptName(influencer)}</div>
                <div className="selected-control__relationship-influence-text">{this.getRelationshipName(selectedData)}</div>
                <div className="selected-control__relationship-concept-text">{this.getConceptName(influencee)}</div>
            </div>
        );
    }

    getConceptName(selectedData) {
        return selectedData && selectedData.name ? selectedData.name : '[Component]';
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
            || (associatedData.influencer.id !== nextProps.associatedData.influencer.id)
            || (associatedData.influencee.id !== nextProps.associatedData.influencee.id);

    }

    render() {
        const {selectedData} = this.props;
        let groupClass = `selected-control--group-${selectedData && selectedData.group ? selectedData.group : 0}`
        // if (selectedType === ELEMENT_TYPE.RELATIONSHIP && selectedData && selectedData.influence !== 0) {
        //     groupClass = `selected-control--group-influence-${selectedData.influence > 0 ? 'positive' : 'negative'}`
        // } 
        const rootClass = classnames('selected-control', groupClass);
        
        return (
            <div className={rootClass}>
                <div className="selected-control__text">
                    {this.getDisplayText()}
                </div>
            </div>
        );
    }
}

export default SelectedControl;
