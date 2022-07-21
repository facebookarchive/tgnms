/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import apiServiceClient from './apiServiceClient';
import {Api} from '../Api';
const {getApiActiveControllerAddress} = require('../topology/model');

export default class ApiServiceRoute extends Api {
  async init() {
    this.initLogger(__filename);
  }
  makeRoutes() {
    const router = this.createApi();
    router.use('/:topology/api/:apiMethod', (req, res) => {
      const {topology, apiMethod} = req.params;
      const {api_ip, api_port} = getApiActiveControllerAddress({
        topology,
      });
      const accessToken =
        req.user &&
        typeof req.user.getAccessToken === 'function' &&
        req.user.getAccessToken();
      return apiServiceClient
        .userRequest({
          host: api_ip,
          port: api_port,
          data: req.body,
          apiMethod,
          accessToken,
        })
        .then(response => {
          res.status(response.status).send(response.data);
        })
        .catch(error => {
          if (error.code === 'ECONNABORTED') {
            // connection timed out
            res
              .status(500)
              .send({message: 'Connection timed out to API service'});
          } else {
            res
              .status(error.response.status)
              .send({message: error.response.statusText});
          }
        });
    });

    return router;
  }
}
