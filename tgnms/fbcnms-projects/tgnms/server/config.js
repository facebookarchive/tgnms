/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */

require('dotenv').config();

const API_REQUEST_TIMEOUT = envInt(process.env.API_REQUEST_TIMEOUT, 5000);

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
// NOTE: Login is disabled by default until its deployed publicly
const LOGIN_ENABLED = envBool(process.env.LOGIN_ENABLED, false);

const MYSQL_HOST = process.env.MYSQL_HOST || '127.0.0.1';
const MYSQL_PORT = process.env.MYSQL_PORT || '3306';
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASS = process.env.MYSQL_PASS || '';
const MYSQL_DB = process.env.MYSQL_DB || 'cxl';
const NETWORKTEST_HOST = process.env.NETWORKTEST_HOST || 'network_test';

const PROXY_ENABLED = process.env.http_proxy && process.env.http_proxy.length;

/**
 * If you're connecting to openid connect through a proxy, and that proxy is
 * different than the one used to connect to the lab network, specify this
 * option. Otherwise it will fall back to the default http_proxy
 **/
const KEYCLOAK_HTTP_PROXY = process.env.KEYCLOAK_HTTP_PROXY
  ? process.env.KEYCLOAK_HTTP_PROXY
  : process.env.http_proxy
  ? process.env.http_proxy
  : undefined;

const KEYCLOAK_HOST = process.env.KEYCLOAK_HOST;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;
const CLIENT_ROOT_URL = process.env.CLIENT_ROOT_URL;

const BERINGEI_QUERY_URL = process.env.BQS || 'http://localhost:8086';
const PROMETHEUS_URL = process.env.PROMETHEUS || 'http://prometheus:9090';
// default data source interval to use
const DS_INTERVAL_SEC = 30;
// allow prometheus or beringei as the stats backend
const STATS_BACKEND =
  process.env.STATS_BACKEND === 'prometheus' ? 'prometheus' : 'beringei';
const GRAFANA_URL = process.env.GRAFANA_URL || '/grafana';

// fix to a stable docker api version (https://docs.docker.com/engine/api/v1.37/)
const DOCKER_API_VERSION = '1.37';

// URL and auth token for Terragraph's central nodeupdate server
const NODEUPDATE_SERVER_URL =
  process.env.NODEUPDATE_SERVER_URL || 'https://nodeupdate.terragraph.link';
const NODEUPDATE_AUTH_TOKEN = process.env.NODEUPDATE_AUTH_TOKEN || '';

// URL and auth token for Terragraph's software portal
const SOFTWARE_PORTAL_URL =
  process.env.SOFOTWARE_PORTAL_URL || 'https://sw.terragraph.link';
const SOFTWARE_PORTAL_API_TOKEN =
  process.env.SOFTWARE_PORTAL_API_TOKEN || 'K__AjuA9ii_Mwq7FYV00PWS-e6Y';
const SOFTWARE_PORTAL_API_ID = process.env.SOFTWARE_PORTAL_API_ID || 'tgdev';

// Directory containing all node logs
// Structure:
//   $NODELOG_DIR/<mac_addr>/yyyy-mm-dd_terragraph_<name>_logs.log<.lz4>
const NODELOG_DIR = process.env.NODELOG_DIR || '/nodelogs';

const TRANSLATIONS_DEFAULT_LOCALE =
  process.env.TRANSLATIONS_DEFAULT_LOCALE || 'en_US';
const LOCALES_DIR = process.env.LOCALES_DIR || './locales';
const DEVELOPMENT = process.env.NODE_ENV !== 'production';

// comma separated list of kafka hosts
// structure:
//   'kafka-host1:9092,kafka-host2:9092'
const KAFKA_HOSTS = process.env.KAFKA_HOSTS;

function envBool(envVar: ?string, defaultValue: boolean) {
  if (typeof envVar === 'undefined') {
    return defaultValue;
  }
  // empty env vars like ENABLE_X are still considered true
  if (envVar === 'true' || envVar === '') {
    return true;
  }
  if (envVar === 'false') {
    return false;
  }
  console.error(
    `Invalid environment variable. Expected: boolean string, Actual: ${envVar ||
      'undefined'}`,
  );
  return defaultValue;
}

function envInt(envVar: ?string, defaultValue: number) {
  if (typeof envVar === 'undefined') {
    return defaultValue;
  }
  const parsed = parseInt(envVar);
  if (isNaN(parsed)) {
    console.error(
      `Invalid environment variable. Expected: integer, Actual: ${envVar ||
        'undefined'}`,
    );
    return defaultValue;
  }

  return parsed;
}

module.exports = {
  API_REQUEST_TIMEOUT,
  BERINGEI_QUERY_URL,
  PROMETHEUS_URL,
  DS_INTERVAL_SEC,
  STATS_BACKEND,
  GRAFANA_URL,
  DEFAULT_API_SERVICE_PORT: '8080',
  DOCKER_API_VERSION,
  LOGIN_ENABLED,
  LOG_LEVEL,
  MYSQL_DB,
  MYSQL_HOST,
  MYSQL_PASS,
  MYSQL_PORT,
  MYSQL_USER,
  NODELOG_DIR,
  NODEUPDATE_SERVER_URL,
  NODEUPDATE_AUTH_TOKEN,
  SOFTWARE_PORTAL_URL,
  SOFTWARE_PORTAL_API_TOKEN,
  SOFTWARE_PORTAL_API_ID,
  PROXY_ENABLED,
  SALT_GEN_ROUNDS: 10,
  NETWORKTEST_HOST,
  CLIENT_ROOT_URL,
  KEYCLOAK_HTTP_PROXY,
  KEYCLOAK_HOST,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET,
  TRANSLATIONS_DEFAULT_LOCALE,
  LOCALES_DIR,
  DEVELOPMENT,
  KAFKA_HOSTS,
};
