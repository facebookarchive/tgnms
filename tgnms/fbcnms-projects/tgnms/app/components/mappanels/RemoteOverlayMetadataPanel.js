/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */
import CustomAccordion from '@fbcnms/tg-nms/app/components/common/CustomAccordion';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import {MAPMODE, useMapContext} from '../../contexts/MapContext';
import {
  PANELS,
  PANEL_STATE,
} from '@fbcnms/tg-nms/app/views/map/usePanelControl';
import {SlideProps} from '@fbcnms/tg-nms/app/constants/MapPanelConstants';
import {TopologyElementType} from '../../constants/NetworkConstants';
import {makeStyles} from '@material-ui/styles';
import {useNetworkContext} from '@fbcnms/tg-nms/app/contexts/NetworkContext';
import type {Element} from '@fbcnms/tg-nms/app/contexts/NetworkContext';
import type {LayerData} from '@fbcnms/tg-nms/app/views/map/NetworkMapTypes';
import type {PanelStateControl} from '@fbcnms/tg-nms/app/views/map/usePanelControl';

export default function RemoteOverlayMetadataPanel({
  panelControl,
}: {
  panelControl: PanelStateControl,
}) {
  const {getIsHidden, getIsOpen, toggleOpen, setPanelState} = panelControl;
  const {mapMode, overlayMetadata} = useMapContext();
  const {selectedElement} = useNetworkContext();
  const elementMetadata = getElementMetadata(selectedElement, overlayMetadata);
  React.useEffect(() => {
    if (mapMode === MAPMODE.CUSTOM_OVERLAYS && elementMetadata != null) {
      setPanelState(PANELS.CUSTOM_OVERLAY_METADATA, PANEL_STATE.OPEN);
    } else {
      setPanelState(PANELS.CUSTOM_OVERLAY_METADATA, PANEL_STATE.HIDDEN);
    }
  }, [mapMode, setPanelState, elementMetadata]);

  return (
    <Slide {...SlideProps} in={!getIsHidden(PANELS.CUSTOM_OVERLAY_METADATA)}>
      <CustomAccordion
        title={'Overlay Metadata'}
        details={
          elementMetadata != null && (
            <CustomOverlayMetadata metadata={elementMetadata} />
          )
        }
        expanded={getIsOpen(PANELS.CUSTOM_OVERLAY_METADATA)}
        onChange={() => toggleOpen(PANELS.CUSTOM_OVERLAY_METADATA)}
        onClose={() =>
          setPanelState(PANELS.CUSTOM_OVERLAY_METADATA, PANEL_STATE.HIDDEN)
        }
      />
    </Slide>
  );
}

function CustomOverlayMetadata({metadata}: {metadata: Object}) {
  const {selectedElement} = useNetworkContext();
  if (selectedElement == null) {
    return null;
  }
  const {type, name} = selectedElement;

  return (
    <Grid container direction="column" spacing={2} wrap="nowrap">
      {type === TopologyElementType.LINK && (
        <LinkOverlayMetadata linkName={name} metadata={metadata} />
      )}
      {type === TopologyElementType.SITE && (
        <SiteOverlayMetadata siteName={name} metadata={metadata} />
      )}
    </Grid>
  );
}

function LinkOverlayMetadata({
  linkName,
  metadata,
}: {
  linkName: string,
  metadata: {A: Object, Z: Object},
}) {
  const {linkMap} = useNetworkContext();
  const {a_node_name, z_node_name} = linkMap[linkName];
  return (
    <Grid container justify="space-between" spacing={1}>
      {metadata?.A != null && (
        <Metadata name={a_node_name} metadata={metadata?.A} />
      )}
      {metadata?.Z != null && (
        <Metadata name={z_node_name} metadata={metadata?.Z} />
      )}
    </Grid>
  );
}

function SiteOverlayMetadata({
  siteName,
  metadata,
}: {
  siteName: string,
  metadata: Object,
}) {
  return (
    <Grid>
      <Metadata name={siteName} metadata={metadata} />
    </Grid>
  );
}

const useStyles = makeStyles(theme => ({
  objectValue: {
    overflow: 'auto',
    padding: theme.spacing(1),
  },
}));
/**
 * Renders a single Metric metadata object. Links have 2, one for each side.
 * Sites/nodes have only one.
 */
function Metadata({name, metadata}: {name: string, metadata: Object}) {
  const classes = useStyles();
  return (
    <Grid item xs={6} container alignContent="flex-start" spacing={1}>
      <Grid item>
        <Typography
          variant="subtitle2"
          color="textSecondary"
          style={{wordBreak: 'break-all'}}
          paragraph>
          {name}
        </Typography>
      </Grid>
      {metadata != null &&
        Object.keys(metadata).map(key => {
          const val = metadata[key];
          const isObject = typeof val === 'object';
          return (
            <Grid item key={key} container xs={12} alignItems="flex-start">
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  {key}
                </Typography>
              </Grid>
              <Grid item classes={{root: isObject ? classes.objectValue : ''}}>
                {typeof val === 'object' ? (
                  <pre data-testid="metadata-json">
                    {JSON.stringify(val, null, 2)}
                  </pre>
                ) : (
                  <Typography>{val}</Typography>
                )}
              </Grid>
            </Grid>
          );
        })}
    </Grid>
  );
}

/**
 * Grabs the currently selected element's metadata from overlayMetadata
 */
function getElementMetadata(
  selectedElement: ?Element,
  overlayMetadata: LayerData<{}>,
): ?Object {
  if (selectedElement == null) {
    return null;
  }
  const elementType = selectedElement?.type;
  if (elementType === TopologyElementType.LINK) {
    const linkMap = overlayMetadata?.link_lines;
    if (!linkMap) {
      return null;
    }
    return linkMap[selectedElement.name];
  } else if (elementType === TopologyElementType.SITE) {
    const siteMap = overlayMetadata?.site_icons;
    if (!siteMap) {
      return null;
    }
    return siteMap[selectedElement.name];
  } else if (elementType === TopologyElementType.NODE) {
    const nodeMap = overlayMetadata?.nodes;
    if (!nodeMap) {
      return null;
    }
    return nodeMap[selectedElement.name];
  }
  return null;
}
