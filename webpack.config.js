var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    entry: {
        'index': './src/index'
    },
    output: {
        path: path.join(__dirname, 'dist'), //打包输出的路径
        publicPath: './', //发布地址。
        filename: '[name].js', //打包多个
    },
    module: {
        rules: [{
            test: /\.js?$/,
            loader: "babel-loader",
            exclude: /node_modules/,
            query: {
                presets: ['es2015', 'stage-3'],
                compact: false
            }
        }, {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader', 'sass-loader'] })
        }, {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
        }, {
            test: /\.(png|gif|jpe?g)$/,
            loader: 'url-loader?prefix=img&limit=10240&name=/img/[name].[hash].[ext]'
        }, {
            test: /\.woff(2)?(\?t=[0-9]\.[0-9]\.[0-9])?$/,
            loader: "url-loader?limit=10240&minetype=application/font-woff&name=/fonts/[name].[md5:hash:hex:7].[ext]"
        }, {
            test: /\.(ttf|eot|svg)(\?t=[0-9]\.[0-9]\.[0-9])?$/,
            loader: "file-loader?name=/fonts/[name].[md5:hash:hex:7].[ext]"
        }]
    },
    resolve: {
        extensions: [".js"]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            mangle: false,
            compress: false,
            output: {
                beautify: true,
                comments: false
            }
        }),
        new ExtractTextPlugin({
            filename:  '[name].css',
            allChunks: true
        }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: { discardComments: {removeAll: true } },
            canPrint: true
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"'
        }),
        new webpack.optimize.CommonsChunkPlugin({name: 'common'})
    ]
};
