# Test Iframe App

This is a test application for the DynamicIframe component. It consists of a simple HTML application with multiple pages that can be loaded in an iframe, and a server that serves these pages with proper CORS headers.

## Setup

1. Install dependencies:
   ```
   cd test-mobile-export/test-iframe-app
   npm run install-deps
   ```

2. Start the test server:
   ```
   npm start
   ```
   This will start a server on port 3001 that serves the HTML files with proper CORS headers.

3. In another terminal, start the Ionic app:
   ```
   cd test-mobile-export/ionic-app
   npm start
   ```
   This will start the Ionic app on port 3000.

4. Open the Ionic app in a browser at http://localhost:3000 and navigate to the "Iframe Test" tab.

## Testing the DynamicIframe Component

The test application includes several pages that you can navigate between:

- Home page: The main page of the test application
- Page 1: A simple page with a button to navigate to Page 2
- Page 2: A page with buttons to navigate to Page 1 and Page 3
- Page 3: A page with a form that you can submit

You can test the following functionality:

1. **Navigation**: Click on the links in the navigation bar or the buttons on each page to navigate between pages. The DynamicIframe component should maintain a navigation stack and update the iframe's src attribute.

2. **Back Button**: Click the back button in the Ionic app's header to navigate back to the previous page in the iframe. This tests the `goBack` method of the DynamicIframe component.

3. **Form Submission**: Fill out and submit the form on Page 3. This tests that the iframe can handle form submissions and that the DynamicIframe component correctly updates the navigation stack.

4. **Console Logs**: Open the browser's developer console to see detailed logs from both the DynamicIframe component and the iframe content. These logs can help debug any issues.

## Troubleshooting

If you encounter any issues:

1. Make sure both servers are running (the test server on port 3001 and the Ionic app on port 3000).
2. Check the browser's developer console for any error messages.
3. Verify that the iframe's src attribute is correctly set to http://localhost:3001/index.html.
4. Ensure that the CORS headers are being properly set by the test server.
