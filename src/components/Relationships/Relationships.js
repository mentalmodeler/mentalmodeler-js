import React, { Component } from 'react';
import { connect } from 'react-redux';
import Relationship from '../Relationship/Relationship';
import util from '../../utils/util';

const getPosition = (id, positions) => (positions[id] || {x: 0, y: 0});

class Relationships extends Component {
    render() {
        const {positions, concepts} = this.props;
        return (
            <div className="map__relationships">
            {concepts.map((concept, conceptIndex) => {
                const {id, x, y} = concept;
                const relationships = concept.relationships || [];
                return relationships.map((relationship, relationshipIndex) => {
                    const {id: influenceeId, ...rest} = relationship;
                    const {x: influenceeX, y: influenceeY} = getPosition(influenceeId, positions);
                    const influencerId = concept.id;
                    const comboId = `relationship_${influencerId}-${influenceeId}`;
                    return (
                        <Relationship
                            key={comboId}
                            comboId={comboId}
                            influencerId={influencerId}
                            influencerX={concept.x}
                            influencerY={concept.y}
                            influenceeId={influenceeId}
                            influenceeX={influenceeX}
                            influenceeY={influenceeY}
                            {...rest}
                        />
                    );
                })
            })}
            </div>
        );
    }
}            

const mapStateToProps = (state) => {
    const positions = util.getConceptsPosition(state.concepts);
    // console.log('positions:', positions);
    return {
        concepts: state.concepts,
        positions
    };
}

export default connect(mapStateToProps)(Relationships);