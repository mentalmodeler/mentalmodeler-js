import React, { Component, Fragment } from 'react';
import {connect} from 'react-redux';

import {ELEMENT_TYPE} from '../../utils/util';
import ControlPanel from './ControlPanel';
import TextAreaControl from './TextAreaControl';
import SelectedControl from './SelectedControl';
import GroupControl from './GroupControl';

import {
    conceptChangeNotes,
    conceptChangeUnits,
    conceptChangeGroup
} from '../../actions/index';

import './Controls.css';

const mapStateToProps = (state) => {
    const {concepts, groupNames} = state;
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
        selectedData,
        groupNames
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        conceptChangeNotes: (id, notes) => {
            dispatch(conceptChangeNotes(id, notes))
        },

        conceptChangeUnits: (id, units) => {
            dispatch(conceptChangeUnits(id, units))
        },

        conceptChangeGroup: (id, groupIndex) => {
            dispatch(conceptChangeGroup(id, groupIndex))
        }
    };
}

class Controls extends Component {
    onNotesChange = (value) => {}
    onNotesBlur = ({event, value, isDirty}) => {
        const {selectedData, conceptChangeNotes} = this.props;
        if (isDirty) {
            conceptChangeNotes(selectedData.id, value);
        }
    }

    onUnitsChange = (value) => {}
    onUnitsBlur = ({event, value, isDirty}) => {
        const {selectedData, conceptChangeUnits} = this.props;
        if (isDirty) {
            conceptChangeUnits(selectedData.id, value);
        }
    }

    onGroupNameChange = ({event, groupIndex, value}) => {
        console.log('onGroupNameChange, groupIndex:', groupIndex, '\n\tvalue:', value, '\n\tevent:', event);
    }

    onGroupSelectionChange = ({event, groupIndex}) => {
        const {selectedData, conceptChangeGroup} = this.props;
        conceptChangeGroup(selectedData.id, groupIndex);
    }

    render() {
        const {selectedType, selectedData, groupNames} = this.props;
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
                                onChange={this.onNotesChange}
                                onBlur={this.onNotesBlur}
                                placeholder="Enter notes"
                            />
                        </ControlPanel>
                        <ControlPanel title="Unit of measurement">
                            <TextAreaControl
                                className="control-panel__body-content"
                                maxHeight={200}
                                value={selectedData && selectedData.units || ''}
                                onChange={this.onUnitsChange}
                                onBlur={this.onUnitsBlur}
                                placeholder="Enter units of measurement"
                            />  
                        </ControlPanel>
                        <ControlPanel title="Group">
                            <GroupControl
                                selectedType={selectedType}
                                selectedData={selectedData}
                                groupNames={groupNames}
                                onNameChange={this.onGroupNameChange}
                                onSelectionChange={this.onGroupSelectionChange}
                            />
                        </ControlPanel>
                        <ControlPanel title="View Filter">
                            
                        </ControlPanel>
                    </Fragment>
                }
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
