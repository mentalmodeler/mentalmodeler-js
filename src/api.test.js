import { render, load, save } from './api';

const model = {
    info: { id: 'x', name: 'T', author: 'a', description: '' },
    groupNames: { 0: 'g0' },
    concepts: [
        { id: 'a', name: 'A', x: 10, y: 10, group: 0, relationships: [{ id: 'b', influence: 0.5, confidence: 1 }] },
        { id: 'b', name: 'B', x: 100, y: 100, group: 0, relationships: [] },
    ],
};

function mount(options) {
    const el = document.createElement('div');
    document.body.appendChild(el);
    render(el, options);
    return el;
}

describe('api', () => {
    it('save() returns the loaded model, never undefined', () => {
        load(model);
        const out = save();
        expect(out).toBeDefined();
        expect(out.json).toBeDefined();
        expect(out.json).toContain('"name":"A"');
    });

    it('load() accepts a JSON string', () => {
        load(JSON.stringify(model));
        expect(save().json).toContain('"name":"B"');
    });

    it('load() with garbage leaves the existing model intact', () => {
        load(model);
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        load('not json');
        load(null);
        load('');
        spy.mockRestore();
        expect(save().json).toContain('"name":"A"');
    });

    it('shows LOAD/SAVE buttons by default', () => {
        const el = mount();
        expect(el.querySelector('.map-controls__save')).not.toBeNull();
        expect(el.querySelector('.map-controls__load')).not.toBeNull();
    });

    it('hides LOAD/SAVE buttons when showLoadSaveButtons is false', () => {
        const el = mount({ showLoadSaveButtons: false });
        expect(el.querySelector('.map-controls__save')).toBeNull();
        expect(el.querySelector('.map-controls__load')).toBeNull();
    });

    it('render() into a second container does not throw', () => {
        mount();
        expect(() => mount({ showLoadSaveButtons: false })).not.toThrow();
    });
});
