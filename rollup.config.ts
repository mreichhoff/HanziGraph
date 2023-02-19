import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: './js/modules/main.js',
    output: {
        file: 'js/bundle.js',
        format: 'iife'
    },
    plugins: [json(), nodeResolve()]
};
