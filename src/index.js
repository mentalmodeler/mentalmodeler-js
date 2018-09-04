import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import registerServiceWorker from './registerServiceWorker';
import allReducers from './reducers';
import App from './App';

import fire from './data/fire.mmp';
import './index.css';

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

console.log('store.getState():', store.getState());
