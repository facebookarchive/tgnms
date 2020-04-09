/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */

import Dragger from '../../components/common/Dragger';
import MapLayers from './mapLayers/MapLayers';
import NetworkContext from '../../contexts/NetworkContext';
import NetworkDrawer from './NetworkDrawer';
import NetworkTables from '../tables/NetworkTables';
import React from 'react';
import ReactMapboxGl, {RotationControl, ZoomControl} from 'react-mapbox-gl';
import RouteContext from '../../contexts/RouteContext';
import TableControl from './TableControl';
import TgMapboxGeocoder from '../../components/geocoder/TgMapboxGeocoder';
import mapboxgl from 'mapbox-gl';
import {
  HistoricalMetricsOverlayStrategy,
  MetricsOverlayStrategy,
  TestExecutionOverlayStrategy,
} from './overlays';
import {MILLISECONDS_TO_MINUTES} from '../../constants/LayerConstants';
import {NetworkDrawerConstants} from './NetworkDrawer';
import {Route, withRouter} from 'react-router-dom';
import {
  deleteUrlSearchParam,
  setUrlSearchParam,
} from '../../helpers/NetworkUrlHelpers';
import {getHistoricalDate} from '../../helpers/NetworkHelpers';
import {
  getSpeedTestId,
  getTestOverlayId,
} from '../../helpers/NetworkTestHelpers';
import {withStyles} from '@material-ui/core/styles';

import type {Coordinate, NetworkConfig} from '../../contexts/NetworkContext';
import type {
  MapLayerConfig,
  NetworkMapOptions,
  SelectedLayersType,
  SelectedOverlays,
  UrlInputType,
} from './NetworkMapTypes';
import type {
  NearbyNodes,
  PlannedSite,
  Routes,
} from '../../components/mappanels/MapPanelTypes';
import type {Route as NodeRoute} from '../../contexts/RouteContext';
import type {OverlayStrategy} from './overlays';
import type {RouterHistory} from 'react-router-dom';

const styles = theme => ({
  appBarSpacer: theme.mixins.toolbar,
  container: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
  },
  topContainer: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'row',
  },
  draggerContainer: {
    position: 'absolute',
    width: '100%',
    zIndex: 2,
  },
});

const {MAPBOX_ACCESS_TOKEN} = window.CONFIG.env;
const MapBoxGL = ReactMapboxGl({accessToken: MAPBOX_ACCESS_TOKEN});

// Initial map bounding box:
// https://www.mapbox.com/mapbox-gl-js/api/#map#fitbounds
const FIT_BOUND_OPTIONS = {padding: 32, maxZoom: 18, animate: false};

// All supported map styles:
// https://www.mapbox.com/api-documentation/#styles
const DefaultMapBoxStyles = [
  {name: 'Streets', endpoint: 'streets-v10'},
  {name: 'Satellite', endpoint: 'satellite-streets-v10'},
];
const getMapBoxStyleUrl = endpoint => 'mapbox://styles/mapbox/' + endpoint;

// Interval at which link overlay metrics are refreshed (in ms)
const LINK_OVERLAY_METRIC_REFRESH_INTERVAL_MS = 30000;

// Table size limits (in pixels)
const TABLE_LIMITS = {minHeight: 360, maxHeight: 720};

type Props = {
  classes: {[string]: string},
  location: Location,
  networkConfig: NetworkConfig,
  networkName: string,
  siteToNodesMap: {[string]: Set<string>},
  match: Object,
  history: RouterHistory,
  networkMapOptions: NetworkMapOptions,
  updateNetworkMapOptions: NetworkMapOptions => void,
};

type State = {
  mapRef: ?mapboxgl.Map, // reference to Map class
  mapBounds?: [Coordinate, Coordinate],
  selectedLayers: SelectedLayersType,
  selectedOverlays: SelectedOverlays,
  showTable: boolean,
  tableHeight: number,

  // loading indicator bool
  overlayLoading: boolean,

  // link overlay stats received per-link
  linkOverlayMetrics: ?{[string]: {}},

  // Selected map style (from MapBoxStyles)
  selectedMapStyle: string,

  // Planned site location ({latitude, longitude} or null)
  plannedSite: ?PlannedSite,

  // Nearby nodes ({nodeName: TopologyScanInfo[]})
  nearbyNodes: NearbyNodes,

  // routes properties
  routes: $Shape<Routes>,

  routesOverlay: {
    selectedNode: ?string,
    routeData: Object,
  },

  // Sites that should not be rendered on the map (e.g. while editing)
  hiddenSites: Set<string>,

  //Historical metrics to render historical data on map
  isHistoricalOverlay: boolean,
  //The day selected to view historical data
  historicalDate: Date,
  //The exact time selectd to view historical stats
  selectedTime: Date,
  siteMapOverrides: ?{[string]: string},
  networkDrawerWidth: number,
};

