import React, { Component } from 'react';
import { connect } from 'react-redux';
import Relationship from '../Relationship/Relationship';
import util from '../../utils/util';


class Relationships extends Component {
    render() {
        const {positions, concepts} = this.props;
        let {collection, selectedConcept, selectedRelationship, tempRelationship, viewFilter} = concepts;
        if (false) {
            tempRelationship = {
                startX: 400,
                endX: 400,
                startY: 400,
                endY: 700,
                id: 14,
                width: 100,
                height: 100
            };
        }
        const hasTempRelationship = !!tempRelationship;
        // console.log('hasTempRelationship:', hasTempRelationship);
        return (
            <div className="map__relationships">
            {
                collection.map((concept, conceptIndex) => {
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
                        const selected = selectedConcept === influencerId
                            && selectedRelationship === influenceeId;
                        const isExcludedByFilter = util.isRelationshipExcludedByFilter({
                                viewFilter,
                                selectedConcept,
                                concept,
                                influencerId,
                                influenceeId,
                                collection
                            });
                        return (
                            <Relationship
                                key={comboId}
                                hasTempRelationship={hasTempRelationship}
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
                                selected={selected}
                                isExcludedByFilter={isExcludedByFilter}
                                {...rest}
                            />
                        );
                    })
                })
            }
            {tempRelationship &&
                <Relationship
                    className="Relationship--temp"
                    key="tempRelationship"
                    influenceeX={tempRelationship.endX}
                    influenceeY={tempRelationship.endY}
                    influenceeWidth={tempRelationship.width / 2}
                    influenceeHeight={tempRelationship.height + 15}
                    influencerX={tempRelationship.startX}
                    influencerY={tempRelationship.startY}
                    influencerWidth={tempRelationship.width / 2}
                    influencerHeight={tempRelationship.height + 15}
                    selected={false}
                    influence={0}
                    tempLine={true}
                    hasTempRelationship={hasTempRelationship}                            
                />
            }
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