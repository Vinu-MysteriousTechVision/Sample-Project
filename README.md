# mobile-sokonokado

## Setup

1. **Clone the repo**

  ```
  $ git clone https://github.com/seven-samurai-partners/mobile-sokonokado.git
  $ cd mobile-sokonokado-master
  ```

2. **Install dependencies** :

  ```
  $ npm install
  ```
3. **Install pod files** :
  ```
  Make sure you have Cocoapods version > 1.0

  $ cd mobile-sokonokado-master/ios
  $ pod install
  ```
  
  
  
  
# React Native Application Building for Production
### iOS

* Open iOS project in Xcode and add team developer account in Xcode preference (Xcode > Preferences > Accounts).
* In the top of the screen, select your production build scheme to release (go to Product > Scheme > Edit Scheme), and Generic iOS Device (or any plugged in iDevice) as build target.
* Clean the project (Product > Clean)
* Archive the project (Product > Archive)
* Open Window > Organizer, choose your build and press Upload to App Store...
* Login to iTunes Connect with your developer account, and under TestFlight tab click Select Version to Test (it might take a while for your new build be be available for testing).
* Wait for Apple to approve your app for testing (Internal Testing apps should be quick, External Testing apps need to go through a lightweight approval process).
* Once app is approved for TestFlight testing, copy the link to your test app and follow the given instructions.

##### Reference: 
* https://facebook.github.io/react-native/docs/running-on-device.html
* http://stackoverflow.com/questions/34933439/how-to-build-react-native-ios-app-get-an-app-file-and-deploy-to-device

### Android
* Create signing key using keytool and add information in gradle files. Follow the instruction in the below [link] for signing key creation
 https://facebook.github.io/react-native/docs/signed-apk-android.html
* Open terminal and move to project folder ($ cd mobile-sokonokado-master)
* Exicute the following command 
    ```
    $ cd android && ./gradlew assembleRelease
    ```
* The generated APK can be found under the location
    ```
    mobile-sokonokado-master/android/app/build/outputs/apk/app-release.apk 
    ```    
* Create Application in Google Play Dveloper Console (https://play.google.com/apps/publish/) by providing Default language and Application Title.
* Enter the all mandatory information (Short description, Full description, Screenshot, etc.) in Store Listing Tab.
* Upload Production APK in APK tab.
* Complete the Content Rating procedure in Content rating tab after APK upload.
* Enter pricing information in PRICING & DISTRIBUTION.
* After entering all information publish application by Publish app button on top right corner.
* To track FCM statistics for the application from the statistics page please Link FCM sender id in Service & APIs tab (This is not mandatory). 

# Setup CodePush(App center)
* Install the App center CLI: 
  ```
  $ cd mobile-sokonokado-master/
  $ npm install -g appcenter-cli
  ```
* Login into your app center account using the command
```$ appcenter login ```
(This will launch a browser, asking you to authenticate with either your GitHub or Microsoft account. This will generate an access key that you need to copy/paste into the CLI (it will prompt you for it). You are now successfully authenticated and can safely close your browser window.)
* We added the deployments (Staging and Production) for the added app. Using the below command we can access the deployment keys details.
```
  $ appcenter codepush deployment list -a townstory/Townstory-iOS
  $ appcenter codepush deployment list -a townstory/Townstory-Android
```
* Release the project in staging deployment use the below commands
```
  $ cd mobile-sokonokado-master/
  $ appcenter codepush release-react -a townstory/Townstory-iOS
  $ appcenter codepush release-react -a townstory/Townstory-Android

Test staging build of iOS add the Staging deployment key in to the Info.plist for the key <CodePushDeploymentKey>.
Test staging build of Android add the Staging deployment key in to the strings.xml for the module configuration name ‘reactNativeCodePush_androidDeploymentKey’
```
* Release the project in Production deployment use the below commands
```
  $ cd mobile-sokonokado-master/
  $ appcenter codepush release-react -a townstory/Townstory-iOS -d Production
  $ appcenter codepush release-react -a townstory/Townstory-Android -d Production
  
Test Production build of iOS add the Production deployment key in to the Info.plist for the key <CodePushDeploymentKey>.
Test Production build of Android add the Production deployment key in to the strings.xml for the module configuration name ‘reactNativeCodePush_androidDeploymentKey’
```

* Rollback to the previous commit in staging we can use the following commands
```
  $ cd mobile-sokonokado-master/
  $ appcenter codepush rollback -a townstory/Townstory-iOS Staging
  $ appcenter codepush rollback -a townstory/Townstory-Android Staging
```
* Rollback to the previous commit in production we can use the following commands
```
  $ cd mobile-sokonokado-master/
  $ appcenter codepush rollback -a townstory/Townstory-iOS Production
  $ appcenter codepush rollback -a townstory/Townstory-Android Production
```
##### Reference:
* https://docs.microsoft.com/en-us/appcenter/distribution/codepush/cli


[link]: <https://facebook.github.io/react-native/docs/signed-apk-android.html>



