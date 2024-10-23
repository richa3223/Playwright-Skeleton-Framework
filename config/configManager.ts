import { randomUUID } from 'crypto';
import { merge } from 'lodash';
// baseConfig.json represents 'common' config, to avoid repeating it across all environments.
import baseConfig from './baseConfig.json';
/* envConfig.json represents environment-specific config. 
By default, this file represents local config. 
CI is responsible for overwriting this file with the appropriate files and renaming them to `<specific env>Config.json`. */
import envConfig from './envConfig.json';

// baseConfig is updated with any overwrites or additions from envConfig to create the CONFIG object.
const CONFIG = merge({}, baseConfig, envConfig);

// Some config may be overwritten by environment variables set in CI. If they are not, the default is persisted.
CONFIG.test.TRI = process.env.TRI ?? randomUUID();
CONFIG.environment = process.env.ENVIRONMENT ?? CONFIG.environment;
CONFIG.test.wiremock.baseUrl = process.env.WIREMOCK_URL ?? CONFIG.test.wiremock.baseUrl;

// Make config immutable as it should not be modified further outside of this class.
Object.freeze(CONFIG);

export default CONFIG;
