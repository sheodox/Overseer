const path = require('path'),
	isProd = process.env.NODE_ENV === 'production',
	CopyPlugin = require('copy-webpack-plugin');

/*
need svgmin
 */

module.exports = {
	watch: !isProd,
	mode: isProd ? 'production' : 'development',
	entry: {
		'public/js/main': './src/components/index.js',
		'public/js/admin-main': './src/admin/admin-main.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, './dist/')
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			use: ['babel-loader']
		}, {
			test: /\.scss$/,
			use: ['style-loader', 'css-loader', 'sass-loader']
		}],
	},
	plugins: [
		new CopyPlugin([
			{from: '**/*.pug', context: './src'},
			{from: '**/*.js', context: './src'},
			{from: '**/*.svg', context: './src'},
			{from: '**/*.glsl', context: './src'}
		])
	]
};
