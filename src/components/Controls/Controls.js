import React, { Component } from 'react';
import {connect} from 'react-redux';

import SelectedControl from './SelectedControl'

import './Controls.css';

const mapStateToProps = (state) => {
    const {concepts} = state;
    const {collection, selectedConcept, selectedRelationship} = concepts;
    const selectedConceptData = collection.find((concept) => (
        concept.id === selectedConcept
    ));
    let selectedRelationshipData;
    if (selectedConceptData && selectedConceptData.relationships) {
        selectedRelationshipData = selectedConceptData.relationships.find((relationship) => (
            relationship.id === selectedRelationship
        ));
    }
    // console.log('Controls > mapStateToProps\nselectedConcept:', selectedConcept, ', selectedConceptData:', selectedConceptData);
    // console.log('selectedRelationship:', selectedRelationship, ', selectedRelationshipData:', selectedRelationshipData, '\n\n');
    // return {
    //     selectedConcept
    // };
    return state;
}

class Controls extends Component {
    render() {
        // console.log('this.props:', this.props);
        return (
            <div className="controls">
            </div>
        );
    }
}

export default connect(mapStateToProps)(Controls);