class NetworkMap extends React.Component<Props, State> {
  layersConfig: Array<MapLayerConfig>;
  overlayStrategy: OverlayStrategy;
  _mapBoxStyles;
  _refreshLinkMetricOverlayTimer;

  constructor(props) {
    super(props);
    // construct styles list
    const {networkMapOptions} = props;
    this._mapBoxStyles = this.mapBoxStylesList();
    this.overlayStrategy = networkMapOptions.overlayStrategy;
    const isHistoricalOverlay =
      this.overlayStrategy.constructor === HistoricalMetricsOverlayStrategy;

    this.state = {
      // Map config
      mapRef: null, // reference to Map class
      mapBounds: props.networkConfig.bounds,
      selectedLayers: networkMapOptions.selectedLayers,
      selectedOverlays: networkMapOptions.selectedOverlays,

      // Map tables
      showTable: false,
      tableHeight: TABLE_LIMITS.minHeight,

      overlayLoading: false,

      // link overlay stats received per-link
      linkOverlayMetrics: networkMapOptions.linkOverlayMetrics,

      // Selected map style (from MapBoxStyles)
      selectedMapStyle: this._mapBoxStyles[0].endpoint,

      // Planned site location ({latitude, longitude} or null)
      plannedSite: null,

      // Nearby nodes ({nodeName: TopologyScanInfo[]})
      nearbyNodes: {},

      // routes properties
      routes: {
        // node with "show route" panel
        node: null,
        // map of routes links (link:weight)
        links: {},
        // map of nodes involved in routes
        nodes: new Set(),
      },

      routesOverlay: {
        selectedNode: null,
        routeData: {},
      },

      // Sites that should not be rendered on the map (e.g. while editing)
      hiddenSites: new Set(),

      isHistoricalOverlay: isHistoricalOverlay,
      historicalDate: networkMapOptions.historicalDate,
      selectedTime: networkMapOptions.selectedTime,
      siteMapOverrides: null,
      networkDrawerWidth: NetworkDrawerConstants.DRAWER_MIN_WIDTH,
    };

    // when switching to other tabs of the NMS, the URL gets overwritten.
    // If the map is in test or history mode, the URL should reflect that.
    this.updateUrl({
      isHistoricalOverlay,
      historicalDate: networkMapOptions.historicalDate,
      testId: networkMapOptions.overlayStrategy.testId,
    });

    // link metric overlay timer to refresh backend stats
    // initialized to null for clearInterval() sanity
    this._refreshLinkMetricOverlayTimer = null;
  }

  componentDidMount() {
    /**
     * In test or historical mode, overlays are metrics, so data must be fetched
     * In normal mode, the default overlay is health which is already present
     * and does not need to be fetched.
     */
    const {location} = this.props;
    if (getTestOverlayId(location) || getHistoricalDate(location)) {
      this.fetchOverlayData();
    }
  }

  componentWillUnmount() {
    clearInterval(this._refreshLinkMetricOverlayTimer);
  }

  componentDidUpdate(prevProps: Props) {
    this.updateOverlayStrategy({
      previousTestId: getTestOverlayId(prevProps.location),
    });
  }

  mapBoxStylesList() {
    // use default styles if no override specified
    if (!window.CONFIG.env.hasOwnProperty('TILE_STYLE')) {
      return DefaultMapBoxStyles.map(({name, endpoint}) => ({
        name,
        endpoint: getMapBoxStyleUrl(endpoint),
      }));
    }
    // override list of styles if env specified
    const {TILE_STYLE} = window.CONFIG.env;
    // parse style format
    // <Display Name>=<Tile URL>,...
    const tileStyleUrls = TILE_STYLE.split(',');
    return tileStyleUrls.map(tileStyle => {
      const [name, endpoint] = tileStyle.split('=');
      return {name, endpoint};
    });
  }

