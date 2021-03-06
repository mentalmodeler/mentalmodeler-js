import React, { Component } from 'react';
import { connect } from 'react-redux';
import Concept from '../Concept/Concept';
import util from '../../utils/util';


class Concepts extends Component {
    render() {
        const {concepts} = this.props;
        const {collection, selectedConcept, selectedRelationship, tempRelationship, tempTarget, viewFilter} = concepts;
        const hasTempRelationship = !!tempRelationship;
        let sConcept = {};
        let selectedRelationships = [];
        if (selectedConcept !== null || selectedRelationship!== null) {
            sConcept = util.findConcept(collection, selectedConcept);
            selectedRelationships = sConcept && sConcept.relationships
                ? sConcept.relationships
                : [];
        } 
        return (
            <div className="map__concepts">
            {collection.map((concept, index) => {
                const isExcludedByFilter = util.isConceptExcludedByFilter({
                    viewFilter,
                    selectedConcept,
                    selectedRelationships,
                    concept,
                    collection
                });
               return (
                    <Concept
                        key={`concept_${concept.id}`}
                        {...concept}
                        hasTempRelationship={hasTempRelationship}
                        isTempRelationship={hasTempRelationship && concept.id === tempRelationship.id}
                        tempTarget={tempTarget}
                        selected={concept.id === selectedConcept && selectedRelationship === null}
                        selectedRelationship={!!selectedRelationship && (concept.id === selectedConcept || concept.id === selectedRelationship)}
                        isExcludedByFilter={isExcludedByFilter}
                    />
                );
            })}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        concepts: state.concepts
    };
}

export default connect(mapStateToProps)(Concepts);