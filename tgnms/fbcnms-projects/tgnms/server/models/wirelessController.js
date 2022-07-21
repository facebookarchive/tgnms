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
  const WirelessController = sequelize.define(
    'wireless_controller',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        allowNull: false,
        type: DataTypes.ENUM('ruckus'),
      },
      url: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      username: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    },
  );

  WirelessController.associate = function (models) {
    // associations can be defined here
    models.wireless_controller.hasOne(models.topology, {
      foreignKey: 'wireless_controller',
      targetKey: 'wireless_controller',
    });
  };
  return WirelessController;
}

export type WirelessControllerType = 'ruckus' | 'none';

export type WirelessControllerAttributes = {|
  id: number,
  type: WirelessControllerType,
  url: string,
  username: string,
  password: string,
|};

export type WirelessController = WirelessControllerAttributes &
  Model<WirelessControllerAttributes>;
