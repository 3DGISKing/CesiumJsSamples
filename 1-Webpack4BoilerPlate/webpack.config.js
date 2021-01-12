const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const cesiumSource = 'node_modules/cesium/Source';

module.exports = {
    devServer: {
        contentBase: path.join(__dirname, '/src'),
        port: 8080
    },
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        app: './src/index.js',
        vendor : ['cesium']
    },
    output: {
        publicPath: '/',
        filename: '[name].js',
        // Needed to compile multiline strings in Cesium
        sourcePrefix: ''
    },
    amd: {
        // Enable webpack-friendly use of require in Cesium
        toUrlUndefined: true
    },
    node: {
        // Resolve node module use of fs
        fs: 'empty'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                from: path.join(cesiumSource, '/Assets'),
                to: 'Assets'
            },
            {
                from: path.join(cesiumSource, 'Widgets'),
                to: 'Widgets'
            },
            {
                from: path.join(cesiumSource, 'Workers'),
                to: 'Workers'
            }
        ]),
        new HtmlWebpackPlugin({
            hash: true,
            inject: false,
            minify: {
                removeComments: true
            },
            template: path.resolve(__dirname, 'public/index.html')
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                //include: /node_modules/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(json)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    },
    resolve: {
        alias: {
            // CesiumJS module name
            cesiumAlias: path.resolve(__dirname, cesiumSource)
        }
    },
};
