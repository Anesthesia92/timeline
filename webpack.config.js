// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // Import the plugin

module.exports = {
    // Set mode to development or production
    mode: 'development', // or 'production'
    // Entry point of our application
    entry: './src/index.tsx',
    // Output configuration
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/',
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: 'eval-source-map',
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        // Use 'babel-loader' for JSX transpilation
                        transpileOnly: true, // Speeds up compilation, but disables type checking
                    },
                },
            },
            // All files with a '.js' or '.jsx' extension will be handled by 'babel-loader'.
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                        plugins: ['babel-plugin-styled-components'] // Required for styled-components
                    },
                },
            },
            // CSS files (for Swiper and other pure CSS)
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            // SASS/SCSS files
            {
                test: /\.(scss|sass)$/,
                use: [
                    MiniCssExtractPlugin.loader, // Extracts CSS into separate files
                    'css-loader', // Translates CSS into CommonJS
                    'sass-loader', // Compiles Sass to CSS
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html', // Path to your HTML template
            filename: 'index.html',
        }),
        new MiniCssExtractPlugin({
            filename: 'main.css', // Output filename for the extracted CSS
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 3000,
        open: true,
        historyApiFallback: true, // For React Router if used, but good practice
    },
};