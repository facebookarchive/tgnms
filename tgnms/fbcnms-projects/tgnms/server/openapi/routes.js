/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import * as YAML from 'yamljs';
import * as path from 'path';
import * as swaggerUi from 'swagger-ui-express';
import axios from 'axios';
import {Api} from '../Api';
import {OPENAPI_URLS} from './openapiUrls';
import {safePathJoin} from '../helpers/apiHelpers';

export default class OpenApiRoute extends Api {
  async init() {
    this.initLogger(__filename);
  }
  makeRoutes() {
    const router = this.createApi();
    const STATIC_DOCS_ROOT = path.join(__dirname, '../../static/doc');
    const uiOptions = {
      explorer: true,
      swaggerOptions: {
        urls: OPENAPI_URLS,
      },
    };
    router.use('/', swaggerUi.serve);
    router.get('/', swaggerUi.setup(null, uiOptions));
    router.get('/msa/:serviceName', (req, res) => {
      try {
        let serviceName = req.params.serviceName;
        if (typeof serviceName !== 'string' || serviceName.trim() === '') {
          return res.status(400).json({error: 'service name required'});
        }
        serviceName = serviceName.replace(/[^a-zA-Z_-]/g, '');
        return axios
          .get(`http://${serviceName}:8080/docs.yml`)
          .then(response => {
            const json = YAML.parse(response.data);
            return res.json(json);
          });
      } catch (err) {
        return res.status(500).json({error: err.message});
      }
    });

    router.get('/yaml/:fileName', (req, res) => {
      const filePath = safePathJoin(STATIC_DOCS_ROOT, req.params.fileName);
      return YAML.load(filePath, result => res.json(result));
    });
    return router;
  }
}
