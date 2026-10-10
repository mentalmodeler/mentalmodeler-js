describe('lib entry', () => {
    beforeEach(() => {
        delete window.html2canvas;
        vi.resetModules();
    });

    it('provides window.html2canvas for the widget screenshot code', async () => {
        await import('./lib');
        expect(typeof window.html2canvas).toBe('function');
    });

    it('does not overwrite an html2canvas the host already defined', async () => {
        const hostCopy = () => {};
        window.html2canvas = hostCopy;
        await import('./lib');
        expect(window.html2canvas).toBe(hostCopy);
    });
});
