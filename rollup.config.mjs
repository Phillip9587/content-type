import { rmSync } from 'node:fs';

// clean up
rmSync('index.cjs', { force: true });

export default {
    input: 'index.mjs',
    output: {
        format: 'cjs',
        file: 'index.cjs',
        generatedCode: {
            preset: 'es2015',
            symbols: false,
        },
        interop: 'default',
        esModule: false,
        validate: true,
        banner:
            '// NOTICE: This file is generated by Rollup. To modify it, please instead edit the ESM counterpart and rebuild with Rollup (npm run build).',
        exports: 'named'
    },
    treeshake: false
};