  handleTableResize = height => {
    // Handle dragger resize event on the table
    this.setState({tableHeight: height});

    // Force map to resize
    window.dispatchEvent(new Event('resize'));
  };

  onToggleTable = (showTable?: boolean) => {
    const nextState =
      typeof showTable === 'boolean' ? showTable : !this.state.showTable;
    // Toggle showing the table
    this.setState({showTable: nextState}, () => {
      // Force map to resize
      window.dispatchEvent(new Event('resize'));
    });
  };

  onPlannedSiteMoved = mapEvent => {
    // Update planned site location (based on map event)
    const {lat, lng} = mapEvent.lngLat;
    this.setState(prevState => ({
      plannedSite: {
        latitude: lat,
        longitude: lng,
        name: prevState.plannedSite?.name || '',
        altitude: prevState.plannedSite?.altitude || -1,
        accuracy: prevState.plannedSite?.accuracy || -1,
      },
    }));
  };

  onGeocoderEvent = feature => {
    // Move to a location returned by the geocoder
    const {mapRef} = this.state;
    if (mapRef) {
      const {bbox, center} = feature;
      if (bbox) {
        mapRef.fitBounds([
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ]);
      } else {
        mapRef.flyTo({center});
      }
    }
  };

  hideSite = name => {
    // Hide the given site
    const {hiddenSites} = this.state;
    hiddenSites.add(name);
    this.setState({hiddenSites});
  };

  unhideSite = name => {
    // Unhide the given site
    const {hiddenSites} = this.state;
    hiddenSites.delete(name);
    this.setState({hiddenSites});
  };

  fetchOverlayData = () => {
    const {networkName, siteToNodesMap} = this.props;
    const {selectedOverlays, historicalDate, selectedTime} = this.state;

    this.setState({overlayLoading: true});

    this.overlayStrategy
      .getData({
        networkName: networkName,
        overlayId: selectedOverlays.link_lines,
        date: historicalDate,
        selectedTime,
        siteToNodesMap,
      })
      .then(overlayData => {
        this.setState(
          {
            linkOverlayMetrics: overlayData.linkOverlayData,
            overlayLoading: false,
            siteMapOverrides: overlayData.siteMapOverrides,
          },
          () => {
            this.updateSelectedMapOptions();
          },
        );
      });
  };

  selectOverlays = selectedOverlays => {
    // update the selected overlay and fetch data if a link metric is selected
    const linkOverlay = this.overlayStrategy.getOverlay(
      selectedOverlays.link_lines,
    );
    // load data if selected overlay is a metric
    // TODO - determine the changed metric instead of fetching the metric on
    // any layer change
    if (linkOverlay.type === 'metric') {
      this.setState(
        {
          linkOverlayMetrics: {},
          selectedOverlays,
        },
        () => {
          this.fetchOverlayData();
        },
      );
      // clear any existing schedule and schedule new metric
      clearInterval(this._refreshLinkMetricOverlayTimer);
      if (!(this.overlayStrategy instanceof HistoricalMetricsOverlayStrategy)) {
        this._refreshLinkMetricOverlayTimer = setInterval(
          this.fetchOverlayData,
          LINK_OVERLAY_METRIC_REFRESH_INTERVAL_MS,
        );
      }
    } else {
      this.setState({
        linkOverlayMetrics: {},
        selectedOverlays,
      });
    }
    this.updateSelectedMapOptions();
  };

  setNodeRoutes = (nodeName: ?string, routes?: Array<NodeRoute>) => {
    const {selectedLayers, routesOverlay} = this.state;
    if (!nodeName) {
      return this.setState({
        selectedLayers: {
          ...selectedLayers,
          routes: false,
        },
      });
    }
    this.setState({
      selectedLayers: {
        ...selectedLayers,
        routes: true,
      },
      routesOverlay: {
        selectedNode: nodeName,
        routeData: Object.assign({}, routesOverlay.routeData, {
          [nodeName]: routes,
        }),
      },
    });
    this.updateSelectedMapOptions();
  };

  onHistoricalTimeChange = selectedTime => {
    const {historicalDate} = this.state;
    const newDate = new Date(
      historicalDate.getTime() + selectedTime * MILLISECONDS_TO_MINUTES,
    );
    this.setState({selectedTime: newDate}, () => {
      this.fetchOverlayData();
      this.updateSelectedMapOptions();
    });
  };

