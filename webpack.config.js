/**
 * Created by echoLC on 2017/9/19.
 */
const glob = require('glob')
const path = require('path')

const HTMLWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const pathResolve = (path) => path.resolve(__dirname, path)

const entries = getEntries('./page/*.js')

module.exports = {
  entry: entries,
  output: {
    path: pathResolve('./dist'),
    filename: "[name].[chunkhash].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {loader: "css-loader"},
            {loader: "sass-loader"},
            {
              loader: "postcss-loader",
              options: {
                plugins: ()=>[require('autoprefixer')]
              }

            }
          ]
        })
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract(
          {
            fallback: 'style-loader',
            use: [
              {loader: "css-loader"},
              {
                loader: "postcss-loader",
                options: {
                  plugins: ()=>[require('autoprefixer')]
                }

              }
            ]
          })
      },
      {
        test: /\.(jpg|jpeg|png|svg|gif)$/,
        use:[
          {
            loader: "url-loader",
            options: {
              name: 'img/[name].[hash:8].[ext]',
              limit: 8192
            }
          }
        ]
      },
      {
        test:/\.(woff|woff2|svg|ttf|eot)($|\?)/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
              name: 'fonts/[name].[hash:8].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // 根据入口文件对象，生成对HTMLWebpackPlugin插件的调用
    ...Object.keys(entries).map((entry) => new HTMLWebpackPlugin({
      filename: `${entry}.html`,
      template: `templates/${entry}.html`,
      inject: true,
      chunks: [entry]
    })),
    new webpack.ProvidePlugin({
      $: 'jquery'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        //supresses warnings, usually from module minification
        warnings: false
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendors', // 将公共模块提取，生成名为`vendors`的chunk
      chunks: ['index'], // 提取哪些模块共有的部分
      minChunks: 1 // 提取至少3个模块共有的部分
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: './',
    host: '0.0.0.0',
    port: 3000,
    inline: true,
    hot: true
  }
}

// 根据指定的路径glob，生成入口文件对象
function getEntries(pathGlob) {
  const files = glob.sync(pathGlob);

  return files.reduce((acc, file) => {
    const extname = path.extname(file);
    const basename = path.basename(file, extname);

    acc[basename] = `./${file}`;

    return acc;
  }, {});
}
