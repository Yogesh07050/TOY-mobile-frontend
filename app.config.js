/**
 * Wraps app.json so the Google Maps key can come from the environment.
 *
 * `react-native-maps` needs an Android API key at the native level; without it
 * `MapView` cannot be constructed and Android throws
 * "API key not found ... com.google.android.geo.API_KEY", which surfaces as an
 * `addViewAt` mounting failure that names neither maps nor the key.
 *
 * The key is injected here rather than written into app.json because this
 * repository is public. An Android Maps key ships inside the APK and is
 * therefore extractable either way - the protection that matters is
 * restricting it to this package name and signing certificate in Google Cloud -
 * but a key committed to a public repo gets scraped and billed against long
 * before anyone installs the app.
 *
 * Local development reads it from .env (gitignored). EAS builds read it from an
 * EAS secret of the same name.
 */
module.exports = ({ config }) => {
  const androidGoogleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  if (!androidGoogleMapsApiKey) {
    console.warn(
      '[maps] GOOGLE_MAPS_ANDROID_API_KEY is not set — the Near Me map will fall back to a list on Android.',
    );
  }

  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      ...(androidGoogleMapsApiKey ? [['react-native-maps', { androidGoogleMapsApiKey }]] : []),
    ],
    extra: {
      ...config.extra,
      // Read at runtime so the screen can choose the list instead of mounting a
      // MapView that would crash the moment it is attached.
      googleMapsConfigured: Boolean(androidGoogleMapsApiKey),
    },
  };
};
