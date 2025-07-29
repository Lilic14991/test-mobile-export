@echo off
echo ===================================
echo Building All Applications
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
call npm run build:web:client-web
if %ERRORLEVEL% neq 0 (
  echo Error building client-web application
  exit /b %ERRORLEVEL%
)
if exist dist-client-web (
  echo Copying client-web build to %APPS_DIR%\client-web
  if not exist %APPS_DIR%\client-web mkdir %APPS_DIR%\client-web
  xcopy /E /I /Y dist-client-web\* %APPS_DIR%\client-web
)

:: Build agency-web app
echo.
echo Building agency-web application...
call npm run build:web:agency-web
if %ERRORLEVEL% neq 0 (
  echo Error building agency-web application
  exit /b %ERRORLEVEL%
)
if exist dist-agency-web (
  echo Copying agency-web build to %APPS_DIR%\agency-web
  if not exist %APPS_DIR%\agency-web mkdir %APPS_DIR%\agency-web
  xcopy /E /I /Y dist-agency-web\* %APPS_DIR%\agency-web
)

:: Build admin-web app
echo.
echo Building admin-web application...
call npm run build:web:admin-web
if %ERRORLEVEL% neq 0 (
  echo Error building admin-web application
  exit /b %ERRORLEVEL%
)
if exist dist-admin-web (
  echo Copying admin-web build to %APPS_DIR%\admin-web
  if not exist %APPS_DIR%\admin-web mkdir %APPS_DIR%\admin-web
  xcopy /E /I /Y dist-admin-web\* %APPS_DIR%\admin-web
)

:: Build cookie-clicker app
echo.
echo Building cookie-clicker application...
call npm run build:web:cookie-clicker
if %ERRORLEVEL% neq 0 (
  echo Error building cookie-clicker application
  exit /b %ERRORLEVEL%
)
if exist dist-cookie-clicker (
  echo Copying cookie-clicker build to %APPS_DIR%\cookie-clicker
  if not exist %APPS_DIR%\cookie-clicker mkdir %APPS_DIR%\cookie-clicker
  xcopy /E /I /Y dist-cookie-clicker\* %APPS_DIR%\cookie-clicker
)

:: Build multi-app viewer
echo.
echo Building multi-app viewer...
call npm run build:web:multi-app
if %ERRORLEVEL% neq 0 (
  echo Error building multi-app viewer
  exit /b %ERRORLEVEL%
)
if exist dist-multi-app (
  echo Copying multi-app viewer build to %OUTPUT_DIR%
  xcopy /E /I /Y dist-multi-app\* %OUTPUT_DIR%
)

echo.
echo ===================================
echo All applications built successfully!
echo Output directory: %CD%\%OUTPUT_DIR%
echo ===================================

exit /b 0
