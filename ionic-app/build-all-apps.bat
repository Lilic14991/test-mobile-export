@echo off
echo ===================================================
echo Building All Applications
echo ===================================================

echo.
echo Step 1: Cleaning up previous build artifacts...
if exist "dist" (
    rmdir /S /Q "dist"
    echo Removed previous dist directory
)

echo.
echo Step 2: Building main Ionic app...
call npm run build 

echo.
echo Step 3: Building client-web app...
call npm run build -- --mode production --env VITE_APP_ID=client-web --skipTests

echo.
echo Step 4: Building pump-clicker app...
call npm run build -- --mode production --env VITE_APP_ID=pump-clicker --skipTests

echo.
echo Step 5: Creating apps directory structure in dist...
if not exist "dist\apps" (
    mkdir "dist\apps"
    echo Created apps directory
)

echo.
echo Step 6: Copying client-web app to dist/apps...
if not exist "dist\apps\client-web" (
    mkdir "dist\apps\client-web"
)
xcopy /E /I /Y "dist\*" "dist\apps\client-web\"
echo Copied client-web app to dist/apps/client-web

echo.
echo Step 7: Copying pump-clicker app to dist/apps...
if not exist "dist\apps\pump-clicker" (
    mkdir "dist\apps\pump-clicker"
)
xcopy /E /I /Y "dist\*" "dist\apps\pump-clicker\"
echo Copied pump-clicker app to dist/apps/pump-clicker

echo.
echo Step 8: Syncing Capacitor...
call npx cap sync android

echo.
echo Build completed!
echo.
echo To build the APK, run:
echo cd android
echo gradlew assembleDebug
echo.
echo Or open Android Studio:
echo npx cap open android
echo ===================================================
