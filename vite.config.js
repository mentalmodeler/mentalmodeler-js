import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';

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

export default defineConfig({
    plugins: [jsxInJs, react()],
    // relative base matches CRA's "homepage": "." — required because the
    // deployed site lives at a GH Pages project subpath, not domain root.
    base: './',
    server: {
        port: 3000,
    },
    optimizeDeps: {
        // the dep scanner parses src/**/*.js as plain JS; this codebase writes JSX in .js files
        rolldownOptions: {
            moduleTypes: { '.js': 'jsx' },
        },
    },
    build: {
        outDir: 'build',
        sourcemap: true,
        rollupOptions: {
            output: {
                entryFileNames: 'static/js/main.js',
                chunkFileNames: 'static/js/[name].js',
                assetFileNames: (assetInfo) => {
                    const name = assetInfo.name || (assetInfo.names && assetInfo.names[0]) || '';
                    return name.endsWith('.css') ? 'static/css/main.css' : 'static/media/[name][extname]';
                },
            },
        },
    },
    test: {
        environment: 'jsdom',
        // mirrors Jest's implicit it()/describe() globals so App.test.js needs no edits
        globals: true,
    },
});