  onHistoricalDateChange = date => {
    this.setState(
      {
        historicalDate: date,
        selectedTime: date,
      },
      () => {
        this.fetchOverlayData();
        this.updateSelectedMapOptions();
      },
    );
  };

  updateUrl(input: UrlInputType) {
    const {history} = this.props;
    const {isHistoricalOverlay, historicalDate, testId} = input;
    if (testId) {
      setUrlSearchParam(history, 'test', testId);
    } else if (isHistoricalOverlay) {
      setUrlSearchParam(history, 'date', historicalDate.toISOString());
    } else {
      deleteUrlSearchParam(history, 'date');
    }
  }

  setIsHistoricalOverlay = isHistoricalOverlay => {
    const {historicalDate} = this.state;
    this.updateUrl({isHistoricalOverlay, historicalDate});
    this.setState({isHistoricalOverlay, siteMapOverrides: null}, () => {
      this.fetchOverlayData();
      this.updateOverlayStrategy();
    });
  };

  layerSelectChange = selectedLayers => {
    this.setState({selectedLayers}, () => {
      this.updateSelectedMapOptions();
    });
  };

  render() {
    const {classes, match, history, location} = this.props;
    const {
      linkOverlayMetrics,
      mapRef,
      mapBounds,
      selectedMapStyle,
      showTable,
      tableHeight,
      routesOverlay,
      plannedSite,
      selectedLayers,
      nearbyNodes,
      routes,
      siteMapOverrides,
      hiddenSites,
      selectedOverlays,
      overlayLoading,
      historicalDate,
      selectedTime,
      isHistoricalOverlay,
      networkDrawerWidth,
    } = this.state;

    const overlaysConfig = this.overlayStrategy.getOverlaysConfig();

    return (
      <NetworkContext.Consumer>
        {context => (
          <RouteContext.Provider
            value={{
              ...routesOverlay,
              setNodeRoutes: this.setNodeRoutes,
            }}>
            <div className={classes.container}>
              <div className={classes.topContainer}>
                <MapBoxGL
                  fitBounds={mapBounds}
                  fitBoundsOptions={FIT_BOUND_OPTIONS}
                  style={selectedMapStyle}
                  onStyleLoad={map => this.setState({mapRef: map})}
                  containerStyle={{width: '100%', height: 'inherit'}}>
                  <TgMapboxGeocoder
                    accessToken={MAPBOX_ACCESS_TOKEN}
                    mapRef={mapRef}
                    onSelectFeature={this.onGeocoderEvent}
                    onSelectTopologyElement={context.setSelected}
                    nodeMap={context.nodeMap}
                    linkMap={context.linkMap}
                    siteMap={context.siteMap}
                    statusReports={
                      context.networkConfig?.status_dump?.statusReports
                    }
                  />
                  <ZoomControl />
                  <RotationControl style={{top: 80}} />
                  <Route
                    path={`${match.url}/:tableName?`}
                    render={routerProps => (
                      <TableControl
                        style={{left: 10, bottom: 10}}
                        baseUrl={match.url}
                        onToggleTable={this.onToggleTable}
                        {...routerProps}
                      />
                    )}
                  />
                  <MapLayers
                    context={context}
                    selectedLayers={selectedLayers}
                    plannedSite={plannedSite}
                    onPlannedSiteMoved={this.onPlannedSiteMoved}
                    nearbyNodes={nearbyNodes}
                    routes={routes}
                    siteMapOverrides={siteMapOverrides}
                    hiddenSites={hiddenSites}
                    selectedOverlays={selectedOverlays}
                    overlay={this.overlayStrategy.getOverlay(
                      selectedOverlays.link_lines,
                    )}
                    linkMetricData={linkOverlayMetrics}
                  />
                </MapBoxGL>
                <NetworkDrawer
                  context={context}
                  mapRef={mapRef}
                  mapLayersProps={{
                    overlaysConfig,
                    mapStylesConfig: this._mapBoxStyles,
                    selectedLayers,
                    selectedOverlays,
                    selectedMapStyle,
                    onLayerSelectChange: this.layerSelectChange,
                    onOverlaySelectChange: this.selectOverlays,
                    onMapStyleSelectChange: selectedMapStyle =>
                      this.setState({selectedMapStyle}),
                    overlayLoading: overlayLoading,
                    expanded: false,
                    onPanelChange: () => {},
                    onHistoricalTimeChange: this.onHistoricalTimeChange,
                    isHistoricalOverlay: isHistoricalOverlay,
                    setIsHistoricalOverlay: this.setIsHistoricalOverlay,
                    onHistoricalDateChange: this.onHistoricalDateChange,
                    historicalDate,
                    selectedTime,
                  }}
                  plannedSiteProps={{
                    plannedSite: plannedSite,
                    onUpdatePlannedSite: plannedSite =>
                      this.setState({plannedSite}),
                    hideSite: this.hideSite,
                    unhideSite: this.unhideSite,
                  }}
                  searchNearbyProps={{
                    nearbyNodes: nearbyNodes,
                    onUpdateNearbyNodes: nearbyNodes =>
                      this.setState({nearbyNodes}),
                  }}
                  routesProps={{
                    ...routes,
                    onUpdateRoutes: routes => {
                      this.setState({routes});
                    },
                  }}
                  networkTestId={getTestOverlayId(location)}
                  speedTestId={getSpeedTestId(location)}
                  onNetworkTestPanelClosed={this.exitTestOverlayMode}
                  onNetworkDrawerResize={networkDrawerWidth =>
                    this.setState({networkDrawerWidth})
                  }
                  networkDrawerWidth={networkDrawerWidth}
                />
              </div>
              {showTable && (
                <div
                  style={{
                    height: tableHeight,
                    width: `calc(100% - ${networkDrawerWidth}px)`,
                  }}>
                  <div className={classes.draggerContainer}>
                    <Dragger
                      direction="vertical"
                      minSize={TABLE_LIMITS.minHeight}
                      maxSize={TABLE_LIMITS.maxHeight}
                      onResize={this.handleTableResize}
                    />
                  </div>
                  <NetworkTables
                    selectedElement={context.selectedElement}
                    // fixes this component's usage of withRouter
                    match={match}
                    location={location}
                    history={history}
                    isEmbedded={true}
                  />
                </div>
              )}
            </div>
          </RouteContext.Provider>
        )}
      </NetworkContext.Consumer>
    );
  }

