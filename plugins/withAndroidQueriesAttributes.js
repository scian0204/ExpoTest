const { withAndroidManifest } = require('expo/config-plugins');

const withAndroidQueries = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.queries = [{ package: [] }];
    manifest.queries[0]['package'].push({
      $: {
        'android:name': 'com.kakao.talk',
      },
    });
    console.log(manifest.queries);

    return config;
  });
};

module.exports = withAndroidQueries;
