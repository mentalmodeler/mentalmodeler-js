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
let initialized = false;
let data;
let store;

console.log('models[simple]:', models['simple']);

function init(modelName, targetSelector) {
    const model = models[modelName];
    if (model && !initialized) {
        initialized = true;
        data = util.initData(model);
        store = createStore(allReducers, data);
        render(targetSelector);
    }
}

function load(model) {

}

function save() {

}

function render(target = '#root') {
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.querySelector(target)
    );
}

init('fire');

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


// /**
//  * render()
//  * JS wrapper for managing rendering of component
//  */
// function render(options) {
//     let target = options.target;
//     let comp = ReactDOM.render(
//         <Typeahead {...options} />,
//         document.querySelector(target)
//     );
//     return comp;
// }

// // Define public API
// let publicApi = {
//     render,
//     ConceptMap: App,
//     Typeahead
// };

// // Expose to global scope to interact with LiveLab
// if (typeof window !== 'undefined') {
//     window.MentalModelerConceptMap = publicApi;
// }

// // Export API
// module.exports = publicApi;
