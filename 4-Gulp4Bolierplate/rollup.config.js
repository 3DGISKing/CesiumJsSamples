import postcss from 'rollup-plugin-postcss';
import rollupPluginHtml from "rollup-plugin-html";
import { terser } from "rollup-plugin-terser";
import obfuscator from "rollup-plugin-javascript-obfuscator";

const globals = {
	cesium: 'Cesium',
};

const dotenv = require('dotenv');
dotenv.config();

const config = process.env.config;

let plugins = [
	postcss({
		extensions: [ '.css' ]
	}),
	rollupPluginHtml({
		include: "**/*.tpl.html",
	}),
];

let outputPath;

const isRelease = config === 'release' || config !== 'debug';

if(isRelease){
	plugins.push(
		terser(),
		obfuscator({
			compact: true
		}));

	outputPath = 'build/app.js';
}
else {
	outputPath = 'tmp/app.js';
}

export default [
	{
		input: 'src/index.js',
		treeshake: false,
		external: ['cesium'],
		output: {
			file: outputPath,
			format: 'umd',
			name: 'CesiumGIS',
			globals: globals,
			sourcemap: !isRelease,
		},
		plugins: plugins
	}
]