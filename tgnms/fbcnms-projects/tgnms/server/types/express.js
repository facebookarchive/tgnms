/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import User from '../user/User';
import type {User as SharedUser} from '../../shared/auth/User';
import type {TokenSet} from 'openid-client';

export type PassportMiddleware = {|
  isAuthenticated: () => boolean,
  user?: ?User,
  logIn: (user: User | SharedUser, (err: ?Error) => mixed) => void,
  logout: () => void,
|};

export type SessionMiddleware = {|
  session?: {
    passport?: {
      user?: TokenSet,
    },
    save: (onSave: () => {}) => mixed,
  },
|};

export type Request = ExpressRequest & PassportMiddleware & SessionMiddleware;
export type Response = ExpressResponse;
