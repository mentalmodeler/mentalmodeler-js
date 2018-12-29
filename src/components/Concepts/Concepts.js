import React, { Component } from 'react';
import { connect } from 'react-redux';
import Concept from '../Concept/Concept';

class Concepts extends Component {
    render() {
        const {concepts} = this.props;
        const {collection, selectedConcept, selectedRelationship, tempRelationship, tempTarget} = concepts;
        const hasTempRelationship = !!tempRelationship;
        // console.log('\n\nConcepts > render'
        //     , '\n\tselectedConcept:', selectedConcept
        //     , '\n\tselectedRelationship:', selectedRelationship
        //     , '\n\ttempRelationship:', tempRelationship
        //     , '\n\ttempTarget:', tempTarget
        //     , '\n\n'
        // );
        return (
            <div className="map__concepts">
            {collection.map((concept, index) => {
                return (
                    <Concept
                        key={`concept_${concept.id}`}
                        {...concept}
                        hasTempRelationship={hasTempRelationship}
                        isTempRelationship={hasTempRelationship && concept.id === tempRelationship.id}
                        tempTarget={tempTarget}
                        selected={concept.id === selectedConcept && selectedRelationship === null}
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