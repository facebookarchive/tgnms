/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

// this static import is only for flow, don't use it in tests
import * as __config from '../config';
import {mockConsole} from '../../shared/tests/testHelpers';
describe('NMS Server config', () => {
  /**
   * config.js reads from process.env when it's imported. Since imports are
   * cached and process.env modifications are not pure, tests must take special
   * care if modifying process.env
   */
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules(); // this is important - it clears the cache
    process.env = {...OLD_ENV};
    delete process.env.NODE_ENV;
  });
  afterEach(() => {
    process.env = OLD_ENV;
  });

  describe('LOGIN_ENABLED', () => {
    test('defaults to false', () => {
      const {LOGIN_ENABLED} = require('../config');
      expect(LOGIN_ENABLED).toBe(false);
    });
    test('if LOGIN_ENABLED=true, value is true', () => {
      setEnv('LOGIN_ENABLED', 'true');
      const {LOGIN_ENABLED} = require('../config');
      expect(LOGIN_ENABLED).toBe(true);
    });
    test('if LOGIN_ENABLED=false, value is false', () => {
      setEnv('LOGIN_ENABLED', 'false');
      const {LOGIN_ENABLED} = require('../config');
      expect(LOGIN_ENABLED).toBe(false);
    });
    test('if LOGIN_ENABLED=test, value is false', () => {
      const consoleMock = mockConsole();
      setEnv('LOGIN_ENABLED', 'test');
      const {LOGIN_ENABLED} = require('../config');
      expect(LOGIN_ENABLED).toBe(false);
      expect(consoleMock.error).toHaveBeenCalled();
    });
    test('if LOGIN_ENABLED="", value is true', () => {
      setEnv('LOGIN_ENABLED', '');
      const {LOGIN_ENABLED} = require('../config');
      expect(LOGIN_ENABLED).toBe(true);
    });
  });

  describe('API_REQUEST_TIMEOUT', () => {
    test('defaults to 12 seconds', () => {
      const {API_REQUEST_TIMEOUT} = require('../config');
      expect(API_REQUEST_TIMEOUT).toBe(12000);
    });
    test('if API_REQUEST_TIMEOUT=kitty, value is 12000', () => {
      const consoleMock = mockConsole();
      setEnv('API_REQUEST_TIMEOUT', 'kitty');
      const {API_REQUEST_TIMEOUT} = require('../config');
      expect(API_REQUEST_TIMEOUT).toBe(12000);
      expect(consoleMock.error).toHaveBeenCalled();
    });
    test('if API_REQUEST_TIMEOUT=1000, value is 1000 (number)', () => {
      setEnv('API_REQUEST_TIMEOUT', '1000');
      const {API_REQUEST_TIMEOUT} = require('../config');
      expect(API_REQUEST_TIMEOUT).toBe(1000);
    });
  });
});

/*
 * IMPORTANT: env vars are ALWAYS strings.
 * In these tests, never set anything in process.env a non-string. This helper
 * exists to help prevent that.
 */
function setEnv(key: $Keys<typeof __config>, val: string) {
  process.env[key] = val;
}
