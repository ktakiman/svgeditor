var webpack = require("webpack");
var path = require("path");
 
var INPUT = path.resolve(__dirname, "src");
var OUTPUT = path.resolve(__dirname, "bin");
 
var config = {
  entry: INPUT + "/main.jsx",    <------- just one input file for now
  output: {
    path: OUTPUT,
    filename: "main.js"        <------- index.html includes this .js file
  },
  module: {
    loaders: [{
        include: INPUT,
        loader: "babel-loader",
    }]
  }
};
 
module.exports = config;
