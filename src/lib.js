import './index.css';

//--------------
// polyfills
//--------------
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

export { render, load, save, screenshot } from './api';
