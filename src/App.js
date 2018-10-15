import React, { Component } from 'react';
import {connect} from 'react-redux';

import Map from './components/Map/Map';

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
                <Map />
            </div>
        );
    }
}

export default connect(mapStateToProps)(App);
