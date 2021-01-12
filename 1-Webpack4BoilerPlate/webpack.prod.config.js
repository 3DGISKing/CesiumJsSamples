const path = require('path');
const buildPath = path.resolve(__dirname, 'build');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const cesiumSource = 'node_modules/cesium/Source';

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        app: './src/index.js',
        //vendor: ['cesium']
    },
    output: {
        path: buildPath,
        publicPath: '/',
        //filename: '[name].[chunkhash:6].js'
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'src/asset/'),
                to: buildPath + '/asset'
            },
            /*
            {
                from: path.resolve(__dirname, 'node_modules/cesium/Build/Cesium/Widgets/'),
                to: buildPath + '/Widgets'
            },
            {
                from: path.resolve(__dirname, 'node_modules/cesium/Build/Cesium/Assets/'),
                to: buildPath + '/Assets'
            },
            {
                from: path.resolve(__dirname, 'node_modules/cesium/Build/Cesium/Workers/'),
                to: buildPath + '/Workers'
            }
            */
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
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
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
