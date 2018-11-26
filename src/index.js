import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

// import registerServiceWorker from './registerServiceWorker'; 
import allReducers from './reducers';
import App from './App';
import util from './utils/util';
import {modelLoad} from './actions/index';

import fire from './data/fire.mmp'; // eslint-disable-line
import simple from './data/simple.mmp'; // eslint-disable-line

import './index.css';

const params = new URLSearchParams(document.location.search.substring(1));
const initialize = !!params.has('init') && document.location.hostname === 'localhost';

let loadTimeoutId;
let store = createStore(allReducers, {});

function loadModel(state) {
    console.log('MentalModelerConceptMap > loadModel\nstate:', state, '\n\n');
    store.dispatch(modelLoad(state));
}

function load(json) {
    let data = json;
    try {
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }        
        data = util.initData(data);
        console.log('MentalModelerConceptMap > load\ndata:', data);
        clearTimeout(loadTimeoutId);
        loadTimeoutId = setTimeout(() => {
            loadTimeoutId = undefined;
            loadModel(data);
        }, 250);
        loadModel({});
            
    } catch (e) {
        console.error('ERROR - ConceptMap > load, e:', e);
    }
}

function save() {
    try {
        const data =  util.exportData(store.getState());
        console.log('MentalModelerConceptMap > save\ndata:', data);
        return data;
    } catch (e) {
        console.error('ERROR - ConceptMap > save, e:', e);
    }
}

function render(target = '#root') {
    try {
        let elem;
        if (target instanceof Element || target instanceof HTMLDocument) {
            elem = target;
        } else if (typeof target === 'string') {
            elem = document.querySelector(target);
        }
        ReactDOM.render(
            <Provider store={store}>
                <App />
            </Provider>,
            elem
        );
    } catch (e) {
        console.error('ERROR - ConceptMap > render, e:', e);
    }
}

if (initialize) {
    render();
    load(simple);
}

// Define public API
let publicApi = {
    render,
    load,
    save
};

// registerServiceWorker();
// console.log('store.getState():', store.getState());

// Expose to global scope to interact with LiveLab
if (typeof window !== 'undefined') {
    window.MentalModelerConceptMap = publicApi;
}

// Export API
// module.exports = publicApi;