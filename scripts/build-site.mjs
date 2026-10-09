import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';

if (!existsSync('dist/embed/main.js')) {
    console.error('dist/embed/main.js missing — run `npm run build-js` first');
    process.exit(1);
}
rmSync('build', { recursive: true, force: true });
mkdirSync('build/models', { recursive: true });
cpSync('public', 'build', { recursive: true });
cpSync('site/index.html', 'build/index.html');
cpSync('dist/embed', 'build/embed', { recursive: true });
cpSync('src/models/fire.mmp.json', 'build/models/fire.mmp.json');
