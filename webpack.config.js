module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js"
  },
  devServer: {
    contentBase: "./public",
    compress: true,
    hot: true,
    host: "localhost",
    port: 3000,
    publicPath: "/"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ loader: "ts-loader" }]
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
          }
        ]
      },
      {
        test:/\.css$/,
        use:['style-loader','css-loader']
      }
    ]
  }
};
