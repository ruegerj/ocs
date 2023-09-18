import { copyFile } from 'node:fs/promises';

(async () => {
    const output = await Bun.build({
        entrypoints: [
            'src/worker.js',
            'src/scripts/shortcuts.js',
            'src/popup/popup.js',
        ],
        outdir: 'bin',
        minify: true,
        target: 'browser',
        splitting: false,
    });

    if (!output.success) {
        console.error('❌ JS compile & bundle failed:');
        console.error(output.logs.join('\n'));
        return process.exit(1);
    }

    console.log('🤖JS compiled & bundled');

    const tailwindArgs = ['-o', 'bin/popup/popup.css', '--minify'];

    const tailwind = Bun.spawnSync(['bunx', 'tailwindcss', ...tailwindArgs]);
    if (!tailwind.success) {
        console.log('❌ Tailwind build failed');
        console.log(tailwind.stderr);
        return process.exit(1);
    }

    console.log('🪽 Tailwind built');

    try {
        await copyFile('src/manifest.json', 'bin/manifest.json');
        await copyFile('src/popup/popup.html', 'bin/popup/popup.html');
        console.log('📁Static files copied');
    } catch (error) {
        console.error('❌ Static files copy failed', error);
        return process.exit(1);
    }

    console.log('\n✅ Extension build succeeded');
})();
