import React, { Component, Fragment } from 'react';
import {connect} from 'react-redux';

import Concepts from '../Concepts/Concepts';
import Relationships from '../Relationships/Relationships';

import {
    conceptFocus,
    conceptAdd,
    modelLoad
} from '../../actions/index';

import './Map.css';

const showSaveLoad = false;

class Map extends Component {
    onClickMap = (e) => {
        if (e.target === this.mapContent) {
            this.props.conceptFocus(null);
        }
    }

    onClickAddConcept = (e) => {
        this.props.conceptAdd();
    }

    setMapContentRef = (ref) => {
        this.mapContent = ref;
    }

    onFileReaderLoadEnd = (e) => {
        const result = e.target.result;
        if (window.MentalModelerConceptMap) {
            window.MentalModelerConceptMap.load(result);
        } else {
            console.error('ERROR - window.MentalModelerConceptMap is undefined');
        }
    }

    handleInputChange = (e) => {
        const file = e.target.files[0];
        console.log('file:', file);
        if (file) {
            const fileReader = new FileReader();
            fileReader.onloadend = this.onFileReaderLoadEnd;
            fileReader.readAsText(file);
        }
    }

    setInputRef = (ref) => {
        this.inputRef = ref;
    }

    onClickLoad = (e) => {
        if (this.inputRef) {
            this.inputRef.click();
        }
    }

    onClickSave = (e) => {
        // console.log('onClickSave');
        if (window.MentalModelerConceptMap) {
            window.MentalModelerConceptMap.save();
        }
    }

    render() {
        return (
            <div className="map">
                <div className="map__controls">
                    <button
                        className="map-controls__add-component"  
                        onClick={this.onClickAddConcept}
                    >
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="map-controls__add-component-icon">
                                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"/>
                            </svg>
                            {'ADD COMPONENT'}
                        </span>
                    </button>
                    {showSaveLoad &&
                    <Fragment>
                        <div>
                            <input
                                type="file"
                                id="fileElem"
                                ref={this.setInputRef}
                                accept=".js,.xml,.mmp"
                                style={{display: 'none'}}
                                onChange={this.handleInputChange}
                            />
                            <button className="map-controls__load" onClick={this.onClickLoad}>
                                <span>{'LOAD'}</span>
                            </button>
                        </div>
                        <button
                            className="map-controls__save"  
                            onClick={this.onClickSave}
                        >
                            <span>{'SAVE'}</span>
                        </button>
                    </Fragment>
                    }
                </div>
                <div
                    className="map__content"
                    ref={this.setMapContentRef}
                    onClick={this.onClickMap}
                >
                    <Relationships />
                    <Concepts />
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        conceptFocus: (id) => {
            dispatch(conceptFocus(id))
        },

        conceptAdd: () => {
            dispatch(conceptAdd());
        },

        modelLoad: (state) => {
            dispatch(modelLoad(state))
        }
    };
}

export default connect(null, mapDispatchToProps)(Map);