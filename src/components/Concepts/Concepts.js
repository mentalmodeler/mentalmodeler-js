import React, { Component } from 'react';
import { connect } from 'react-redux';
import Concept from '../Concept/Concept';


class Concepts extends Component {
    render() {
        const {concepts} = this.props;
        const {collection, selectedConcept, selectedRelationship} = concepts;
        return (
            <div className="map__concepts">
            {collection.map((concept, index) => {
                return (
                    <Concept
                        key={`concept_${index}`}
                        {...concept}
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