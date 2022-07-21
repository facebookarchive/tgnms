/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

/*
 * Copied from
 * https://github.com/mapbox/mapbox-gl-js-mock/blob/master/classes/map.js
 * and modified to work in our environment
 */

Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn().mockImplementation(() => 'blob:test://test.test'),
});

const {Evented, LngLat} = require('mapbox-gl');
const {union, bboxPolygon, buffer} = require('@turf/turf');

class Transform {}

class Style {
  stylesheet = {
    owner: 'mapbox',
    id: 'testmap',
  };
  loaded = () => {};
}

const defaultOptions = {
  doubleClickZoom: true,
};

function functor(x) {
  return function () {
    return x;
  };
}

function _fakeResourceTiming(name) {
  return {
    name: name,
    secureConnectionStart: 0,
    redirectEnd: 0,
    redirectStart: 0,
    workerStart: 0,
    startTime: 2886.775,
    connectStart: 2886.775,
    connectEnd: 2886.875,
    fetchStart: 2886.875,
    domainLookupStart: 2886.775,
    domainLookupEnd: 2886.875,
    requestStart: 2890.3700000000003,
    responseStart: 2893.1650000000004,
    responseEnd: 2893.78,
    duration: 7.005000000000109,
    entryType: 'resource',
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: 'http/1.1',
    encodedBodySize: 155,
    decodedBodySize: 155,
    serverTiming: [],
    transferSize: 443,
  };
}

const Map = function (options) {
  const evented = new Evented();
  this.on = evented.on;
  this.off = evented.off;
  this.fire = evented.fire;
  this.listens = evented.listens;

  this.options = {...defaultOptions, ...(options || {})};
  this._events = {};
  this._sources = {};
  this._collectResourceTiming = !!this.options.collectResourceTiming;
  this.zoom = this.options.zoom || 0;
  this.center = this.options.center
    ? new LngLat(this.options.center[0], this.options.center[1])
    : new LngLat(0, 0);
  this.style = new Style();
  this.transform = new Transform();
  this._controlCorners = {
    'top-left': {
      appendChild: function () {},
    },
  };
  setTimeout(
    function () {
      this.fire('load');
    }.bind(this),
    0,
  );

  const setters = [
    // Camera options
    'jumpTo',
    'panTo',
    'panBy',
    'setBearing',
    'setPitch',
    'setZoom',
    'fitBounds',
    'resetNorth',
    'snapToNorth',
    // Settings
    'setMaxBounds',
    'setMinZoom',
    'setMaxZoom',
    // Layer properties
    'setLayoutProperty',
    'setPaintProperty',
  ];
  const genericSetter = functor(this);
  for (let i = 0; i < setters.length; i++) {
    this[setters[i]] = genericSetter;
  }
};

Map.prototype.addControl = function (control) {
  control.onAdd(this);
};

Map.prototype.getContainer = function () {
  const container = {
    appendChild: function () {},
    removeChild: function () {},
    getElementsByClassName: function () {
      return [container];
    },
    addEventListener: function (_name, _handle) {},
    removeEventListener: function () {},
    classList: {
      add: function () {},
      remove: function () {},
    },
  };
  container.parentNode = container;
  return container;
};

Map.prototype.getSource = function (name) {
  if (this._sources[name]) {
    return {
      setData: function (data) {
        this._sources[name].data = data;
        if (this._sources[name].type === 'geojson') {
          const e = {
            type: 'data',
            sourceDataType: 'content',
            sourceId: name,
            isSourceLoaded: true,
            dataType: 'source',
            source: this._sources[name],
          };
          // typeof data === 'string' corresponds to an AJAX load
          if (this._collectResourceTiming && data && typeof data === 'string')
            e.resourceTiming = [_fakeResourceTiming(data)];
          this.fire('data', e);
        }
      }.bind(this),
      loadTile: function () {},
    };
  }
};

Map.prototype.loaded = function () {
  return true;
};

Map.prototype.addSource = function (name, source) {
  this._sources[name] = source;
  if (source.type === 'geojson') {
    const e = {
      type: 'data',
      sourceDataType: 'metadata',
      sourceId: name,
      isSourceLoaded: true,
      dataType: 'source',
      source: source,
    };
    if (
      this._collectResourceTiming &&
      source.data &&
      typeof source.data === 'string'
    )
      e.resourceTiming = [_fakeResourceTiming(source.data)];
    this.fire('data', e);
  }
};

