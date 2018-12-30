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
        
        // console.log('\n\nConcepts > render'
        //     , '\n\tselectedConcept:', selectedConcept
        //     , '\n\tsConcept:', sConcept
        //     , '\n\tselectedRelationships:', selectedRelationships
        //     , '\n\tselectedRelationships:', selectedRelationships
        //     , '\n\tviewFilter:', viewFilter
        //     // , '\n\ttempRelationship:', tempRelationship
        //     // , '\n\ttempTarget:', tempTarget
        //     , '\n\n'
        // );
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
                // console.log(`id:${concept.id}, isExcludedByFilter: ${isExcludedByFilter}\n`);
                return (
                    <Concept
                        key={`concept_${concept.id}`}
                        {...concept}
                        hasTempRelationship={hasTempRelationship}
                        isTempRelationship={hasTempRelationship && concept.id === tempRelationship.id}
                        tempTarget={tempTarget}
                        selected={concept.id === selectedConcept && selectedRelationship === null}
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