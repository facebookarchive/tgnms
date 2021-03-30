/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */
import * as React from 'react';
import useRouter from '@fbcnms/ui/hooks/useRouter';
import {
  deleteUrlSearchParam,
  getUrlSearchParam,
  setUrlSearchParam,
} from '@fbcnms/tg-nms/app/helpers/NetworkUrlHelpers';
import type {AnpUploadTopologyType} from '@fbcnms/tg-nms/app/constants/TemplateConstants';

export type LngLat = [number, number];
export type BBox = [LngLat, LngLat];

export type NetworkPlanningContext = {|
  selectedPlanId: ?string,
  setSelectedPlanId: (planId: ?string) => void,
  planTopology: ?AnpUploadTopologyType,
  setPlanTopology: AnpUploadTopologyType => void,
|};

const PLAN_ID_QUERY_KEY = 'planid';
const empty = () => {};
const defaultValue: NetworkPlanningContext = {
  selectedPlanId: null,
  setSelectedPlanId: empty,
  planTopology: null,
  setPlanTopology: empty,
};

const context = React.createContext<NetworkPlanningContext>(defaultValue);
export default context;

export function useNetworkPlanningContext(): NetworkPlanningContext {
  return React.useContext<NetworkPlanningContext>(context);
}

export function NetworkPlanningContextProvider({
  children,
}: {
  children: React.Node,
}) {
  const {history, location} = useRouter();
  const setSelectedPlanId = React.useCallback(
    (planId: ?string) => {
      if (planId == null) {
        deleteUrlSearchParam(history, PLAN_ID_QUERY_KEY);
      } else {
        setUrlSearchParam(history, PLAN_ID_QUERY_KEY, planId);
      }
    },
    [history],
  );
  const selectedPlanId = React.useMemo(
    () => getUrlSearchParam(PLAN_ID_QUERY_KEY, location),
    [location],
  );
  const [
    planTopology,
    setPlanTopology,
  ] = React.useState<?AnpUploadTopologyType>(null);
  return (
    <context.Provider
      value={{
        selectedPlanId,
        setSelectedPlanId,
        planTopology,
        setPlanTopology,
      }}>
      {children}
    </context.Provider>
  );
}
