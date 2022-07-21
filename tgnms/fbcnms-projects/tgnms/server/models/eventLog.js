/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import type Sequelize, {DataTypes as DataTypesType, Model} from 'sequelize';

export default function (sequelize: Sequelize, DataTypes: DataTypesType) {
  const EventLog = sequelize.define(
    'event_log',
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      mac: {
        type: DataTypes.STRING(100),
      },
      name: {
        type: DataTypes.STRING(100),
      },
      topologyName: {
        type: DataTypes.STRING(100),
      },
      source: {
        type: DataTypes.STRING(100),
      },
      timestamp: {
        type: DataTypes.INTEGER,
      },
      reason: {
        type: DataTypes.TEXT,
      },
      details: {
        type: DataTypes.TEXT,
      },
      category: {
        type: DataTypes.STRING(100),
      },
      eventId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      level: {
        type: DataTypes.STRING(100),
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    },
  );
  return EventLog;
}

type EventLogAttributes = {|
  id: number,
  mac: string,
  name: string,
  topologyName: string,
  source: string,
  timestamp: number,
  reason: string,
  details: string,
  category: string,
  subcategory: string,
  level: string,
|};

export type EventLog = EventLogAttributes & Model<EventLogAttributes>;
