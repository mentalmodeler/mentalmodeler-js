import React, { Component } from 'react';
import {connect} from 'react-redux';

import Concepts from './components/Concepts/Concepts';

import './App.css';

const mapStateToProps = (state) => {
    return {
        concepts: state.concepts
    };
}

class App extends Component {
    render() {
        // console.log('this.props:', this.props);
        return (
            <div className="app">
                <div className="controls">
                </div>  
                <div className="map">
                    <div className="map__controls">
                    </div>
                    <div className="map__content">
                        <Concepts />
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps)(App);
