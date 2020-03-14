module.exports = {
  entry: './app/assets/javascripts/index.js',
  output: {
    filename: 'main.js',
    path: __dirname + '/public/javascripts'
  },
  module: {
    rules: [
      {
        test: /[.]jsx?$/,
        include: /app\/assets\/javascripts/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
}
