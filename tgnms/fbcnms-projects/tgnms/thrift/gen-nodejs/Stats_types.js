//
// Autogenerated by Thrift Compiler (0.12.0)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//

var thrift = require('thrift');
var Thrift = thrift.Thrift;
var Q = thrift.Q;

var Topology_ttypes = require('./Topology_types');


var ttypes = module.exports = {};
ttypes.KeyUnit = {
  'NONE' : 0,
  'PERC' : 1,
  'BYTES_PER_SEC' : 2
};
ttypes.RestrictorType = {
  'NODE' : 1,
  'LINK' : 2
};
ttypes.TypeaheadType = {
  'KEYNAME' : 1,
  'NODENAME' : 3,
  'TOPOLOGYNAME' : 4
};
ttypes.LinkDirection = {
  'LINK_A' : 1,
  'LINK_Z' : 2
};
ttypes.StatsOutputFormat = {
  'POINTS' : 1,
  'TABLE' : 2,
  'RAW' : 3,
  'RAW_LINK' : 4,
  'RAW_NODE' : 5,
  'EVENT_LINK' : 10,
  'EVENT_NODE' : 11
};
ttypes.GraphAggregation = {
  'NONE' : 1,
  'LATEST' : 2,
  'AVG' : 10,
  'COUNT' : 15,
  'SUM' : 20,
  'TOP_AVG' : 30,
  'TOP_MIN' : 31,
  'TOP_MAX' : 32,
  'BOTTOM_AVG' : 40,
  'BOTTOM_MIN' : 41,
  'BOTTOM_MAX' : 42,
  'LINK_STATS' : 100
};
ttypes.LinkStateType = {
  'LINK_DOWN_OR_NOT_AVAIL' : 0,
  'LINK_UP' : 1,
  'LINK_UP_DATADOWN' : 2,
  'LINK_UP_AVAIL_UNKNOWN' : 3
};
var QueryRestrictor = module.exports.QueryRestrictor = function(args) {
  this.restrictorType = null;
  this.values = null;
  if (args) {
    if (args.restrictorType !== undefined && args.restrictorType !== null) {
      this.restrictorType = args.restrictorType;
    }
    if (args.values !== undefined && args.values !== null) {
      this.values = Thrift.copyList(args.values, [null]);
    }
  }
};
QueryRestrictor.prototype = {};
QueryRestrictor.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.I32) {
        this.restrictorType = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.LIST) {
        this.values = [];
        var _rtmp31 = input.readListBegin();
        var _size0 = _rtmp31.size || 0;
        for (var _i2 = 0; _i2 < _size0; ++_i2) {
          var elem3 = null;
          elem3 = input.readString();
          this.values.push(elem3);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

QueryRestrictor.prototype.write = function(output) {
  output.writeStructBegin('QueryRestrictor');
  if (this.restrictorType !== null && this.restrictorType !== undefined) {
    output.writeFieldBegin('restrictorType', Thrift.Type.I32, 1);
    output.writeI32(this.restrictorType);
    output.writeFieldEnd();
  }
  if (this.values !== null && this.values !== undefined) {
    output.writeFieldBegin('values', Thrift.Type.LIST, 2);
    output.writeListBegin(Thrift.Type.STRING, this.values.length);
    for (var iter4 in this.values) {
      if (this.values.hasOwnProperty(iter4)) {
        iter4 = this.values[iter4];
        output.writeString(iter4);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var TypeaheadRequest = module.exports.TypeaheadRequest = function(args) {
  this.topologyName = null;
  this.searchTerm = null;
  this.typeaheadType = 1;
  this.restrictors = null;
  this.noDuplicateKeyNames = false;
  this.debugLogToConsole = false;
  if (args) {
    if (args.topologyName !== undefined && args.topologyName !== null) {
      this.topologyName = args.topologyName;
    }
    if (args.searchTerm !== undefined && args.searchTerm !== null) {
      this.searchTerm = args.searchTerm;
    }
    if (args.typeaheadType !== undefined && args.typeaheadType !== null) {
      this.typeaheadType = args.typeaheadType;
    }
    if (args.restrictors !== undefined && args.restrictors !== null) {
      this.restrictors = Thrift.copyList(args.restrictors, [ttypes.QueryRestrictor]);
    }
    if (args.noDuplicateKeyNames !== undefined && args.noDuplicateKeyNames !== null) {
      this.noDuplicateKeyNames = args.noDuplicateKeyNames;
    }
    if (args.debugLogToConsole !== undefined && args.debugLogToConsole !== null) {
      this.debugLogToConsole = args.debugLogToConsole;
    }
  }
};
TypeaheadRequest.prototype = {};
TypeaheadRequest.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.STRING) {
        this.topologyName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.STRING) {
        this.searchTerm = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.I32) {
        this.typeaheadType = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 10:
      if (ftype == Thrift.Type.LIST) {
        this.restrictors = [];
        var _rtmp36 = input.readListBegin();
        var _size5 = _rtmp36.size || 0;
        for (var _i7 = 0; _i7 < _size5; ++_i7) {
          var elem8 = null;
          elem8 = new ttypes.QueryRestrictor();
          elem8.read(input);
          this.restrictors.push(elem8);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 11:
      if (ftype == Thrift.Type.BOOL) {
        this.noDuplicateKeyNames = input.readBool();
      } else {
        input.skip(ftype);
      }
      break;
      case 1000:
      if (ftype == Thrift.Type.BOOL) {
        this.debugLogToConsole = input.readBool();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

TypeaheadRequest.prototype.write = function(output) {
  output.writeStructBegin('TypeaheadRequest');
  if (this.topologyName !== null && this.topologyName !== undefined) {
    output.writeFieldBegin('topologyName', Thrift.Type.STRING, 1);
    output.writeString(this.topologyName);
    output.writeFieldEnd();
  }
  if (this.searchTerm !== null && this.searchTerm !== undefined) {
    output.writeFieldBegin('searchTerm', Thrift.Type.STRING, 2);
    output.writeString(this.searchTerm);
    output.writeFieldEnd();
  }
  if (this.typeaheadType !== null && this.typeaheadType !== undefined) {
    output.writeFieldBegin('typeaheadType', Thrift.Type.I32, 3);
    output.writeI32(this.typeaheadType);
    output.writeFieldEnd();
  }
  if (this.restrictors !== null && this.restrictors !== undefined) {
    output.writeFieldBegin('restrictors', Thrift.Type.LIST, 10);
    output.writeListBegin(Thrift.Type.STRUCT, this.restrictors.length);
    for (var iter9 in this.restrictors) {
      if (this.restrictors.hasOwnProperty(iter9)) {
        iter9 = this.restrictors[iter9];
        iter9.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.noDuplicateKeyNames !== null && this.noDuplicateKeyNames !== undefined) {
    output.writeFieldBegin('noDuplicateKeyNames', Thrift.Type.BOOL, 11);
    output.writeBool(this.noDuplicateKeyNames);
    output.writeFieldEnd();
  }
  if (this.debugLogToConsole !== null && this.debugLogToConsole !== undefined) {
    output.writeFieldBegin('debugLogToConsole', Thrift.Type.BOOL, 1000);
    output.writeBool(this.debugLogToConsole);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var KeyMetaData = module.exports.KeyMetaData = function(args) {
  this.keyName = null;
  this.shortName = null;
  this.srcNodeMac = null;
  this.srcNodeName = null;
  this.peerNodeMac = null;
  this.linkName = null;
  this.linkDirection = null;
  this.topologyName = null;
  this.unit = null;
  if (args) {
    if (args.keyName !== undefined && args.keyName !== null) {
      this.keyName = args.keyName;
    }
    if (args.shortName !== undefined && args.shortName !== null) {
      this.shortName = args.shortName;
    }
    if (args.srcNodeMac !== undefined && args.srcNodeMac !== null) {
      this.srcNodeMac = args.srcNodeMac;
    }
    if (args.srcNodeName !== undefined && args.srcNodeName !== null) {
      this.srcNodeName = args.srcNodeName;
    }
    if (args.peerNodeMac !== undefined && args.peerNodeMac !== null) {
      this.peerNodeMac = args.peerNodeMac;
    }
    if (args.linkName !== undefined && args.linkName !== null) {
      this.linkName = args.linkName;
    }
    if (args.linkDirection !== undefined && args.linkDirection !== null) {
      this.linkDirection = args.linkDirection;
    }
    if (args.topologyName !== undefined && args.topologyName !== null) {
      this.topologyName = args.topologyName;
    }
    if (args.unit !== undefined && args.unit !== null) {
      this.unit = args.unit;
    }
  }
};
KeyMetaData.prototype = {};
KeyMetaData.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 2:
      if (ftype == Thrift.Type.STRING) {
        this.keyName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.STRING) {
        this.shortName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 10:
      if (ftype == Thrift.Type.STRING) {
        this.srcNodeMac = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 11:
      if (ftype == Thrift.Type.STRING) {
        this.srcNodeName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 21:
      if (ftype == Thrift.Type.STRING) {
        this.peerNodeMac = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 30:
      if (ftype == Thrift.Type.STRING) {
        this.linkName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 31:
      if (ftype == Thrift.Type.I32) {
        this.linkDirection = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 32:
      if (ftype == Thrift.Type.STRING) {
        this.topologyName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 100:
      if (ftype == Thrift.Type.I32) {
        this.unit = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

KeyMetaData.prototype.write = function(output) {
  output.writeStructBegin('KeyMetaData');
  if (this.keyName !== null && this.keyName !== undefined) {
    output.writeFieldBegin('keyName', Thrift.Type.STRING, 2);
    output.writeString(this.keyName);
    output.writeFieldEnd();
  }
  if (this.shortName !== null && this.shortName !== undefined) {
    output.writeFieldBegin('shortName', Thrift.Type.STRING, 3);
    output.writeString(this.shortName);
    output.writeFieldEnd();
  }
  if (this.srcNodeMac !== null && this.srcNodeMac !== undefined) {
    output.writeFieldBegin('srcNodeMac', Thrift.Type.STRING, 10);
    output.writeString(this.srcNodeMac);
    output.writeFieldEnd();
  }
  if (this.srcNodeName !== null && this.srcNodeName !== undefined) {
    output.writeFieldBegin('srcNodeName', Thrift.Type.STRING, 11);
    output.writeString(this.srcNodeName);
    output.writeFieldEnd();
  }
  if (this.peerNodeMac !== null && this.peerNodeMac !== undefined) {
    output.writeFieldBegin('peerNodeMac', Thrift.Type.STRING, 21);
    output.writeString(this.peerNodeMac);
    output.writeFieldEnd();
  }
  if (this.linkName !== null && this.linkName !== undefined) {
    output.writeFieldBegin('linkName', Thrift.Type.STRING, 30);
    output.writeString(this.linkName);
    output.writeFieldEnd();
  }
  if (this.linkDirection !== null && this.linkDirection !== undefined) {
    output.writeFieldBegin('linkDirection', Thrift.Type.I32, 31);
    output.writeI32(this.linkDirection);
    output.writeFieldEnd();
  }
  if (this.topologyName !== null && this.topologyName !== undefined) {
    output.writeFieldBegin('topologyName', Thrift.Type.STRING, 32);
    output.writeString(this.topologyName);
    output.writeFieldEnd();
  }
  if (this.unit !== null && this.unit !== undefined) {
    output.writeFieldBegin('unit', Thrift.Type.I32, 100);
    output.writeI32(this.unit);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var TypeaheadResponse = module.exports.TypeaheadResponse = function(args) {
  this.results = null;
  if (args) {
    if (args.results !== undefined && args.results !== null) {
      this.results = Thrift.copyMap(args.results, [Thrift.copyList, ttypes.KeyMetaData]);
    }
  }
};
TypeaheadResponse.prototype = {};
TypeaheadResponse.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.MAP) {
        this.results = {};
        var _rtmp311 = input.readMapBegin();
        var _size10 = _rtmp311.size || 0;
        for (var _i12 = 0; _i12 < _size10; ++_i12) {
          var key13 = null;
          var val14 = null;
          key13 = input.readString();
          val14 = [];
          var _rtmp316 = input.readListBegin();
          var _size15 = _rtmp316.size || 0;
          for (var _i17 = 0; _i17 < _size15; ++_i17) {
            var elem18 = null;
            elem18 = new ttypes.KeyMetaData();
            elem18.read(input);
            val14.push(elem18);
          }
          input.readListEnd();
          this.results[key13] = val14;
        }
        input.readMapEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 0:
        input.skip(ftype);
        break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

TypeaheadResponse.prototype.write = function(output) {
  output.writeStructBegin('TypeaheadResponse');
  if (this.results !== null && this.results !== undefined) {
    output.writeFieldBegin('results', Thrift.Type.MAP, 1);
    output.writeMapBegin(Thrift.Type.STRING, Thrift.Type.LIST, Thrift.objectLength(this.results));
    for (var kiter19 in this.results) {
      if (this.results.hasOwnProperty(kiter19)) {
        var viter20 = this.results[kiter19];
        output.writeString(kiter19);
        output.writeListBegin(Thrift.Type.STRUCT, viter20.length);
        for (var iter21 in viter20) {
          if (viter20.hasOwnProperty(iter21)) {
            iter21 = viter20[iter21];
            iter21.write(output);
          }
        }
        output.writeListEnd();
      }
    }
    output.writeMapEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var QueryRequest = module.exports.QueryRequest = function(args) {
  this.topologyName = null;
  this.keyNames = null;
  this.aggregation = 1;
  this.maxResults = 10;
  this.maxDataPoints = 0;
  this.restrictors = null;
  this.outputFormat = 1;
  this.countPerSecond = 39;
  this.minAgo = null;
  this.startTsSec = null;
  this.endTsSec = null;
  this.dsIntervalSec = 30;
  this.debugLogToConsole = false;
  if (args) {
    if (args.topologyName !== undefined && args.topologyName !== null) {
      this.topologyName = args.topologyName;
    }
    if (args.keyNames !== undefined && args.keyNames !== null) {
      this.keyNames = Thrift.copyList(args.keyNames, [null]);
    }
    if (args.aggregation !== undefined && args.aggregation !== null) {
      this.aggregation = args.aggregation;
    }
    if (args.maxResults !== undefined && args.maxResults !== null) {
      this.maxResults = args.maxResults;
    }
    if (args.maxDataPoints !== undefined && args.maxDataPoints !== null) {
      this.maxDataPoints = args.maxDataPoints;
    }
    if (args.restrictors !== undefined && args.restrictors !== null) {
      this.restrictors = Thrift.copyList(args.restrictors, [ttypes.QueryRestrictor]);
    }
    if (args.outputFormat !== undefined && args.outputFormat !== null) {
      this.outputFormat = args.outputFormat;
    }
    if (args.countPerSecond !== undefined && args.countPerSecond !== null) {
      this.countPerSecond = args.countPerSecond;
    }
    if (args.minAgo !== undefined && args.minAgo !== null) {
      this.minAgo = args.minAgo;
    }
    if (args.startTsSec !== undefined && args.startTsSec !== null) {
      this.startTsSec = args.startTsSec;
    }
    if (args.endTsSec !== undefined && args.endTsSec !== null) {
      this.endTsSec = args.endTsSec;
    }
    if (args.dsIntervalSec !== undefined && args.dsIntervalSec !== null) {
      this.dsIntervalSec = args.dsIntervalSec;
    }
    if (args.debugLogToConsole !== undefined && args.debugLogToConsole !== null) {
      this.debugLogToConsole = args.debugLogToConsole;
    }
  }
};
QueryRequest.prototype = {};
QueryRequest.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.STRING) {
        this.topologyName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.LIST) {
        this.keyNames = [];
        var _rtmp323 = input.readListBegin();
        var _size22 = _rtmp323.size || 0;
        for (var _i24 = 0; _i24 < _size22; ++_i24) {
          var elem25 = null;
          elem25 = input.readString();
          this.keyNames.push(elem25);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.I32) {
        this.aggregation = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.I32) {
        this.maxResults = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 5:
      if (ftype == Thrift.Type.I32) {
        this.maxDataPoints = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 10:
      if (ftype == Thrift.Type.LIST) {
        this.restrictors = [];
        var _rtmp327 = input.readListBegin();
        var _size26 = _rtmp327.size || 0;
        for (var _i28 = 0; _i28 < _size26; ++_i28) {
          var elem29 = null;
          elem29 = new ttypes.QueryRestrictor();
          elem29.read(input);
          this.restrictors.push(elem29);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 20:
      if (ftype == Thrift.Type.I32) {
        this.outputFormat = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 21:
      if (ftype == Thrift.Type.DOUBLE) {
        this.countPerSecond = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      case 100:
      if (ftype == Thrift.Type.I32) {
        this.minAgo = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 101:
      if (ftype == Thrift.Type.I64) {
        this.startTsSec = input.readI64();
      } else {
        input.skip(ftype);
      }
      break;
      case 102:
      if (ftype == Thrift.Type.I64) {
        this.endTsSec = input.readI64();
      } else {
        input.skip(ftype);
      }
      break;
      case 110:
      if (ftype == Thrift.Type.I32) {
        this.dsIntervalSec = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 1000:
      if (ftype == Thrift.Type.BOOL) {
        this.debugLogToConsole = input.readBool();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

QueryRequest.prototype.write = function(output) {
  output.writeStructBegin('QueryRequest');
  if (this.topologyName !== null && this.topologyName !== undefined) {
    output.writeFieldBegin('topologyName', Thrift.Type.STRING, 1);
    output.writeString(this.topologyName);
    output.writeFieldEnd();
  }
  if (this.keyNames !== null && this.keyNames !== undefined) {
    output.writeFieldBegin('keyNames', Thrift.Type.LIST, 2);
    output.writeListBegin(Thrift.Type.STRING, this.keyNames.length);
    for (var iter30 in this.keyNames) {
      if (this.keyNames.hasOwnProperty(iter30)) {
        iter30 = this.keyNames[iter30];
        output.writeString(iter30);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.aggregation !== null && this.aggregation !== undefined) {
    output.writeFieldBegin('aggregation', Thrift.Type.I32, 3);
    output.writeI32(this.aggregation);
    output.writeFieldEnd();
  }
  if (this.maxResults !== null && this.maxResults !== undefined) {
    output.writeFieldBegin('maxResults', Thrift.Type.I32, 4);
    output.writeI32(this.maxResults);
    output.writeFieldEnd();
  }
  if (this.maxDataPoints !== null && this.maxDataPoints !== undefined) {
    output.writeFieldBegin('maxDataPoints', Thrift.Type.I32, 5);
    output.writeI32(this.maxDataPoints);
    output.writeFieldEnd();
  }
  if (this.restrictors !== null && this.restrictors !== undefined) {
    output.writeFieldBegin('restrictors', Thrift.Type.LIST, 10);
    output.writeListBegin(Thrift.Type.STRUCT, this.restrictors.length);
    for (var iter31 in this.restrictors) {
      if (this.restrictors.hasOwnProperty(iter31)) {
        iter31 = this.restrictors[iter31];
        iter31.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.outputFormat !== null && this.outputFormat !== undefined) {
    output.writeFieldBegin('outputFormat', Thrift.Type.I32, 20);
    output.writeI32(this.outputFormat);
    output.writeFieldEnd();
  }
  if (this.countPerSecond !== null && this.countPerSecond !== undefined) {
    output.writeFieldBegin('countPerSecond', Thrift.Type.DOUBLE, 21);
    output.writeDouble(this.countPerSecond);
    output.writeFieldEnd();
  }
  if (this.minAgo !== null && this.minAgo !== undefined) {
    output.writeFieldBegin('minAgo', Thrift.Type.I32, 100);
    output.writeI32(this.minAgo);
    output.writeFieldEnd();
  }
  if (this.startTsSec !== null && this.startTsSec !== undefined) {
    output.writeFieldBegin('startTsSec', Thrift.Type.I64, 101);
    output.writeI64(this.startTsSec);
    output.writeFieldEnd();
  }
  if (this.endTsSec !== null && this.endTsSec !== undefined) {
    output.writeFieldBegin('endTsSec', Thrift.Type.I64, 102);
    output.writeI64(this.endTsSec);
    output.writeFieldEnd();
  }
  if (this.dsIntervalSec !== null && this.dsIntervalSec !== undefined) {
    output.writeFieldBegin('dsIntervalSec', Thrift.Type.I32, 110);
    output.writeI32(this.dsIntervalSec);
    output.writeFieldEnd();
  }
  if (this.debugLogToConsole !== null && this.debugLogToConsole !== undefined) {
    output.writeFieldBegin('debugLogToConsole', Thrift.Type.BOOL, 1000);
    output.writeBool(this.debugLogToConsole);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var EventDescription = module.exports.EventDescription = function(args) {
  this.dbId = null;
  this.startTime = null;
  this.endTime = null;
  this.description = null;
  this.linkState = null;
  if (args) {
    if (args.dbId !== undefined && args.dbId !== null) {
      this.dbId = args.dbId;
    }
    if (args.startTime !== undefined && args.startTime !== null) {
      this.startTime = args.startTime;
    }
    if (args.endTime !== undefined && args.endTime !== null) {
      this.endTime = args.endTime;
    }
    if (args.description !== undefined && args.description !== null) {
      this.description = args.description;
    }
    if (args.linkState !== undefined && args.linkState !== null) {
      this.linkState = args.linkState;
    }
  }
};
EventDescription.prototype = {};
EventDescription.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.I64) {
        this.dbId = input.readI64();
      } else {
        input.skip(ftype);
      }
      break;
      case 10:
      if (ftype == Thrift.Type.I64) {
        this.startTime = input.readI64();
      } else {
        input.skip(ftype);
      }
      break;
      case 11:
      if (ftype == Thrift.Type.I64) {
        this.endTime = input.readI64();
      } else {
        input.skip(ftype);
      }
      break;
      case 20:
      if (ftype == Thrift.Type.STRING) {
        this.description = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 21:
      if (ftype == Thrift.Type.I32) {
        this.linkState = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

EventDescription.prototype.write = function(output) {
  output.writeStructBegin('EventDescription');
  if (this.dbId !== null && this.dbId !== undefined) {
    output.writeFieldBegin('dbId', Thrift.Type.I64, 1);
    output.writeI64(this.dbId);
    output.writeFieldEnd();
  }
  if (this.startTime !== null && this.startTime !== undefined) {
    output.writeFieldBegin('startTime', Thrift.Type.I64, 10);
    output.writeI64(this.startTime);
    output.writeFieldEnd();
  }
  if (this.endTime !== null && this.endTime !== undefined) {
    output.writeFieldBegin('endTime', Thrift.Type.I64, 11);
    output.writeI64(this.endTime);
    output.writeFieldEnd();
  }
  if (this.description !== null && this.description !== undefined) {
    output.writeFieldBegin('description', Thrift.Type.STRING, 20);
    output.writeString(this.description);
    output.writeFieldEnd();
  }
  if (this.linkState !== null && this.linkState !== undefined) {
    output.writeFieldBegin('linkState', Thrift.Type.I32, 21);
    output.writeI32(this.linkState);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var EventList = module.exports.EventList = function(args) {
  this.linkAlive = null;
  this.events = null;
  this.linkAvailForData = null;
  if (args) {
    if (args.linkAlive !== undefined && args.linkAlive !== null) {
      this.linkAlive = args.linkAlive;
    }
    if (args.events !== undefined && args.events !== null) {
      this.events = Thrift.copyList(args.events, [ttypes.EventDescription]);
    }
    if (args.linkAvailForData !== undefined && args.linkAvailForData !== null) {
      this.linkAvailForData = args.linkAvailForData;
    }
  }
};
EventList.prototype = {};
EventList.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.DOUBLE) {
        this.linkAlive = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.LIST) {
        this.events = [];
        var _rtmp333 = input.readListBegin();
        var _size32 = _rtmp333.size || 0;
        for (var _i34 = 0; _i34 < _size32; ++_i34) {
          var elem35 = null;
          elem35 = new ttypes.EventDescription();
          elem35.read(input);
          this.events.push(elem35);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.DOUBLE) {
        this.linkAvailForData = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

EventList.prototype.write = function(output) {
  output.writeStructBegin('EventList');
  if (this.linkAlive !== null && this.linkAlive !== undefined) {
    output.writeFieldBegin('linkAlive', Thrift.Type.DOUBLE, 1);
    output.writeDouble(this.linkAlive);
    output.writeFieldEnd();
  }
  if (this.events !== null && this.events !== undefined) {
    output.writeFieldBegin('events', Thrift.Type.LIST, 2);
    output.writeListBegin(Thrift.Type.STRUCT, this.events.length);
    for (var iter36 in this.events) {
      if (this.events.hasOwnProperty(iter36)) {
        iter36 = this.events[iter36];
        iter36.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.linkAvailForData !== null && this.linkAvailForData !== undefined) {
    output.writeFieldBegin('linkAvailForData', Thrift.Type.DOUBLE, 3);
    output.writeDouble(this.linkAvailForData);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var OutputFormatEvents = module.exports.OutputFormatEvents = function(args) {
  this.startTime = null;
  this.endTime = null;
  this.events = null;
  if (args) {
    if (args.startTime !== undefined && args.startTime !== null) {
      this.startTime = args.startTime;
    }
    if (args.endTime !== undefined && args.endTime !== null) {
      this.endTime = args.endTime;
    }
    if (args.events !== undefined && args.events !== null) {
      this.events = Thrift.copyMap(args.events, [ttypes.EventList]);
    }
  }
};
OutputFormatEvents.prototype = {};
OutputFormatEvents.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.I64) {
        this.startTime = input.readI64();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.I64) {
        this.endTime = input.readI64();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.MAP) {
        this.events = {};
        var _rtmp338 = input.readMapBegin();
        var _size37 = _rtmp338.size || 0;
        for (var _i39 = 0; _i39 < _size37; ++_i39) {
          var key40 = null;
          var val41 = null;
          key40 = input.readString();
          val41 = new ttypes.EventList();
          val41.read(input);
          this.events[key40] = val41;
        }
        input.readMapEnd();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

OutputFormatEvents.prototype.write = function(output) {
  output.writeStructBegin('OutputFormatEvents');
  if (this.startTime !== null && this.startTime !== undefined) {
    output.writeFieldBegin('startTime', Thrift.Type.I64, 1);
    output.writeI64(this.startTime);
    output.writeFieldEnd();
  }
  if (this.endTime !== null && this.endTime !== undefined) {
    output.writeFieldBegin('endTime', Thrift.Type.I64, 2);
    output.writeI64(this.endTime);
    output.writeFieldEnd();
  }
  if (this.events !== null && this.events !== undefined) {
    output.writeFieldBegin('events', Thrift.Type.MAP, 3);
    output.writeMapBegin(Thrift.Type.STRING, Thrift.Type.STRUCT, Thrift.objectLength(this.events));
    for (var kiter42 in this.events) {
      if (this.events.hasOwnProperty(kiter42)) {
        var viter43 = this.events[kiter42];
        output.writeString(kiter42);
        viter43.write(output);
      }
    }
    output.writeMapEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var LinkMetric = module.exports.LinkMetric = function(args) {
  this.shortName = null;
  this.keyName = null;
  this.keyPrefix = null;
  this.description = null;
  if (args) {
    if (args.shortName !== undefined && args.shortName !== null) {
      this.shortName = args.shortName;
    }
    if (args.keyName !== undefined && args.keyName !== null) {
      this.keyName = args.keyName;
    }
    if (args.keyPrefix !== undefined && args.keyPrefix !== null) {
      this.keyPrefix = args.keyPrefix;
    }
    if (args.description !== undefined && args.description !== null) {
      this.description = args.description;
    }
  }
};
LinkMetric.prototype = {};
LinkMetric.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.STRING) {
        this.shortName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 10:
      if (ftype == Thrift.Type.STRING) {
        this.keyName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 11:
      if (ftype == Thrift.Type.STRING) {
        this.keyPrefix = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 20:
      if (ftype == Thrift.Type.STRING) {
        this.description = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

LinkMetric.prototype.write = function(output) {
  output.writeStructBegin('LinkMetric');
  if (this.shortName !== null && this.shortName !== undefined) {
    output.writeFieldBegin('shortName', Thrift.Type.STRING, 1);
    output.writeString(this.shortName);
    output.writeFieldEnd();
  }
  if (this.keyName !== null && this.keyName !== undefined) {
    output.writeFieldBegin('keyName', Thrift.Type.STRING, 10);
    output.writeString(this.keyName);
    output.writeFieldEnd();
  }
  if (this.keyPrefix !== null && this.keyPrefix !== undefined) {
    output.writeFieldBegin('keyPrefix', Thrift.Type.STRING, 11);
    output.writeString(this.keyPrefix);
    output.writeFieldEnd();
  }
  if (this.description !== null && this.description !== undefined) {
    output.writeFieldBegin('description', Thrift.Type.STRING, 20);
    output.writeString(this.description);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

