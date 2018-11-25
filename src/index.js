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

const models = {
    simple: simple,
    fire: fire
};
let loadTimeoutId;
let initialized = false;
let data;
let store = createStore(allReducers, {});

function init(modelName, targetSelector) {
    try {
        const model = models[modelName];
        if (model && !initialized) {
            initialized = true;
            data = util.initData(model);
            store = createStore(allReducers, data);
            render(targetSelector);
        }
    } catch (e) {
        console.error('ERROR - ConceptMap > init, e:', e);
    }
}

function load(json) {
    let data;
    try {
        data = JSON.parse(json);
        data = util.initData(data);
        console.log('MentalModelerConceptMap > load\ndata:', data);
        clearTimeout(loadTimeoutId);
        loadTimeoutId = setTimeout(() => {
            loadTimeoutId = undefined;
            this.props.modelLoad(data);
        }, 250);
        this.props.modelLoad({});
            
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

// init('fire');

// Define public API
let publicApi = {
    init,
    render,
    load,
    save,
    ConceptMap: App,
    store
};

// registerServiceWorker();
// console.log('store.getState():', store.getState());

// Expose to global scope to interact with LiveLab
if (typeof window !== 'undefined') {
    window.MentalModelerConceptMap = publicApi;
}

// Export API
// module.exports = publicApi;