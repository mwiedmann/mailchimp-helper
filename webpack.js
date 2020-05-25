const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')
require('dotenv').config({ path: '.env' })

/**
 * This shows webpacks ability to import css files using css-loader and inject into the dom with style-loader.
 */
const config = (env) => ({
  entry: './src/main/index.tsx',
  module: {
    rules: [
      {
        test: /\.css$/i,
        sideEffects: true,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    // Need to add the .tsx, .ts extensions for ts-loader
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      MAILCHIMP_APIKEY: JSON.stringify(process.env.MAILCHIMP_APIKEY),
      MAILCHIMP_LISTID: JSON.stringify(process.env.MAILCHIMP_LISTID),
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.ejs',
      minify: false,
    }),
  ],
})

module.exports = config
