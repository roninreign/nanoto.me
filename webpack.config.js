const path = require('path');

module.exports = {
    // entry: './src/app.js',
    entry : {
        vendor : {
            import :  "./src/vendor.js"
        },
        qr : {
            import :  "./src/qr.js",
            filename : "assets/js/qr.js"
        },
        watch : {
            import :  "./src/watch.js",
            filename : "assets/js/watch.js"
        }
    },
    watch: true,
    watchOptions: {
        ignored: /node_modules/,
      },
    mode: 'development',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.(scss)$/,
                use: [{
                    loader: 'style-loader', // inject CSS to page
                }, {
                    loader: 'css-loader', // translates CSS into CommonJS modules
                }, {
                    loader: 'postcss-loader', // Run postcss actions
                    options: {
                        postcssOptions: {
                            plugins: [function () { // postcss plugins, can be exported to postcss.config.js
                                return [
                                    require('autoprefixer')
                                ];
                            }]
                        }

                    }
                }, {
                    loader: 'sass-loader' // compiles Sass to CSS
                }]
            },
        ]
    }
};