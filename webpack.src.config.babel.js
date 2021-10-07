import path from 'path'
import fs from 'fs'
import vendors from './index'
import VendorReplacePlugin from './webpack.vendorReplace.plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const manifest = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'manifest.json'))
)
const type = Object.keys(manifest)[0]
const tag = Object.keys(manifest[type])[0]

export default Object.assign(
  {},
  {
    devtool: 'eval',
    mode: 'development',
    entry: {
      element: process.cwd() + '/' + tag + '/index.js',
      vendor: vendors(),
    },
    output: {
      path: path.resolve(process.cwd(), 'public/dist/'),
      // Assets dist path
      publicPath: 'auto',
      // Used to generate URL's
      filename: '[name].bundle.js',
      // Main bundle file
      chunkFilename: '[name].bundle.js',
      chunkLoadingGlobal: 'vcvWebpackJsonp4x',
      assetModuleFilename: 'images/[hash][ext][query]',
    },
    optimization: {
      minimize: false,
      runtimeChunk: 'single',
      chunkIds: 'named',
      moduleIds: 'named',
      splitChunks: {
        cacheGroups: {
          default: false,
          vendor: {
            chunks: 'initial',
            name: 'vendor',
            test: 'vendor',
            enforce: true,
          },
          element: {
            chunks: 'initial',
            name: 'element',
            test: 'element',
            enforce: true,
          },
        },
      },
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].bundle.css',
      }),
      new VendorReplacePlugin(tag + '/index.js', type),
    ],
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css|\.less$/,
          exclude: [/styles\.css/, /editor\.css/],
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: function plugins() {
                    return [require('autoprefixer')()]
                  },
                },
              },
            },
            'less-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|ttf|woff)$/,
          type: 'asset/resource',
        },
        {
          test: /\.raw(\?v=\d+\.\d+\.\d+)?$/,
          use: 'raw-loader',
        },
      ],
    },
    resolve: {
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        util: require.resolve('util/'),
        buffer: require.resolve('buffer/'),
        fs: false,
        http: false,
        https: false,
        stream: false,
      },
    },
  }
)
