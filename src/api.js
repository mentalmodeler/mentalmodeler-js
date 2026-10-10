import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { saveAs } from 'file-saver';

import allReducers from './reducers';
import App from './App';
import util from './utils/util';
import { modelLoad } from './actions/index';

const store = createStore(allReducers, {});

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

export function save() {
    try {
        return util.exportData(store.getState());
    } catch (e) {
        console.error('ERROR - ConceptMap > save, e:', e);
    }
}

// used by the SAVE button; the public save() only returns data
export function downloadModel() {
    const data = save();
    if (data) {
        writeLocalFile({content: data.json, name: 'mmp.json', type: 'json'});
    }
}

export function render(target = '#root', {showLoadSaveButtons = true} = {}) {
    try {
        const elem = typeof target === 'string' ? document.querySelector(target) : target;
        ReactDOM.render(
            <Provider store={store}>
                <App
                    showLoadSaveButtons={showLoadSaveButtons}
                    onLoad={load}
                    onDownload={downloadModel}
                />
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

export { load, screenshot };
