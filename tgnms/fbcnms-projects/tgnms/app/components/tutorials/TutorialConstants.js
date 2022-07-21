/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

export const QUICK_START_LINK =
  'https://terragraph.com/docs/runbook/Quick_Start';
export const MOUNTING_LINK =
  'https://terragraph.com/docs/runbook/Planning#mounting-accuracy';

export const MODULES = {
  INTRO: 'INTRO',
  POP: 'POP',
  PROVISION_POP: 'PROVISION_POP',
  ADD_SECOND_SITE: 'ADD_SECOND_SITE',
  ADD_THIRD_SITE: 'ADD_THIRD_SITE',
  ADD_FINAL_SITE: 'ADD_FINAL_SITE',
};

export const MODULE_TITLES = {
  INTRO: 'Introduction',
  POP: 'Add a POP',
  PROVISION_POP: 'Provision the POP',
  ADD_SECOND_SITE: 'Add second site and a link',
  ADD_THIRD_SITE: 'Add third site and a link',
  ADD_FINAL_SITE: 'Add final site and links',
};

export const ERROR_MESSAGE =
  'Complete this step before being able to continue.';

export const ADDITIONAL_CONTENT = {
  SELECT_SITE: 'SELECT_SITE',
  MOVE_SITE: 'MOVE_SITE',
  SELECT_NODE_TYPE: 'SELECT_NODE_TYPE',
  SELECT_TO_NODE: 'SELECT_TO_NODE',
  SAVE_TOPOLOGY: 'SAVE_TOPOLOGY',
};

export const SITE_NUMBERS = {
  FIRST: 'FIRST',
  SECOND: 'SECOND',
  THIRD: 'THIRD',
  FOURTH: 'FOURTH',
};

export const TYPE = {
  [SITE_NUMBERS.FIRST]: 'POP',
  [SITE_NUMBERS.SECOND]: 'DN',
  [SITE_NUMBERS.THIRD]: 'DN',
  [SITE_NUMBERS.FOURTH]: 'DN',
};

export const LINK_NODES = {
  [SITE_NUMBERS.FIRST]: [],
  [SITE_NUMBERS.SECOND]: ['POP node'],
  [SITE_NUMBERS.THIRD]: ['DN at the second site'],
  [SITE_NUMBERS.FOURTH]: ['DN at the third site', 'POP node'],
};

export const SITE_ADDITIONAL_CONTENT = {
  [SITE_NUMBERS.FIRST]: {
    [ADDITIONAL_CONTENT.SELECT_SITE]: 'This will be the POP site.',
    [ADDITIONAL_CONTENT.MOVE_SITE]:
      'You can put it anywhere since site locations on the map don’t need to match actual site locations in this test network.',
    [ADDITIONAL_CONTENT.SELECT_NODE_TYPE]:
      'POP node, while the sites you’ll add later will have distribution nodes (DNs).',
    [ADDITIONAL_CONTENT.SELECT_TO_NODE]: [],
    [ADDITIONAL_CONTENT.SAVE_TOPOLOGY]: 'the new site and node',
  },
  [SITE_NUMBERS.SECOND]: {
    [ADDITIONAL_CONTENT.SELECT_SITE]:
      'A distribution node (DN) will be placed here.',
    [ADDITIONAL_CONTENT.MOVE_SITE]:
      'We recommend putting it to the right of the first site, which was the POP.',
    [ADDITIONAL_CONTENT.SELECT_NODE_TYPE]: 'distribution node (DN).',
    [ADDITIONAL_CONTENT.SELECT_TO_NODE]: [
      'The link will connect the DN to the POP.',
    ],
    [ADDITIONAL_CONTENT.SAVE_TOPOLOGY]:
      'the new site, distribution node (DN) and link',
  },
  [SITE_NUMBERS.THIRD]: {
    [ADDITIONAL_CONTENT.SELECT_SITE]:
      'Another distribution node (DN) will be placed here.',
    [ADDITIONAL_CONTENT.MOVE_SITE]:
      'We recommend putting it below the second site.',
    [ADDITIONAL_CONTENT.SELECT_NODE_TYPE]: 'distribution node (DN).',
    [ADDITIONAL_CONTENT.SELECT_TO_NODE]: [
      'The link will connect the second DN to the first DN.',
    ],
    [ADDITIONAL_CONTENT.SAVE_TOPOLOGY]:
      'the new site, distribution node (DN) and link',
  },
  [SITE_NUMBERS.FOURTH]: {
    [ADDITIONAL_CONTENT.SELECT_SITE]:
      'This is where the last distribution node (DN) will be.',
    [ADDITIONAL_CONTENT.MOVE_SITE]:
      'We recommend putting it below the POP to create a square.',
    [ADDITIONAL_CONTENT.SELECT_NODE_TYPE]: 'distribution node (DN).',
    [ADDITIONAL_CONTENT.SELECT_TO_NODE]: [
      'The link will connect the third DN to the second DN',
      'The link will connect the DN at the fourth site to the POP.',
    ],
    [ADDITIONAL_CONTENT.SAVE_TOPOLOGY]:
      'the new site, distribution node (DN) and link',
  },
};

export const SITE_NUMBERS_VALUES = {
  [SITE_NUMBERS.FIRST]: {name: 'first', siteNumber: 1, nodeNumber: 1},
  [SITE_NUMBERS.SECOND]: {name: 'second', siteNumber: 2, nodeNumber: 1},
  [SITE_NUMBERS.THIRD]: {name: 'third', siteNumber: 3, nodeNumber: 2},
  [SITE_NUMBERS.FOURTH]: {name: 'fourth', siteNumber: 4, nodeNumber: 3},
};

export const STEP_TARGET = {
  MODAL_TARGET: 'body',
  NETWORK_NAME: 'network-name-tutorial',
  SEARCH: 'search-bar-tutorial',
  MAP: 'mapboxgl-canvas',
  SITE_DETAILS: 'site-details-tutorial',
  NODE_ACTIONS: 'node-actions-menu-tutorial',
  NODE_CONFIG: 'node-config-button-tutorial',
  CONFIG_MODAL: 'config-modal-tutorial',
  TOPOLOGY_TOOLBAR: 'topology-toolbar-tutorial',
  ADD_SITE: 'add-site-tutorial',
  SITE_NAME: 'site-name-tutorial',
  NODE_SECTION: 'node-dropdown-tutorial',
  ADD_NODE: 'add-node-tutorial',
  NODE_TYPE: 'select-node-type-tutorial',
  NODE_NAME: 'node-name-tutorial',
  SAVE_TOPOLOGY: 'save-topology-tutorial',
  LINK_SECTION: 'link-dropdown-tutorial',
  LINK_FORM: 'link-creation-tutorial',
  ADD_LINK: 'add-link-tutorial',
  RADIO_MAC_ADDRESS: 'wlan-mac-editor-tutorial',
};
