/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */

import './common/axiosConfig';
import './common/i18n';
import '@fbcnms/babel-register/polyfill';

import LoadingBox from './components/common/LoadingBox';
import MaterialTheme from './MaterialTheme';
import NetworkListBase from './NetworkListBase';
import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {WebSocketProvider} from './WebSocketContext';
import {hot} from 'react-hot-loader';

/* eslint-disable-next-line no-undef */
const HotNetworkListBase = hot(module)(NetworkListBase);

ReactDOM.render(
  <BrowserRouter>
    <WebSocketProvider>
      <MaterialTheme>
        <Suspense fallback={<LoadingBox fullScreen={false} />}>
          <HotNetworkListBase />
        </Suspense>
      </MaterialTheme>
    </WebSocketProvider>
  </BrowserRouter>,
  document.getElementById('root'),
);
