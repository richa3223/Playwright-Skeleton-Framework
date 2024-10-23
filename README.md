# Playwright Test Framework Skeleton

This framework encompasses end-to-end (E2E), UI, Accessibility, and API tests utilizing the Node.js flavour of Playwright with TypeScript.
If you are new to Playwright, please familiarise yourself with the [Playwright best-practises](https://playwright.dev/docs/best-practices) before getting started with this framework.

The example tests provided in this skeleton exist to demonstrate good practice and useful Playwright functionality. To demonstrate this, the example tests have been scripted against third party websites that are neither controlled nor maintained by BJSS and may change at any time. For this, please only consider the existing test scenarios as carefully considered approach & structure guidelines when implementing this framework.

## Prerequisites

### Required

- **npm:** Package manager for JavaScript ([install information](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))

### Recommended

- **Visual Studio Code:** Recommended IDE as this has recommended extensions and settings within `.vscode`
- **Docker Desktop:** Placeholder guide for Docker setup (based on client project).

## Getting Started

From within the `Playwright-Skeleton-Framework` directory:

- Run `npm i` to install all necessary dependencies.
- Run `npx playwright install --with-deps` to ensure that the latest Playwright version is used & new browser binaries & their dependencies are updated.
- Ensure that your service/application under test is ready and healthy
- Run `docker-compose up -d` to support tests utilising mocking or request/response proxying via wiremock.

  - If you would prefer not to run wiremock tests, update `config/envConfig.json` with `test.wiremock.enabled` to `false`.

- Execute `npx playwright test` to run all tests locally.
  - N.b. There are 2 API tests that are expected to fail as the status codes returned are incorrect!
    - `Should return 204 when DELETEing a booking`
    - `Should return 201 when creating a new booking`

## Additional Information

### Config

- Within the framework there are two sources of config.

1. Playwright Config: `playwright.config.ts`. This is for modifying Playwright-specific settings.
2. Test Framework Config: This is for test framework behaviour, such as user credentials, accessibility tags, the use of wiremock, which may vary between environments.
   - The `CONFIG` object is defined and exported from `/config/configManager.ts`. Within this file, some environment variables passed in by CI may override some config values (e.g. the Test Run Identifier (TRI)).
   - `envConfig.json` and `baseConfig.json` are merged to produce the CONFIG object.
     - `baseConfig.json` represents the 'default' config used, but can be overwritten in `envConfig.json`. This allows for common config
     - `envConfig.json` represents the environment-specific configuration. On your local development machine, `envConfig.json` represents your local config.
     - In other environments, CI must replace `envConfig.json` to config appropriate for that environment. E.g, in a UAT environment, you may have a `uatConfig.json`, which needs to replace the existing `envConfig.json` prior to test execution, so that the suite uses the appropriate UAT config.

### Filtering Tests

- Playwright supports the grep command (`--grep` or `-g`) to filter for specific tests, this can match the test title but in practice the test tag is usually used.

  - Use `npx playwright test -g @ui` to filter for tests tagged with `@ui`.
  - To limit or specify the target browser, use `npx playwright test -g @<tag> --project <project>`; example projects can be found in playwright.config.ts.
  - To run multiple test tags, split the grep with a pipe, e.g. `-g @<tag1>|<tag2>`

- To re-run tests that failed the previous execution, add the `--last-failed` flag.

- It may be useful to add the `--ui` flag to support test filtering & debugging via [Playwrights UI mode](https://playwright.dev/docs/test-ui-mode)
- More information on test filtering can be found [here](https://playwright.dev/docs/running-tests)

- Customize the report style with the `--reporter` flag. For available options, refer to [here](https://playwright.dev/docs/test-reporters).

### Framework Structure

- Actual projects will have more tests that this sample so the file breakdown isn't extensive
  - API specific breakdown: Ideally you would break down the files by endpoint, then request type, then happy/unhappy making sure the files are easy to read and not too long
  - Anything over ~400 lines becomes hard to follow so thats a good guide to use

```Playwright-Skeleton-Framework
├── config // Environment config
├── node_modules
├── playwright-report // The location Playwright stores test reports
├── src // Contains tests & test code
│   ├── data
│   │   ├── builders
│   │   └── models // Define your common objects and data structures here
│   ├── fixtures // Extension to Playwrights functionality
│   ├── hooks // Test hooks - e.g. global-setup & teardown
│   ├── page-objects // Page objects for UI tests
│   │   ├── components
│   │   └── pages
│   ├── tests
│   │   ├── api
│   │   └── ui
│   │       ├── accessibility
│   │       ├── e2e
│   │       │   ├── desktop
│   │       │   ├── mobile
│   │       │   └── multidevice // Tests that are expected to follow the same UI interactions between desktop & mobile
│   │       └── functional-integration
│   │           ├── desktop
│   │           ├── mobile
│   │           └── multidevice
│   ├── utils // helper methods for the test code
│   │   ├── api
│   │   └── ui
│   └── wiremock // mocking client & mock utilities
└── test-results // Raw data for Playwright reports
```

#### UI Pre-Test Authentication

- Playwright supports loading into existing authenticated states via browser contexts. In the skeleton example, this is configured here: `src/tests/auth.setup.ts`
- The skeleton utilises two of the supported implementations for pre-test authentication. In a real-world project, only one of these solutions should be required depending on the front-end applications state management solution:
  - Playwright's native [Browser Context](https://playwright.dev/docs/browser-contexts), storing states in `.auth/browser-context`.
  - session-storage, stored `.auth/session-storage` with the helper functions located in `src/utils/ui/session-storage-utils.ts`.
- While examples provided in the above focus on pre-test authentication for UI tests (both integration and e2e), this approach can prove useful with API tests - limiting the rate of authentication to once or several times per execution cycle, rather than per test. However, the implementation would need to be directly via the API service to obtain the auth token (if available from the endpoint) which we haven't included due to not being required by the example services under test.
- For more on authentication in playwright, see [here](https://playwright.dev/docs/auth).

### BrowserStack SDK Usage

From within the `Playwright-Skeleton-Framework` directory:

- Run `npm i` to install all necessary dependencies.
- Set your Browserstack username & access keys:

```zsh
export BROWSERSTACK_USERNAME="YOUR_USERNAME"
export BROWSERSTACK_ACCESS_KEY="YOUR_ACCESS_KEY"
```

Nb. these will need to be re-exported should your terminal refresh (e.g. a laptop restart).

- Ensure your browserstack-node-sdk is up to date with `npm update browserstack-node-sdk`.
- Configure `browserstack.yml`. There is an existing example in the root directory for you to consider. If you wish to update the settings, for example to point at different OS/Browser combos, consider referencing [here](https://www.browserstack.com/docs/automate/selenium/sdk-config-generator)
  - Unfortunately at this time, the config from `playwright.config.ts` cannot be injected directly into the Browserstack config. Please see [here](https://www.browserstack.com/docs/automate/playwright/dependencies-teardown) for how to convert config to the Browerstack format.
  - Supported browsers can be found [here](https://www.browserstack.com/list-of-browsers-and-platforms/playwright)
- Run `npx browserstack-node-sdk playwright test` to run all tests.
  - You can filter this further with the usual `-g @tag` commands.
  - To reuse config you can append `--config=playwright.config.ts`. You may want to shorthand this with a script in `package.json`, (see `browserstack`) which can be executed with `npm run browserstack`.
  - N.b.: This will create a `browserstackSetupConfig.json` file with your access key & password in. These are omitted in the gitignore file and should be torn down when exiting the , but please do not keep these stored on your machine! They should be deleted as part of cleardown of the `browserstack-node-sdk` script when you ctrl+c (windows) or cmd+c (mac), but just be wary!
  - Exiting the shell may take a while as the Playwright report server is torn down, browserstack files are deleted, and finally the binary is exited.
- Test results can be observed at Browserstack Observability dashboard logged at the end of execution. Unfortunately the native trace view is not supported when executing tests via browserstack.

### Secrets

Please DO NOT put secrets into any of the config.json files, you do not want hardcoded secrets pushed up to your code repository! For a rudimentary solution, consider exporting environment variables with export ENV_VAR=value, and consuming these with process.env.ENV_VAR in the code. Best Practice would be to use a secrets management solution instead.

### Logging

- Logging across the framework utilises `src/log-config.ts`, and the use of `logger.info('message')` across tests. This allows for the formatting of all logs to be updated or changed per client requirements in a single file, rather than having to reformat each individual log.

### Docker

- Before proceeding with Docker setup for tests, it's essential to check with the project whether a separate Docker setup is required. Some projects may not need certain Docker files for testing purposes.
  - For further details on Docker setup and configurations, please refer to the project's wiki page.
- Ensure base Docker image version corresponds to Playwright version
- To build: `docker build . -t <container-id>` (the `container id` can be any name of your choosing).
  - If you're using GitHub packages, you may need to point towards your local credentials with `docker build . --secret id=npmrc,src=$HOME/.npmrc`
- To run: `docker run <container-id>`
- You may also use docker-compose to run all containers defined in the `docker-compose.yaml` with `docker-compose up -d`.

### Wiremock

- Wiremock is included as part of this skeleton, for usage both as a proxy and as a mocking service.
- Wiremock behaviour is disabled by default. To modify this, set `test.wiremock.enabled` to `true`.
  - Stubmappings created by the automation framework will automatically be deleted from the wiremock server after each test by their unique metadata testId. If this is not desired (e.g for debugging), set `test.wiremock.autoTearDownMappings` to `false`. Note that this is only supported with Wiremock mappings created via the Stubmapping Builder, prexisting or manually created stubmappings will not be removed by the test framework.
- To update the wiremock hostname/port, update `test.wiremock.baseUrl`.

#### Wiremock as a container

- To run a wiremock instance on port `8888` for the purposes of the example tests (you must have Docker installed):

```sh
docker run -it --rm -p 8888:8080 --name wiremock \
  wiremock/wiremock:3.5.4 --verbose
```

- Alternatively, you can run via docker-compose with `docker-compose up -d`.

#### StubMapping Builder & Wiremock Client

- To support creation of wiremocks, consider usage of the StubmappingBuilder at `src/wiremock/stubmapping-builder.ts`. Example usage: `src/tests/api/wiremock-proxy-example.spec.ts`.
- The builder will append the Test Run Identifier (TRI), unique testId from the Playwright TestInfo object, and the source (i.e. this framework) to each stubmappings metadata object. **Do not modify this behaviour**, as automated cleardowns are dependant on this metadata.
- The wiremock client at `src/wiremock/wiremock-client.ts` provides an ease-of-use wrapper around the [wiremock-rest-client](https://www.npmjs.com/package/wiremock-rest-client), as well as providing additional functionality such as error handling.

#### Under the hood

- If using wiremock and `test.wiremock.autoTearDownMappings` is `true`:

  - The `autoTearDownMappings` in `src/fixtures/base-fixtures.ts` will ensure each test removes any StubmappingBuilder-created mappings after each test.
  - Code in `global-teardown.ts` will delete all of the request monitoring history from wiremock.
  - To ensure that mocks created by the automation framework are injected & torn down appropriately, `global-setup.ts` will save the number of preexisting mocks to `WIREMOCK_STUBMAPPING_COUNT`.
  - If mocks have not been managed appropriately `global-teardown.ts` will flag that the number of stubmappings at the end state of test execution does not match that of the starting state. Mocking errors such as these should be investigated as a priority, as they compromise test integrity.

- If using wiremock and `test.wiremock.autoTearDownMappings` is `false`:
  - Stubmappings and request tracing won't be torn down following each test, and must be removed by manual requests to wiremock.

#### Stubmappings

- An example StubMapping could look like this:

```json
{
  "request": {
    "method": "GET",
    "urlPath": "/customers"
  },
  "headers": {
          "x-request-id": {
            "equalTo": `${testInfo.testId}`, // This is to be provided by the test using Playwright's "testInfo" object.
          },
        },
  "response": {
    "proxyBaseUrl": "http://<hostname>:<port>"
  },
  "metadata": {
    "source": "playwright-skeleton",
    "tri": "<generated-by-test-framework>",
    "testId": "<tests-must-append-this>"
  }
}
```
