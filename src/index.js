import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

// import registerServiceWorker from './registerServiceWorker'; 
import allReducers from './reducers';
import App from './App';
import util from './utils/util';
import {modelLoad} from './actions/index';
import { saveAs } from 'file-saver';


import fire from './data/fire.mmp'; // eslint-disable-line
import simple from './models/simple.mmp.json'; // eslint-disable-line

import './index.css';

//--------------
// polyfills
//--------------
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

const params = new URLSearchParams(document.location.search.substring(1));
const dev = process.env.NODE_ENV === 'development';
const standalone = !!params.has('standalone') || dev || document.location.hostname === 'mentalmodeler.github.io';
const loadTestFile = dev && !!params.has('init');
let store = createStore(allReducers, {});

function loadModel(state) {
    store.dispatch(modelLoad(state));
}

function load(json) {
    let data = json;
    try {
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }        
        data = util.initData(data);
        loadModel({});
        loadModel(data);
            
    } catch (e) {
        console.error('ERROR - ConceptMap > load, e:', e);
    }
}

function writeLocalFile({content, name, type}) {
    try {
        let isFileSaverSupported = !!new Blob; // eslint-disable-line
        let url = content;
        if (type === 'json') {
            var bb = new Blob([content], { type: 'application/json'});
            url = window.URL.createObjectURL(bb);
        } else if (type === 'canvas') {
            url = content.toDataURL();
        }
        const link = document.createElement('a');
        if (typeof link.download === 'string') {
            saveAs(url, name);
        } else {
            if (type === 'json') {
                window.open(url);
            } else {
                alert('Image download not supported in your current browser. Please use a modern browser.');
            }
        }
        link.remove();
        type === 'json' && url && window.URL.revokeObjectURL(url);
    } catch (e) {
        console.log('ERROR - save\ne:', e, '\ntype:', type, ', name:', name, '\ncontent:', content);
    }
}

function save() {
    try {
        const data =  util.exportData(store.getState());
        return standalone
            ? writeLocalFile({content: data.json, name: 'mmp.json', type: 'json'})
            : data;        
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
                <App standalone={standalone}/>
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

if (standalone) {
    render();
    if (loadTestFile) {
        load(simple);
        // load(fire);
    }
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
