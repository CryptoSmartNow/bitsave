const withTM = require('next-transpile-modules')(['rc-util', 'antd', '@ant-design/icons']);

module.exports = withTM({
  reactStrictMode: true,
  webpack: (config) => {
    // Additional custom webpack configurations if needed
    return config;
  },
});
