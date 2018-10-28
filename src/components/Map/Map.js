import React, { Component } from 'react';
import {connect} from 'react-redux';

import Concepts from '../Concepts/Concepts';
import Relationships from '../Relationships/Relationships';

import {conceptFocus} from '../../actions/index';

import './Map.css';

class Map extends Component {
    onClickMap = (e) => {
        if (e.target === this.mapContent) {
            this.props.conceptFocus(null);
        }
    }

    setMapContentRef = (ref) => {
        this.mapContent = ref;
    }

    render() {
        // console.log('this.props:', this.props);
        return (
            <div className="map">
                <div className="map__controls">
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
        }
    };
}

export default connect(null, mapDispatchToProps)(Map);