/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */

import * as React from 'react';

import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import useLiveRef from '../../hooks/useLiveRef';
import {objectEntriesTypesafe} from '../../helpers/ObjectHelpers';
import {useNetworkListContext} from '../../contexts/NetworkListContext';

export default function NetworkSelect({
  value,
  onChange,
}: {|
  value: string | Array<string>,
  onChange: (string | Array<string>) => void,
|}) {
  const {networkList} = useNetworkListContext();
  const networks = networkList ? objectEntriesTypesafe(networkList) : [];
  const onChangeRef = useLiveRef(onChange);
  const handleChange = React.useCallback(
    (e: SyntheticInputEvent<HTMLSelectElement>) => {
      onChangeRef.current((e.target.value: any));
    },
    [onChangeRef],
  );
  return (
    <Select
      multiple={Array.isArray(value)}
      value={Array.isArray(value) ? value : [value]}
      onChange={handleChange}>
      {networks.map(([name, _network]) => (
        <MenuItem key={name} value={name}>
          {name}
        </MenuItem>
      ))}
    </Select>
  );
}
