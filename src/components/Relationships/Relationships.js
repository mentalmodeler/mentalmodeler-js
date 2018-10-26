import React, { Component } from 'react';
import { connect } from 'react-redux';
import Relationship from '../Relationship/Relationship';
import util from '../../utils/util';


class Relationships extends Component {
    render() {
        const {positions, concepts} = this.props;
        const {collection, selectedConcept, selectedRelationship} = concepts;
        return (
            <div className="map__relationships">
            {collection.map((concept, conceptIndex) => {
                const relationships = concept.relationships || [];
                return relationships.map((relationship, relationshipIndex) => {
                    const {
                        id: influenceeId,
                        ...rest
                    } = relationship;

                    const {
                        x: influenceeX,
                        y: influenceeY,
                        width: influenceeWidth,
                        height: influenceeHeight
                    } = util.getPosition(influenceeId, positions);
                    
                    const {
                        id: influencerId,
                        x: influencerX,
                        y: influencerY,
                        width: influencerWidth,
                        height: influencerHeight
                    } = concept;
                    
                    const comboId = `relationship_${influencerId}-${influenceeId}`;
                    
                    return (
                        <Relationship
                            key={comboId}
                            comboId={comboId}
                            influenceeId={influenceeId}
                            influenceeX={influenceeX}
                            influenceeY={influenceeY}
                            influenceeWidth={influenceeWidth}
                            influenceeHeight={influenceeHeight}
                            influencerId={influencerId}
                            influencerX={influencerX}
                            influencerY={influencerY}
                            influencerWidth={influencerWidth}
                            influencerHeight={influencerHeight}
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
    const {concepts} = state;
    // console.log('\n-------Relationships > mapStateToProps\nstate:', state, '\n\n');
    const positions = util.getConceptsPosition(concepts.collection);
    return {
        concepts,
        positions
    };
}

export default connect(mapStateToProps)(Relationships);