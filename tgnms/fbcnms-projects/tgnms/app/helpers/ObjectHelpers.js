/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

export function objectEntriesTypesafe<T, K>(object: {[T]: K}): Array<[T, K]> {
  return ((Object.entries(object): any): Array<[T, K]>);
}

export function objectValuesTypesafe<T>(object: {[any]: T}): Array<T> {
  return ((Object.values(object): any): Array<T>);
}

export function convertType<T>(object: any): T {
  return ((object: any): T);
}
