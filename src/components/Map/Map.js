import React, { Component } from 'react';
import {connect} from 'react-redux';

import Concepts from '../Concepts/Concepts';
import Relationships from '../Relationships/Relationships';

import {
    conceptFocus,
    conceptAdd
} from '../../actions/index';

import './Map.css';

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

    render() {
        // console.log('this.props:', this.props);
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
        }
    };
}

export default connect(null, mapDispatchToProps)(Map);