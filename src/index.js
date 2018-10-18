import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import registerServiceWorker from './registerServiceWorker';
import allReducers from './reducers';
import App from './App';
import util from './utils/util';

import fire from './data/fire.mmp';
import './index.css';

// prep json being creatingStore
util.parsePositionData(fire.concepts);
// fire.positions = util.getConceptsPosition(fire.concepts);
console.log('fire:', fire)

const store = createStore(allReducers, fire);

ReactDOM.render(
    <Provider
        store={store}
    >
      <App />
    </Provider>,
    document.getElementById('root')
);

registerServiceWorker();

// console.log('store.getState():', store.getState());
