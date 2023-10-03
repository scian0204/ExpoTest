const { withAndroidManifest } = require('expo/config-plugins');

function addAttributesToApplication(androidManifest, attributes) {
  const { manifest } = androidManifest;

  if (!Array.isArray(manifest['application'])) {
    return androidManifest;
  }

  const application = manifest['application'].find(
    (item) => item.$['android:name'] === '.MainApplication'
  );

  console.log(manifest);
  console.log(application);

  if (!application) {
    return androidManifest;
  }

  application.$ = { ...application.$, ...attributes };

  return androidManifest;
}

module.exports = function withAndroidApplicationAttributes(config, attributes) {
  return withAndroidManifest(config, (config) => {
    config.modResults = addAttributesToApplication(
      config.modResults,
      attributes
    );
    return config;
  });
};
