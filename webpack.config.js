const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const { env } = require('process');

const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';

module.exports = env => {
    const mode = isProduction ? 'production' : 'development';
    const htmlPlugins = generateHtmlPlugins('./source')
    if(env){
        if(env.cms){
            switch(env.cms){
                case 'wordpress':
                    htmlPlugins = []
                    break;
            }
        }
    }
    return {
        mode: mode,
        entry: {
            script : './source/script.js'
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'js/script.js'
        },
        plugins: [
            // new htmlPlugins(),
            // new HtmlWebpackPlugin({
            //     filename: 'catalog.html',
            //     template: './catalog.html'
            // }),
            // new CleanWebpackPlugin(),
            // new ReplaceInFileWebpackPlugin([{
            //     dir: appPath,
            //     test: /\.php$/,
            //     rules: [{
            //         search: /version/ig,
            //         replace: '1.0.0'
            //     },{
            //         search: '@title',
            //         replace: function(match){
            //
            //         }
            //     }]
            // }]),
            // new CopyPlugin({
            //     patterns: [
            //         {
            //             from: path.resolve(__dirname, path_theme+'/*.php'),
            //             to: path.resolve(__dirname, path_theme+'/')
            //         }
            //     ]
            // }),
            // new CopyWebpackPlugin({
            //     patterns: [
            //         {
            //             from: path.resolve(__dirname, 'source/fonts'),
            //             to: path.resolve(__dirname, 'dist/fonts')
            //         },
            //         {
            //             from: path.resolve(__dirname, 'source/img'),
            //                 to: path.resolve(__dirname, 'dist/img')
            //         }
            //     ]
            // }),
            new MiniCssExtractPlugin({
                filename: 'css/style.css'
            }),
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "window.jQuery": "jquery"
            })
        ].concat(htmlPlugins),
        module: {
            rules: [
                {
                    test: /\.s[ac]ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: (loader) => [
                                    require('precss'),
                                    require('autoprefixer'),
                                    require('css-mqpacker'),
                                    require('cssnano')({
                                        preset: [
                                            'default', {
                                                normalizeWhitespace: 1
                                            }
                                        ]
                                    })
                                ]
                            }
                        },
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'img',
                        publicPath: '../img'
                    }
                },
                {
                    test: /\.(ttf|eot|woff|woff2)$/i,
                    loader: 'file-loader',
                    options: {
                        name: '[contenthash].[ext]',
                        outputPath: 'fonts',
                        publicPath: '../fonts'
                    }
                },
                {
                    test: /\.html$/i,
                    loader: 'html-loader',
                    options: {
                        // Disables attributes processing
                        attributes: true
                    }
                }
            ]
        },
        devServer: {
            port: 3000,
            host: '192.168.1.67'
        }
    };
};

function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
    let resultNew = [],
        id = 0;
    templateFiles.forEach((v, i) => {
        const parts = v.split('.');
        const name = parts[0];
        const extension = parts[1];
        if(extension == 'html'){
            resultNew[id] = new HtmlWebpackPlugin({
                filename: `${name}.html`,
                template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`)
            })
            id++;
        }
    })
    return resultNew;
};