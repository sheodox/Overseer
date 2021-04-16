const path = require('path'),
	{WebpackManifestPlugin} = require('webpack-manifest-plugin'),
	{BundleAnalyzerPlugin} = require('webpack-bundle-analyzer'),
	CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: {
		'main': './src/static/main.js',
		'admin': './src/static/admin/admin-main.js',
	},
	output: {
		filename: '[name].[contenthash].js',
		path: path.resolve(__dirname, './public/'),
		publicPath: ""
	},
	resolve: {
		alias: {
			svelte: path.resolve('node_modules', 'svelte')
		},
		extensions: ['.mjs', '.js', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main'],
	},
	module: {
		rules: [
			{
				test: /\.(html|svelte)$/,
				use: 'svelte-loader'
			},
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			}
		]
	},
	plugins: [
		new CopyPlugin([
			{from: '**/*.svg', context: './src/static'},
			{from: '**/*.glsl', context: './src/static'},
			{from: 'sw.js', context: './src/static'},
			{from: 'robots.txt', context: './src/static'},
			{from: 'assets/**.*', context: './src/static'},
			//move fontawesome assets to where they can be served
			{from: 'fontawesome-free/**/*.{woff,ttf,css,txt,woff2}', context: './node_modules/@fortawesome/'}
		]),
		new WebpackManifestPlugin(),
		// new BundleAnalyzerPlugin()
	]
};