Map.prototype.removeSource = function (name) {
  delete this._sources[name];
};

Map.prototype.addLayer = function (_layer, _before) {};
Map.prototype.removeLayer = function (_layerId) {};
Map.prototype.getLayer = function (_layerId) {};

Map.prototype.getZoom = function () {
  return this.zoom;
};
Map.prototype.getBearing = functor(0);
Map.prototype.getPitch = functor(0);
Map.prototype.getCenter = function () {
  return this.center;
};
Map.prototype.setCenter = function (x) {
  this.center = new LngLat(x[0], x[1]);
};

Map.prototype.doubleClickZoom = {
  disable: function () {},
  enable: function () {},
};

Map.prototype.boxZoom = {
  disable: function () {},
  enable: function () {},
};

Map.prototype.dragPan = {
  disable: function () {},
  enable: function () {},
};

Map.prototype.project = function () {};

/**
 * Returns an array of features that overlap with the pointOrBox
 * Currently it does not respect queryParams
 *
 * pointOrBox: either [x, y] pixel coordinates of a point,
 * or [ [x1, y1] , [x2, y2] ]
 */
Map.prototype.queryRenderedFeatures = function (pointOrBox, _queryParams) {
  let searchBoundingBox = [];
  if (pointOrBox[0].x !== undefined) {
    // convert point into bounding box
    searchBoundingBox = [
      Math.min(pointOrBox[0].x, pointOrBox[1].x),
      Math.min(pointOrBox[0].y, pointOrBox[1].y),
      Math.max(pointOrBox[0].x, pointOrBox[1].y),
      Math.max(pointOrBox[0].x, pointOrBox[1].y),
    ];
  } else {
    // convert box in bounding box
    searchBoundingBox = [
      Math.min(pointOrBox[0][0], pointOrBox[1][0]),
      Math.min(pointOrBox[0][1], pointOrBox[1][1]),
      Math.max(pointOrBox[0][0], pointOrBox[1][0]),
      Math.max(pointOrBox[0][1], pointOrBox[1][1]),
    ];
  }

  const searchPolygon = bboxPolygon(searchBoundingBox);
  let features = Object.keys(this._sources).reduce(
    (memo, name) => memo.concat(this._sources[name].data.features),
    [],
  );
  features = features.filter(feature => {
    let subFeatures = [];

    if (feature.geometry.type.startsWith('Multi')) {
      // Break multi features up into single features so we can look at each one
      const type = feature.geometry.type.replace('Multi', '');
      subFeatures = feature.geometry.coordinates.map(coords => {
        return {
          type: 'Feature',
          properties: feature.properties,
          geometry: {
            type: type,
            coordinates: coords,
          },
        };
      });
    } else {
      subFeatures.push(feature);
    }

    // union only works with polygons, so we convert points and lines into
    // polygons
    // TODO: Look into having this buffer match the style
    subFeatures = subFeatures.map(subFeature => {
      if (
        subFeature.geometry.type === 'Point' ||
        subFeature.geometry.type === 'LineString'
      ) {
        return buffer(subFeature, 0.00000001, 'kilometers');
      } else {
        return subFeature;
      }
    });

    // if any of the sub features intersect with the seach box, return true
    // if none of them intersect with the search box, return false
    return subFeatures.some(subFeature => {
      // union takes two polygons and merges them.
      // If they intersect it returns them merged Polygon geometry type
      // If they don't intersect it retuns them as a MultiPolygon geomentry type
      const merged = union(subFeature, searchPolygon);
      return merged.geometry.type === 'Polygon';
    });
  });

  return features;
};

Map.prototype.remove = function () {
  this._events = [];
  this.sources = [];
};

class FakeControl {
  /* Old Control API */
  addTo = () => {};
  /* New Control API */
  onAdd = () => {};
  onRemove = () => {};
  on = () => {};
}

export default {
  Map,
  Evented,
  LngLat,
  NavigationControl: FakeControl,
  ScaleControl: FakeControl,
  AttributionControl: FakeControl,
  GeolocateControl: FakeControl,
};
