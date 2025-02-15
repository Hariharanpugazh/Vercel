module.exports = function override(config) {
  config.module.rules.push({
    test: /\.js$/,
    enforce: 'pre',
    use: ['source-map-loader'],
    exclude: [
      /node_modules\/face-api.js/,
      /node_modules\/react/,
      /node_modules\/react-dom/,
      /node_modules\/@mui/, // Exclude all MUI-related source maps
      /node_modules\/react-is/, // Exclude react-is
      /node_modules\/@react-aria/ // Exclude react-aria
    ], // Exclude problematic modules
  });

  config.ignoreWarnings = [
    /Failed to parse source map/, // General source map warnings
    /extractParams/, // Suppress specific face-api.js warnings
    /extractParamsFromWeigthMap/, // Additional specific face-api.js warnings
    /Mtcnn/, // Warnings related to MTCNN
    /TinyYolov2/, // Warnings related to TinyYoloV2
  ]; // Suppress source map warnings

  return config;
};
