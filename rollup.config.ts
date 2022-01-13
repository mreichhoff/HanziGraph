import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: './public/js/modules/main.js',
    output: {
        file: 'public/js/bundle.js',
        format: 'iife'
    },
    plugins: [json(), nodeResolve()]
};
