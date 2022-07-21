/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import {TokenSet} from 'openid-client';
import type {OpenidUserInfoClaims} from 'openid-client';
import type {User as UserDto} from '../../shared/auth/User';

/**
 * we use a symbol because this is a private, non-enumerable property
 **/
const USER_TOKEN_SET = Symbol('USER_TOKEN_SET');

/**
 * Add custom claims here and map them onto the user below
 */
export type ApplicationUserClaims = OpenidUserInfoClaims & {|
  roles: Array<string>,
|};

export default class User implements UserDto {
  constructor(init: UserDto) {
    Object.assign(this, init);
  }
  id: string;
  name: string;
  email: string;
  roles: Array<string>;

  static fromTokenSet(tokenSet: TokenSet): User {
    if (!(tokenSet instanceof TokenSet)) {
      tokenSet = new TokenSet(tokenSet);
    }

    const claims: $Shape<ApplicationUserClaims> = tokenSet.claims;
    const user = new User({
      id: claims.sub,
      name: claims.name,
      email: claims.email,
      roles: claims.roles,
    });

    /**
     * Hack for passport serialization.
     * Attach the token set to the user so that it is passed to
     * passport.serializeUser. A non-enumerable symbol is used to prevent
     * accidental token leakage
     */
    (user: Object)[USER_TOKEN_SET] = tokenSet;
    return user;
  }

  __getTokenSet = (): TokenSet => {
    return (this: Object)[USER_TOKEN_SET];
  };

  getAccessToken = () => {
    const tokenSet = this.__getTokenSet();
    if (tokenSet) {
      return tokenSet.access_token;
    }
  };
}
