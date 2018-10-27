import React, { Component, Fragment } from 'react';
import {connect} from 'react-redux';

import {ELEMENT_TYPE} from '../../utils/util';
import SelectedControl from './SelectedControl';
import TextAreaControl from './TextAreaControl';
import ControlPanel from './ControlPanel';

import './Controls.css';

const mapStateToProps = (state) => {
    const {concepts} = state;
    const {collection, selectedConcept, selectedRelationship} = concepts;
    let selectedType;
    let selectedData;
    if (selectedConcept !== null || selectedRelationship  !== null) {
        selectedType = selectedRelationship !== null
            ? ELEMENT_TYPE.RELATIONSHIP
            : ELEMENT_TYPE.CONCEPT;
        const selectedConceptData = collection.find((concept) => (
            concept.id === selectedConcept
        ));
        let selectedRelationshipData;
        if (selectedType === ELEMENT_TYPE.RELATIONSHIP && selectedConceptData && selectedConceptData.relationships) {
            selectedRelationshipData = selectedConceptData.relationships.find((relationship) => (
                relationship.id === selectedRelationship
            ));
        }
        selectedData = selectedType === ELEMENT_TYPE.RELATIONSHIP
            ? selectedRelationshipData
            : selectedConceptData;
    }

    return {
        selectedType,
        selectedData
    }
}

class Controls extends Component {
    render() {
        const {selectedType, selectedData} = this.props;
        // console.log('Controls > render\nthis.props:', this.props, '\n\n');
        return (
            <div className="controls">
                {selectedType && selectedData &&
                    <Fragment>
                        <SelectedControl
                            selectedType={selectedType}
                            selectedData={selectedData}
                        />
                        <ControlPanel title="Notes">
                            <TextAreaControl
                                className="control-panel__body-content"
                                maxHeight={200}
                                value={selectedData && selectedData.notes || ''}
                            />
                        </ControlPanel>
                        <ControlPanel title="Units">
                            <TextAreaControl
                                className="control-panel__body-content"
                                maxHeight={200}
                                value={selectedData && selectedData.units || ''}
                            />  
                        </ControlPanel>
                        <ControlPanel title="Group">
                            
                        </ControlPanel>
                        <ControlPanel title="View Filter">
                            
                        </ControlPanel>
                    </Fragment>
                }
            </div>
        );
    }
}

export default connect(mapStateToProps)(Controls);
