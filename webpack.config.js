const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        loader: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({   //html编译插件
      template: path.resolve(__dirname, "./public/index.html"), 
      // scriptLoading: "blocking"
    }),
  ],
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  devServer:{
    //配置服务端口号
    port:8090,
    // 打开热更新开关
    hot: true,  
    //服务器的IP地址，可以使用IP也可以使用localhost
    host:'localhost',
    //服务端压缩是否开启
    compress:true,
  }
}