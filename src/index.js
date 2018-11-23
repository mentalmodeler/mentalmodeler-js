import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import registerServiceWorker from './registerServiceWorker';
import allReducers from './reducers';
import App from './App';
import util from './utils/util';

import fire from './data/fire.mmp'; // eslint-disable-line
import simple from './data/simple.mmp'; // eslint-disable-line
import './index.css';

// prep json before creatingStore
const data = util.initData(simple);
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
