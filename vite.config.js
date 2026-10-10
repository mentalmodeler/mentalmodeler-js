import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// This codebase writes JSX in .js files; Vite 8's oxc transform infers the
// language from the extension, so compile src/**/*.js as .jsx before plugin-react.
const jsxInJs = {
    name: 'jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
        if (!/\/src\/.*\.js$/.test(id) || id.includes('node_modules')) return null;
        return transformWithOxc(code, id.replace(/\.js$/, '.jsx'), { lang: 'jsx' });
    },
};

// `vite build --mode lib`   -> dist/mentalmodeler-js.es.js (+ .css): ES module for import
// `vite build --mode embed` -> dist/embed/main.js (+ main.css): IIFE sets window.MentalModelerConceptMap
export default defineConfig(({ mode, command }) => {
    const embed = mode === 'embed';
    return {
        plugins: [jsxInJs, react()],
        base: './',
        // dist/ is a package, not a site: build-site copies public/ into build/ itself
        publicDir: command === 'build' ? false : 'public',
        server: { port: 3000 },
        optimizeDeps: {
            // the dep scanner parses src/**/*.js as plain JS; this codebase writes JSX in .js files
            rolldownOptions: { moduleTypes: { '.js': 'jsx' } },
        },
        // Library mode does not replace process.env.NODE_ENV, and bundled React/Redux read it.
        // Build-only so dev keeps React's development warnings.
        define: command === 'build' ? { 'process.env.NODE_ENV': JSON.stringify('production') } : {},
        build: {
            outDir: embed ? 'dist/embed' : 'dist',
            emptyOutDir: !embed, // embed runs second and must not wipe the ES build
            sourcemap: true,
            lib: {
                entry: resolve(__dirname, embed ? 'src/embed.js' : 'src/lib.js'),
                name: 'MentalModelerConceptMapBundle',
                formats: [embed ? 'iife' : 'es'],
                fileName: () => (embed ? 'main.js' : 'mentalmodeler-js.es.js'),
                cssFileName: embed ? 'main' : 'mentalmodeler-js',
            },
        },
        test: { environment: 'jsdom', globals: true },
    };
});
