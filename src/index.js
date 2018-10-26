import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import registerServiceWorker from './registerServiceWorker';
import allReducers from './reducers';
import App from './App';
import util from './utils/util';

import fire from './data/fire.mmp';
import simple from './data/simple.mmp';
import './index.css';

const data = util.initData(fire);

// prep json being creatingStore
//data.concepts = util.initializeConcepts(data.concepts);
// fire.positions = util.getConceptsPosition(fire.concepts);

// console.log('data:', data);

const store = createStore(allReducers, data);

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
