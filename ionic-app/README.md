# Ionic App

## What does this app do?

This is a cross-platform mobile application built with [Ionic](https://ionicframework.com/) and [Capacitor](https://capacitorjs.com/). The app provides a modern user interface and can be deployed to both web and native mobile platforms (Android and iOS).  
**Note:** Update this section with a more specific description of your app's features and purpose.

---

## How to export this code to an Android application

1. **Install dependencies**  
   Make sure you have Node.js, npm, and Ionic CLI installed.  
   Install project dependencies:

   ```bash
   npm install
   ```

2. **Build the app**  
   Build the web assets for production:

   ```bash
   ionic build
   ```

3. **Add Android platform (if not already added)**

   ```bash
   npx cap add android
   ```

4. **Sync your latest build to the native project**
   ```bash
   npx cap sync android
   ```

---

## How to open the Android project

1. Open Android Studio.
2. Click on **"Open an Existing Project"**.
3. Navigate to the `android/` folder inside this project (`mobile-deploy/ionic-app/android/`).
4. Select the folder and wait for Android Studio to finish syncing and building the project.

---

## Common commands

### Ionic

- **Start the app in the browser (development):**

  ```bash
  ionic serve
  ```

- **Build the app for production:**
  ```bash
  ionic build
  ```

### Capacitor

- **Add Android platform:**

  ```bash
  npx cap add android
  ```

- **Sync web assets to native project:**

  ```bash
  npx cap sync android
  ```

- **Open native Android project in Android Studio:**
  ```bash
  npx cap open android
  ```

### Gradle (from the `android/` directory)

- **Build the Android app:**

  ```bash
  ./gradlew assembleDebug
  ```

- **Install the app on a connected device:**
  ```bash
  ./gradlew installDebug
  ```

> On Windows, use `gradlew.bat` instead of `./gradlew`:
>
> ```cmd
> gradlew.bat assembleDebug
> gradlew.bat installDebug
> ```

---

## Additional Resources

- [Ionic Documentation](https://ionicframework.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Download](https://developer.android.com/studio)
