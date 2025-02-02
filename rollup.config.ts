import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import commonjs from "@rollup/plugin-commonjs";

export default [{
    input: './public/js/modules/main.js',
    output: {
        file: 'public/js/bundle.js',
        format: 'iife'
    },
    plugins: [json(), nodeResolve(), terser(), commonjs({
        include: /node_modules/,
        requireReturnsDefault: 'auto', // <---- this solves default issue
    })]
},
{
    input: './public/js/modules/auth.js',
    output: {
        file: 'public/js/auth-bundle.js',
        format: 'iife'
    },
    plugins: [json(), nodeResolve(), terser()]
},
{
    input: 'public/js/modules/components-demo.js',
    output: {
        file: 'public/js/components-bundle.js',
        format: 'iife'
    },
    plugins: [json(), nodeResolve(), terser()]
}];