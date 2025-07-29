@echo off
echo ===================================
echo Building and Copying Applications
echo ===================================

:: Create output directory
set OUTPUT_DIR=dist-all
if not exist %OUTPUT_DIR% mkdir %OUTPUT_DIR%

:: Create apps directory
set APPS_DIR=%OUTPUT_DIR%\apps
if not exist %APPS_DIR% mkdir %APPS_DIR%

:: Build client-web app
echo.
echo Building client-web application...
set VITE_APP_ID=client-web
call npm run build:prod
if %ERRORLEVEL% neq 0 (
  echo Error building client-web application
  exit /b %ERRORLEVEL%
)
if exist dist (
  echo Copying client-web build to %APPS_DIR%\client-web
  if not exist %APPS_DIR%\client-web mkdir %APPS_DIR%\client-web
  xcopy /E /I /Y dist\* %APPS_DIR%\client-web
)

:: Build agency-web app
echo.
echo Building agency-web application...
set VITE_APP_ID=agency-web
call npm run build:prod
if %ERRORLEVEL% neq 0 (
  echo Error building agency-web application
  exit /b %ERRORLEVEL%
)
if exist dist (
  echo Copying agency-web build to %APPS_DIR%\agency-web
  if not exist %APPS_DIR%\agency-web mkdir %APPS_DIR%\agency-web
  xcopy /E /I /Y dist\* %APPS_DIR%\agency-web
)

:: Build admin-web app
echo.
echo Building admin-web application...
set VITE_APP_ID=admin-web
call npm run build:prod
if %ERRORLEVEL% neq 0 (
  echo Error building admin-web application
  exit /b %ERRORLEVEL%
)
if exist dist (
  echo Copying admin-web build to %APPS_DIR%\admin-web
  if not exist %APPS_DIR%\admin-web mkdir %APPS_DIR%\admin-web
  xcopy /E /I /Y dist\* %APPS_DIR%\admin-web
)

:: Build cookie-clicker app
echo.
echo Building cookie-clicker application...
set VITE_APP_ID=cookie-clicker
call npm run build:prod
if %ERRORLEVEL% neq 0 (
  echo Error building cookie-clicker application
  exit /b %ERRORLEVEL%
)
if exist dist (
  echo Copying cookie-clicker build to %APPS_DIR%\cookie-clicker
  if not exist %APPS_DIR%\cookie-clicker mkdir %APPS_DIR%\cookie-clicker
  xcopy /E /I /Y dist\* %APPS_DIR%\cookie-clicker
)

:: Build multi-app viewer
echo.
echo Building multi-app viewer...
set VITE_APP_ID=multi-app
call npm run build:prod
if %ERRORLEVEL% neq 0 (
  echo Error building multi-app viewer
  exit /b %ERRORLEVEL%
)
if exist dist (
  echo Copying multi-app viewer build to %OUTPUT_DIR%
  xcopy /E /I /Y dist\* %OUTPUT_DIR%
)

echo.
echo ===================================
echo All applications built successfully!
echo Output directory: %CD%\%OUTPUT_DIR%
echo ===================================

exit /b 0
