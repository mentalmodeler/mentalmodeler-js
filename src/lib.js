import html2canvas from 'html2canvas';

//--------------
// polyfills
//--------------
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

// The widget's screenshot code (camera button and screenshot()) reads window.html2canvas.
// Provide the bundled copy unless the host already defined one. mentalmodeler-suite
// relies on this global for its own print capture of non-widget panels.
if (typeof window !== 'undefined' && typeof window.html2canvas === 'undefined') {
    window.html2canvas = html2canvas;
}

export { render, load, save, screenshot } from './api';
