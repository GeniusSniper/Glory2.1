const { merge } = require("webpack-merge");
const commonConfiguration = require("./webpack.common.js");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(commonConfiguration, {
  mode: "production",
  plugins: [new MiniCssExtractPlugin()],
  devtool: "source-map",
});
