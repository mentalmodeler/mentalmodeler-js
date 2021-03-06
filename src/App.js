import React, { Component } from 'react';

import Map from './components/Map/Map';
import Controls from './components/Controls/Controls';

import './App.css';

class App extends Component {
        render() {
        return (
            <div className="MentalMapper">
                <Controls />  
                <Map standalone={this.props.standalone}/>
            </div>
        );
    }
}

export default App;
