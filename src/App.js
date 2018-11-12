import React, { Component } from 'react';
// import {connect} from 'react-redux';

import Map from './components/Map/Map';
import Controls from './components/Controls/Controls';

import './App.css';

class App extends Component {
    render() {
        return (
            <div className="app">
                <Controls />  
                <Map />
            </div>
        );
    }
}

export default App;
