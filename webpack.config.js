var webpack = require("webpack");
var path = require("path");
 
var INPUT = path.resolve(__dirname, "src");
var OUTPUT = path.resolve(__dirname, "bin");
 
var config = {
  entry: INPUT + "/main.jsx",    
  output: {
    path: OUTPUT,
    filename: "script/main.js"        
  },
  module: {
    loaders: [{
        include: INPUT,
        loader: "babel-loader",
    }]
  }
};
 
module.exports = config;
