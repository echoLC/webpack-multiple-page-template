/**
 * Created by echoLC on 2017/9/19.
 */
const glob = require('glob')
const path = require('path')
const webpack = require('webpack')

const HTMLWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const pathResolve = (filepath) => path.resolve(__dirname, filepath)

const entries = getEntries('./src/js/*.js')

module.exports = {
  entry: entries,
  output: {
    path: pathResolve('./dist'),
    filename: "[name].[hash:8].js"
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
      template: `src/view/${entry}.html`,
      inject: true,
      chunks: [entry, 'vendors']
    })),
    new webpack.ProvidePlugin({
      $: 'jquery'
    }),
    // 分离CSS和JS文件
    new ExtractTextPlugin('css/[name].[hash:8].css'),

    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     //supresses warnings, usually from module minification
    //     warnings: false
    //   }
    // }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendors', // 将公共模块提取，生成名为`vendors`的chunk
      chunks: ['index', 'list', 'about'], // 提取哪些模块共有的部分
      minChunks: 1 // 提取至少3个模块共有的部分
    }),
    new webpack.HotModuleReplacementPlugin(),
    // 打开浏览器
    new OpenBrowserPlugin({
      url: 'http://localhost:8080'
    }),
  ],
  devServer: {
    contentBase: './',
    host: '0.0.0.0',
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

function deepClone(source){
  if(!source || typeof source !== 'object'){
    throw new Error('error arguments', 'shallowClone');
  }
  var targetObj = source.constructor === Array ? [] : {vendor: ['jquery']};
  for(var keys in source){
    if(source.hasOwnProperty(keys)){
      if(source[keys] && typeof source[keys] === 'object'){
        targetObj[keys] = source[keys].constructor === Array ? [] : {};
        targetObj[keys] = deepClone(source[keys]);
      }else{
        targetObj[keys] = source[keys];
      }
    }
  }
  return targetObj;
}
