import type { PlaywrightTestConfig, ReporterDescription } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */

/*
Tests in 'multidevice' will be appropriate for both mobile & desktop regression, and will be executed against both device types.
If there are behaviour differences between mobile & desktop tests, these should be in the respective dir, 
e.g. a navigation test for mobile may need to interact with the 'hamburger icon' to see the navigation options; 
this would require seperate desktop & mobile tests. They can however continue to share the same page objects - it is only the spec files
that are seperated as such.
*/
const MULTI_DEVICE_TESTS = '/**/multidevice/**/*.spec.ts';
const DESKTOP_ONLY_TESTS = '/**/desktop/**/*.spec.ts';
const MOBILE_ONLY_TESTS = '/**/mobile/**/*.spec.ts';
const ACCESSIBILITY_TESTS = '/**/accessibility/**/*.spec.ts';
const API_TESTS = '/**/api/**/*.spec.ts';

const DESKTOP_VIEWPORT = { width: 1920, height: 1080 }; //Define a desktop resolution - mobile can be configured similarly, or by using 'Devices'.

//This 3rd party reporter has the advantage of providing the trace-view embedded into the report, removing need to download it sperately
const localReportConfig: ReporterDescription[] = [
  ['html'], //Provides a human-readable report after test completion
  ['list'], //Provides stdout feedback at runtime
];

const ciReportConfig: ReporterDescription[] = [
  ['html'], // Provides a human-readable report after test completion
  ['json'], //Provides a machine-readable report after test completion
  ['list'], //Provides stdout feedback at runtime
  ['blob'], //Provides a blob-report per test shard to aggregate into a single report in CI
];

export const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI, //Fail the build on CI if you accidentally left test.only in the source code. Should be detected by eslint prior to this.
  fullyParallel: true, // Executes all tests within each spec file in parallel instead of running each spec file concurrently while tests within them execute sequentially. Ensure the tests are properly isolated to prevent issues due to shared state or interference.
  //Retry config to allow for a different set up on CI vs local. Note: think about how long retries would add to the test run when defining this.
  retries: process.env.CI ? 1 : 0,
  globalSetup: require.resolve('./src/hooks/global-setup'), //Consider this a beforeAll hook before any test specs are executed - useful for health checks, data set up etc.
  globalTeardown: require.resolve('./src/hooks/global-teardown'), //An afterAll script executed after testing has finished - useful for teardowns etc.
  projects: [
    //Project-related setup (i.e saving authenticated user states)
    { name: 'setup', testMatch: /auth.setup.ts/ },

    /* Desktop Browser Configuration - Not all browsers should be required for all test runs! */
    {
      name: 'chromium',
      testMatch: [DESKTOP_ONLY_TESTS, MULTI_DEVICE_TESTS], //E.g. any tests in these dirs will be run against 'chromium'
      use: {
        ...devices['Desktop Chrome'],
        // Playwright will default to the 'latest' channel if not specified, ahead of the 'stable' channel users may wish to use. See: https://playwright.dev/docs/browsers
        channel: 'chrome',
        viewport: DESKTOP_VIEWPORT,
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write'],
        },
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testMatch: [DESKTOP_ONLY_TESTS, MULTI_DEVICE_TESTS],
      use: {
        ...devices['Desktop Firefox'],
        viewport: DESKTOP_VIEWPORT,
      },
      dependencies: ['setup'],
    },
    {
      name: 'edge',
      testMatch: [DESKTOP_ONLY_TESTS, MULTI_DEVICE_TESTS],
      use: {
        ...devices['Desktop Edge'],
        // Playwright will default to the 'latest' channel if not specified, ahead of the 'stable' channel users may wish to use. See: https://playwright.dev/docs/browsers
        channel: 'msedge',
        viewport: DESKTOP_VIEWPORT,
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write'],
        },
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testMatch: [DESKTOP_ONLY_TESTS, MULTI_DEVICE_TESTS],
      use: {
        ...devices['Desktop Safari'],
        viewport: DESKTOP_VIEWPORT,
      },
      dependencies: ['setup'],
    },
    /* Mobile Browser Configuration */
    {
      name: 'Mobile Safari',
      testMatch: [MOBILE_ONLY_TESTS, MULTI_DEVICE_TESTS],
      use: {
        ...devices['iPhone 12'],
        isMobile: true,
      },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Chrome',
      testMatch: [MOBILE_ONLY_TESTS, MULTI_DEVICE_TESTS],
      use: {
        ...devices['Galaxy S9+'],
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write'],
          isMobile: true,
        },
      },
      dependencies: ['setup'],
    },
    /* Accessibility tests */
    {
      name: 'chromium',
      testMatch: [ACCESSIBILITY_TESTS],
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write'],
        },
      },
      dependencies: ['setup'],
    },
    /* API tests */
    {
      name: 'api',
      testMatch: [API_TESTS],
    },
  ],
  testDir: './src/tests',
  timeout: 60 * 1000 /* Upper limit of any individual test duration (in ms). */,
  /* Default configuration for tests unless overwritten per-describe or per test. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    navigationTimeout: 5000, //Timeout for navigation i.e. page.goto - defaults to no timeout which is strongly discouraged
    actionTimeout: 3000, //Maximum time each action such as `click()` can take.- defaults to no timeout which is strongly discouraged
    trace: 'retain-on-first-failure', // trace is recorded for the first failure of each test, but not for retries. Trace view is more helpful & than screenshots/videos. Disable for API tests.
  },
  workers: process.env.CI ? 5 : 3, //Parallel test run config. Note that CI should ideally be utilising powerful runners and allow for more workers than local machines.
  reporter: process.env.CI ? ciReportConfig : localReportConfig,
};

export default config;
