import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

/*
 * ============================================================
 * CARE POINT STARTUP CONFIGURATION
 * ============================================================
 *
 * Backend API URL.
 *
 * VITE_API_BASE_URL will be used in production if configured
 * in Vercel Environment Variables.
 *
 * The Render URL below is used as the fallback.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://care-point-y06f.onrender.com/api/v1';

/*
 * ============================================================
 * SLEEP HELPER
 * ============================================================
 *
 * Waits before checking the backend again.
 *
 * We use this when the backend is still starting or temporarily
 * unavailable.
 */
const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/*
 * ============================================================
 * REMOVE INITIAL HTML LOADER
 * ============================================================
 *
 * index.html creates #startup-loader immediately.
 *
 * We remove it ONLY after:
 *
 * 1. Backend responds
 * 2. Backend returns success = true
 * 3. Backend returns status = UP
 * 4. App.tsx has been loaded
 *
 * This prevents the original static loader from remaining
 * behind the React application.
 */
const removeStartupLoader = () => {
  const loader = document.getElementById('startup-loader');

  if (loader) {
    loader.remove();
  }
};

/*
 * ============================================================
 * WAIT FOR BACKEND
 * ============================================================
 *
 * IMPORTANT:
 *
 * This function does NOT have a timeout.
 *
 * Therefore:
 *
 * Backend ready in 2 seconds
 *       → continue after 2 seconds
 *
 * Backend ready in 10 seconds
 *       → continue after 10 seconds
 *
 * Backend ready in 30 seconds
 *       → continue after 30 seconds
 *
 * Backend does not respond
 *       → keep loading and keep checking
 *
 * The actual Care Point application is NOT imported while this
 * function is waiting.
 */
const waitForBackend = async (): Promise<void> => {
  while (true) {
    try {
      /*
       * Call the lightweight backend health endpoint.
       *
       * We intentionally use fetch() instead of the application's
       * Axios instance so authentication/refresh interceptors
       * cannot interfere with the startup check.
       */
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',

        /*
         * Prevent the browser from using an old cached health
         * response.
         */
        cache: 'no-store',

        /*
         * Tell the backend that JSON is expected.
         */
        headers: {
          Accept: 'application/json',
        },
      });

      /*
       * HTTP error = backend is not ready.
       */
      if (!response.ok) {
        throw new Error(
          `Backend returned HTTP ${response.status}`
        );
      }

      /*
       * Convert backend response into JSON.
       */
      const data = await response.json();

      /*
       * Our backend health endpoint should return:
       *
       * {
       *   success: true,
       *   data: {
       *     status: "UP"
       *   }
       * }
       *
       * ONLY when this condition is true do we continue.
       */
      if (
        data?.success === true &&
        data?.data?.status === 'UP'
      ) {
        return;
      }

      /*
       * Backend responded, but it did not report UP.
       */
      throw new Error('Backend is not ready');
    } catch (error) {
      /*
       * Do not show the actual error to the user.
       *
       * The startup screen should simply continue loading.
       *
       * The error is logged only in the browser console for
       * developer debugging.
       */
      console.warn(
        'Care Point backend is not ready yet:',
        error
      );
    }

    /*
     * Wait 1.5 seconds before trying again.
     *
     * This prevents continuous requests to the backend.
     */
    await sleep(1500);
  }
};

/*
 * ============================================================
 * START APPLICATION
 * ============================================================
 *
 * This is the main startup sequence.
 *
 * IMPORTANT:
 *
 * App.tsx is intentionally NOT imported at the top of this file.
 *
 * That means the large application bundle is not requested
 * until the backend health check succeeds.
 */
const startApplication = async () => {
  /*
   * STEP 1
   *
   * Wait until the backend responds with:
   *
   * success = true
   * status  = UP
   */
  await waitForBackend();

  /*
   * STEP 2
   *
   * Backend is now ready.
   *
   * ONLY NOW do we load the actual Care Point application.
   */
  const { default: App } = await import('./App');

  /*
   * STEP 3
   *
   * Remove the static HTML loading screen.
   *
   * At this point the backend is already ready and App is loaded.
   */
  removeStartupLoader();

  /*
   * STEP 4
   *
   * Find the React root container.
   */
  const container = document.getElementById('root');

  if (!container) {
    throw new Error(
      'Care Point React root element was not found.'
    );
  }

  /*
   * STEP 5
   *
   * Create React root and render the complete application.
   */
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

/*
 * ============================================================
 * START CARE POINT
 * ============================================================
 *
 * No App UI is rendered before startApplication() completes
 * the backend health check.
 */
startApplication().catch((error) => {
  /*
   * This should normally never happen because the backend
   * health check retries indefinitely.
   *
   * Keep the error in the console for debugging.
   */
  console.error(
    'Care Point failed to start:',
    error
  );
});
