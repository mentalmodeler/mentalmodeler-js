import React, { Component } from 'react';
import {connect} from 'react-redux';

import Concepts from '../Concepts/Concepts';
import Relationships from '../Relationships/Relationships';

import './Map.css';

const mapStateToProps = (state) => {
    return {
        concepts: state.concepts
    };
}

class Map extends Component {
    render() {
        // console.log('this.props:', this.props);
        return (
            <div className="map">
                <div className="map__controls">
                </div>
                <div className="map__content">
                    <Relationships />
                    <Concepts />
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps)(Map);
