const { withInfoPlist, AndroidConfig } = require('@expo/config-plugins');

const withBiometrics = (config, { faceIDPermission } = {}) => {
    config = withInfoPlist(config, (config) => {
        config.modResults.NSFaceIDUsageDescription =
            faceIDPermission || "Allow $(PRODUCT_NAME) to use FaceID to authenticate you.";
        return config;
    });

    config = AndroidConfig.Permissions.withPermissions(config, [
        "android.permission.USE_BIOMETRIC",
        "android.permission.USE_FINGERPRINT"
    ]);

    return config;
};

module.exports = withBiometrics;
