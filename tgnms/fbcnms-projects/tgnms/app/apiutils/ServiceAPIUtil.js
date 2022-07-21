/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import axios from 'axios';
import swal from 'sweetalert2';
import type {AxiosXHRConfig} from 'axios';

type AxiosE2EAck = {
  message: string, // from thrift::E2EAck
  statusText: string, // from axios
};

type ApiRequestOptions<T> = {
  checkbox?: string,
  choices?: {[string]: string},
  title?: string,
  desc?: string,
  descType?: string,
  getSuccessStr?: string => any,
  successType?: string,
  getFailureStr?: string => any,
  failureType?: string,
  processInput?: (T, string) => any, //first input is many formats
  onResultsOverride?: (
    {success: boolean, msg: string},
    ?(string) => any,
    ?(string) => any,
  ) => any,
  onSuccess?: () => any,
};

type APIServiceResponse<R> = {
  success?: boolean,
  message?: ?string,
  ...R,
};

/** Make an API service request. */
export function apiRequest<T, R>({
  networkName,
  endpoint,
  data = {},
  config,
}: {
  networkName: string,
  endpoint: string,
  data?: T,
  config?: $Shape<AxiosXHRConfig<T, APIServiceResponse<R>>>,
}): Promise<APIServiceResponse<R>> {
  return axios
    .post<T, APIServiceResponse<R>>(
      `/apiservice/${networkName}/api/${endpoint}`,
      data,
      config,
    )
    .then(response => {
      if (response.data.success === false) {
        throw new Error(response.data.message);
      }
      return response.data;
    });
}

// DEPRECATED - use apiRequest instead
export const apiServiceRequest = (
  networkName: string,
  apiMethod: string,
  data: Object = {},
  config: Object = {},
): Promise<any> => {
  // All apiservice requests are POST, and expect at least an empty dict.
  return new Promise((resolve, reject) => {
    axios
      .post(`/apiservice/${networkName}/api/${apiMethod}`, data, config)
      .then(response => {
        // NOTE: Until API service doesn't send 200s on failure, we need to
        // check for a 'success' flag
        if (response.data.hasOwnProperty('success')) {
          if (response.data.success) {
            resolve(response);
          } else {
            reject({response, message: response.data.message});
          }
        } else {
          resolve(response);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
};

/** Return the error from an API service response (via apiServiceRequest). */
export const getErrorTextFromE2EAck = (error: ?AxiosE2EAck) => {
  if (!error) {
    return 'Unknown Error';
  }

  // Try to get the message from the API response
  // Otherwise, default to the response
  return error.message ? error.message : error.statusText;
};

/**
 * Make an API service request with confirmation and response alerts (via swal).
 */
export function apiServiceRequestWithConfirmation<T = {}>(
  networkName: string,
  endpoint: string,
  data: T, //data input is recieved in many different formats
  options: ApiRequestOptions<T>,
) {
  const makeRequest = requestData =>
    new Promise((resolve, _reject) => {
      apiServiceRequest(networkName, endpoint, requestData)
        .then(response => resolve({success: true, msg: response.data.message}))
        .catch(error =>
          resolve({success: false, msg: getErrorTextFromE2EAck(error)}),
        );
    });

  requestWithConfirmation(makeRequest, options, data);
}

type SwalInputProps = {|
  input: 'checkbox' | 'radio',
  inputValue: number,
  inputPlaceholder: React.Node,
  inputOptions: React.Node,
  inputValidator: (
    val: string | boolean | number | Object,
  ) => void | string | boolean,
|};
/**
 * Make a request with confirmation and response alerts (via swal).
 */
export function requestWithConfirmation<T>(
  makeRequest: T => any, //input is data or formatted data
  options: ApiRequestOptions<T>,
  data: T, //data input is recieved in many different formats
) {
  const {
    // Checkbox option text (if applicable)
    checkbox,

    // Choice options (if applicable)
    choices,

    // Title text
    title = 'Are You Sure?',

    // Description text in alerts
    // (types: 'text' or 'html')
    desc = '',
    descType = 'text',
    getSuccessStr = msg => `Response:<p><tt>${msg}</tt></p>`,
    successType = 'html',
    getFailureStr = msg => `Response:<p><tt>${msg}</tt></p>`,
    failureType = 'html',

    // Callback functions
    processInput, // function(data, inputValue) => {}
    onResultsOverride, // function(value, successSwal, failureSwal) => void
    onSuccess, // function() => void
  } = options;

  const checkboxProps: $Shape<SwalInputProps> = checkbox
    ? {
        input: 'checkbox',
        inputValue: 0,
        inputPlaceholder: checkbox,
      }
    : {};
  const choiceProps: $Shape<SwalInputProps> = choices
    ? {
        input: 'radio',
        inputOptions: choices,
        inputValidator: value => {
          return !value && 'Please select an option.';
        },
      }
    : {};

  swal({
    title,
    [descType]: desc,
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    confirmButtonText: 'Confirm',
    showLoaderOnConfirm: true,
    inputClass: 'swal-input',
    ...checkboxProps,
    ...choiceProps,
    preConfirm: value => {
      const requestData = processInput ? processInput(data, value) : data;
      return makeRequest(requestData);
    },
  }).then(result => {
    if (result.dismiss) {
      return false;
    }

    const successSwal = msg =>
      swal({
        title: 'Success!',
        [successType]: getSuccessStr(msg),
        type: 'success',
      });
    const failureSwal = msg =>
      swal({
        title: 'Failed!',
        [failureType]: getFailureStr(msg),
        type: 'error',
      });

    if (onResultsOverride) {
      onResultsOverride(result.value, successSwal, failureSwal);
    } else {
      // Assume structure of 'result.value' is {success: bool, msg: string}
      // TODO: Make this more flexible...
      if (result.value.success) {
        successSwal(result.value.msg);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        failureSwal(result.value.msg);
      }
    }
    return true;
  });
}