  /**
   * Decide which overlay strategy to use based on the current props / url
   * All strategy changes should create a new instance instead of modifying the
   * exising instance
   */
  updateOverlayStrategy = ({
    previousTestId,
  }: {previousTestId: ?string} = {}) => {
    const {location} = this.props;
    const {isHistoricalOverlay} = this.state;
    const testId = getTestOverlayId(location);
    let newOverlayStrategy = null;
    if (testId && testId !== previousTestId) {
      newOverlayStrategy = new TestExecutionOverlayStrategy({
        testId,
      });
    } else if (isHistoricalOverlay) {
      newOverlayStrategy = new HistoricalMetricsOverlayStrategy();
    } else if (!testId) {
      newOverlayStrategy = new MetricsOverlayStrategy();
    }

    // if the strategy has changed, load the new data
    if (
      newOverlayStrategy !== null &&
      newOverlayStrategy.constructor.name !==
        this.overlayStrategy.constructor.name
    ) {
      this.overlayStrategy = newOverlayStrategy;
      this.setState(
        {selectedOverlays: newOverlayStrategy.getDefaultOverlays()},
        () => {
          this.fetchOverlayData();
          this.updateSelectedMapOptions();
        },
      );
    }
  };

  exitTestOverlayMode = () => {
    const {history} = this.props;
    const urlWithoutOverlay = new URL(window.location);
    urlWithoutOverlay.searchParams.delete('test');
    history.replace(`${urlWithoutOverlay.pathname}${urlWithoutOverlay.search}`);
  };

  updateSelectedMapOptions() {
    const {updateNetworkMapOptions} = this.props;
    const {
      selectedLayers,
      selectedOverlays,
      historicalDate,
      selectedTime,
      linkOverlayMetrics,
    } = this.state;

    updateNetworkMapOptions({
      overlayStrategy: this.overlayStrategy,
      selectedLayers,
      selectedOverlays,
      historicalDate,
      selectedTime,
      linkOverlayMetrics,
    });
  }
}

export default withStyles(styles, {withTheme: true})(withRouter(NetworkMap));
