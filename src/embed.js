import { render, load, save, screenshot } from './lib';

if (typeof window !== 'undefined') {
    window.MentalModelerConceptMap = { render, load, save, screenshot };
}
