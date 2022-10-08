import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: './public/js/modules/auth.js',
    output: {
        file: 'public/js/auth-bundle.js',
        format: 'iife'
    },
    plugins: [json(), nodeResolve()]
};