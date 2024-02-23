module.exports = {
    env: {
        RAZORPAY_KEY_ID: 'rzp_test_MWnJ2Y94xOM226',
    },
    webpack: (config) => {
        config.watchOptions.poll = 300;
        return config;
    }
};