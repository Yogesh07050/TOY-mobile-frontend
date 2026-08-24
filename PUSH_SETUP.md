# Finishing push notification setup

The app-side work is done. Two steps remain that need accounts, so they have to
be run by a person rather than automated.

## What is already in place

- `expo-notifications` and `expo-dev-client` installed and version-matched to
  SDK 57.
- `app.json`: `scheme: offersapp`, `POST_NOTIFICATIONS` for Android 13+, the
  notifications plugin pinned to the `default` channel the backend sends to,
  and `com.toy.offersapp` as both the iOS bundle id and the Android package.
- `eas.json` with `development`, `preview` and `production` profiles.
- Device registration, permission priming, tap handling and deep linking, all
  wired and degrading safely while push is unavailable.

The one missing value is `expo.extra.eas.projectId`. `getExpoPushTokenAsync`
needs it in SDK 57, so until it exists `registerDevice()` logs a warning and
returns null. Nothing crashes, and the in-app notification centre works
regardless — the backend records every notification whether or not it can be
delivered to a device.

## Step 1 — create the EAS project

```bash
npx eas-cli@latest login
```

```bash
npx eas-cli@latest init
```

`init` registers the project with Expo and writes `extra.eas.projectId` and
`owner` into `app.json`. Commit that change — it is the line that unblocks
token registration.

## Step 2 — Android credentials (free)

Do Android first. It costs nothing and proves the whole pipeline.

1. Create a Firebase project and add an **Android** app to it with the package
   name `com.toy.offersapp`.
2. In Firebase, open **Project settings → Service accounts** and generate a new
   private key. This downloads a JSON file.
3. Upload it to Expo:

   ```bash
   npx eas-cli@latest credentials
   ```

   Choose Android → the production/development profile → *Google Service
   Account Key for FCM V1*, and point it at the JSON you downloaded.

Keep that JSON out of the repository. `.gitignore` already excludes `*.p8`,
`*.p12`, `*.jks` and `*.key`, but a Firebase service-account key is a plain
`.json` and is not covered by name.

## Step 3 — build and install a development build

Remote push does not work in Expo Go on Android from SDK 53 onward, so a
development build is required.

```bash
npm run build:dev:android
```

Install the resulting APK on a physical device, then start the bundler against
it:

```bash
npm run start:dev
```

`npm start` still targets Expo Go and will not receive push.

## iOS

iOS needs a **paid Apple Developer account** to generate APNs credentials —
that is an Apple requirement, not an Expo one. Once enrolled:

```bash
npm run build:dev:ios
```

EAS offers to create the Apple Push Notifications key during the first iOS
build. The iOS Simulator cannot receive remote push at all; a physical device
is required.

## Verifying it end to end

With a development build installed and signed in:

1. Sign in, then confirm the device registered:
   `GET /api/notifications/devices` should return one row with
   `transport: "expo"` and `isActive: true`.
2. Claim any offer. The backend sends `OFFER_CLAIMED` immediately.
3. The push should arrive, and tapping it should open the offer rather than
   wherever the app was last.
4. `GET /api/notifications` should show that notification with
   `pushState: "sent"`, becoming `"delivered"` within about 15 minutes when the
   `push-receipts` job reconciles the receipt.

If step 1 returns nothing, `projectId` is still missing or permission was never
granted. If step 3 opens the app but not the offer, check that the `scheme` in
`app.json` still matches `MOBILE_APP_SCHEME` in the backend's `.env` — the
backend builds every deep link from that value.
