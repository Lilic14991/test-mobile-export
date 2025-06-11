# Mobile Deploy
Export web-app to mobile android and ios

## DynamicIframe Component Testing

This repository includes a test environment for the DynamicIframe component, which is used to display web content in an iframe with navigation capabilities.

### Setup and Testing

1. Install dependencies for both the test iframe app and the Ionic app:
   ```
   cd test-iframe-app
   npm run install-deps
   cd ../ionic-app
   npm install
   ```

2. Start the test and ionic applications

   inside test-iframe-app
   ```
   npm run start
   ```

   inside ionic-app
   ```
   npm run dev
   ```
   
   This will start:
   - The test iframe server on port 3001
   - The Ionic app on port 5173

3. Open the Ionic app in a browser at http://localhost:5173 and navigate to the "Iframe Test" tab.

4. Test the DynamicIframe component by navigating between pages in the iframe and using the back button.

### Test Environment Components

- **test-iframe-app**: A simple HTML application with multiple pages that can be loaded in an iframe, and a server that serves these pages with proper CORS headers.
- **ionic-app/src/components/DynamicIframe.tsx**: The DynamicIframe component that maintains a navigation stack and provides a goBack method.
- **ionic-app/src/pages/IframeTest.tsx**: A test page that uses the DynamicIframe component to load the test iframe app.

For more detailed instructions, see the README.md in the test-iframe-app directory.
