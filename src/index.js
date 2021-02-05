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

//--------------
// polyfills
//--------------
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

const params = new URLSearchParams(document.location.search.substring(1));
const initialize = !!params.has('init') && document.location.hostname === 'localhost';

// let loadTimeoutId;
let store = createStore(allReducers, {});

function loadModel(state) {
    // console.log('MentalModelerConceptMap > loadModel\nstate:', state, '\n\n');
    store.dispatch(modelLoad(state));
}

function load(json) {
    let data = json;
    try {
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }        
        data = util.initData(data);
        // clearTimeout(loadTimeoutId);
        // loadTimeoutId = setTimeout(() => {
        //     loadTimeoutId = undefined;
        //     loadModel(data);
        // }, 0);
        // loadModel({});
        loadModel({});
        loadModel(data);
            
    } catch (e) {
        console.error('ERROR - ConceptMap > load, e:', e);
    }
}

function save() {
    try {
        const data =  util.exportData(store.getState());
        // console.log('\n\n---- MentalModelerConceptMap > save\ndata:', data, '\n\n');
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

// screenshot api call that returns canvas element of map from html2canvas
function screenshot () {
    if (typeof window.html2canvas === 'undefined') {
        console.error('ERROR: html2canvas is not defined (screenshot)');
        return
    }

    const mapContent = document.querySelector('.map__content');
    if (mapContent) {
        const width = mapContent.scrollWidth;
        const height = mapContent.scrollHeight; 
        const svgs = mapContent.querySelectorAll('svg');
        svgs.forEach((svg) => {
            svg.setAttributeNS(null, 'width', width);
            svg.setAttributeNS(null, 'height', height);
        });
        mapContent.style.overflow = 'visible';

        const promise = (window.html2canvas(mapContent, {width, height, allowTaint: true, logging: false}));

        promise.then((canvas) => {
            try {
                svgs.forEach((svg) => {
                    svg.removeAttributeNS(null, 'width');
                    svg.removeAttributeNS(null, 'height');
                });
                mapContent.style.overflow = 'auto';
            } catch (e) {
                console.log(e);
            }
        });

        return promise;
    }
}

if (initialize) {
    render();
    load(simple);
    // load(fire);
}

// Define public API
let publicApi = {
    render,
    load,
    save,
    screenshot
};

// registerServiceWorker();
// console.log('store.getState():', store.getState());

// Expose to global scope
if (typeof window !== 'undefined') {
    window.MentalModelerConceptMap = publicApi;
}

// document.body.addEventListener('click', () => {
//     console.log('screenshot:', screenshot());
// });
