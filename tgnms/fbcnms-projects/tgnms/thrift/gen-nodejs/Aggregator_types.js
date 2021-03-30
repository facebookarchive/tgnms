//
// Autogenerated by Thrift Compiler (0.12.0)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//

var thrift = require('thrift');
var Thrift = thrift.Thrift;
var Q = thrift.Q;

var Monitor_ttypes = require('./Monitor_types');


var ttypes = module.exports = {};
ttypes.AggrMessageType = {
  'GET_STATUS_DUMP' : 101,
  'STATUS_DUMP' : 201,
  'GET_ALERTS_CONFIG' : 501,
  'GET_ALERTS_CONFIG_RESP' : 502,
  'SET_ALERTS_CONFIG' : 503,
  'SET_ALERTS_CONFIG_RESP' : 504,
  'STATS_REPORT' : 402,
  'HIGH_FREQUENCY_STATS_REPORT' : 403,
  'SYSLOG_REPORT' : 451,
  'PING' : 301,
  'PONG' : 302,
  'GET_AGGR_CONFIG_REQ' : 601,
  'GET_AGGR_CONFIG_RESP' : 602,
  'SET_AGGR_CONFIG_REQ' : 603,
  'GET_AGGR_CONFIG_METADATA_REQ' : 604,
  'GET_AGGR_CONFIG_METADATA_RESP' : 605,
  'AGGR_ACK' : 1001,
  'GET_TOPOLOGY' : 1002,
  'TOPOLOGY' : 1003
};
ttypes.AggrAlertComparator = {
  'ALERT_GT' : 0,
  'ALERT_GTE' : 1,
  'ALERT_LT' : 2,
  'ALERT_LTE' : 3
};
ttypes.AggrAlertLevel = {
  'ALERT_INFO' : 0,
  'ALERT_WARNING' : 1,
  'ALERT_CRITICAL' : 2
};
ttypes.AggrCompressionFormat = {
  'SNAPPY' : 1
};
var AggrGetStatusDump = module.exports.AggrGetStatusDump = function(args) {
};
AggrGetStatusDump.prototype = {};
AggrGetStatusDump.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    input.skip(ftype);
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

AggrGetStatusDump.prototype.write = function(output) {
  output.writeStructBegin('AggrGetStatusDump');
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrStatusDump = module.exports.AggrStatusDump = function(args) {
  this.version = null;
  if (args) {
    if (args.version !== undefined && args.version !== null) {
      this.version = args.version;
    }
  }
};
AggrStatusDump.prototype = {};
AggrStatusDump.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 3:
      if (ftype == Thrift.Type.STRING) {
        this.version = input.readString();
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

AggrStatusDump.prototype.write = function(output) {
  output.writeStructBegin('AggrStatusDump');
  if (this.version !== null && this.version !== undefined) {
    output.writeFieldBegin('version', Thrift.Type.STRING, 3);
    output.writeString(this.version);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrStat = module.exports.AggrStat = function(args) {
  this.key = null;
  this.timestamp = null;
  this.value = null;
  this.isCounter = null;
  if (args) {
    if (args.key !== undefined && args.key !== null) {
      this.key = args.key;
    }
    if (args.timestamp !== undefined && args.timestamp !== null) {
      this.timestamp = args.timestamp;
    }
    if (args.value !== undefined && args.value !== null) {
      this.value = args.value;
    }
    if (args.isCounter !== undefined && args.isCounter !== null) {
      this.isCounter = args.isCounter;
    }
  }
};
AggrStat.prototype = {};
AggrStat.prototype.read = function(input) {
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
        this.key = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.I64) {
        this.timestamp = input.readI64();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.DOUBLE) {
        this.value = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.BOOL) {
        this.isCounter = input.readBool();
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

AggrStat.prototype.write = function(output) {
  output.writeStructBegin('AggrStat');
  if (this.key !== null && this.key !== undefined) {
    output.writeFieldBegin('key', Thrift.Type.STRING, 1);
    output.writeString(this.key);
    output.writeFieldEnd();
  }
  if (this.timestamp !== null && this.timestamp !== undefined) {
    output.writeFieldBegin('timestamp', Thrift.Type.I64, 2);
    output.writeI64(this.timestamp);
    output.writeFieldEnd();
  }
  if (this.value !== null && this.value !== undefined) {
    output.writeFieldBegin('value', Thrift.Type.DOUBLE, 3);
    output.writeDouble(this.value);
    output.writeFieldEnd();
  }
  if (this.isCounter !== null && this.isCounter !== undefined) {
    output.writeFieldBegin('isCounter', Thrift.Type.BOOL, 4);
    output.writeBool(this.isCounter);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrStatsReport = module.exports.AggrStatsReport = function(args) {
  this.stats = null;
  this.events = null;
  if (args) {
    if (args.stats !== undefined && args.stats !== null) {
      this.stats = Thrift.copyList(args.stats, [ttypes.AggrStat]);
    }
    if (args.events !== undefined && args.events !== null) {
      this.events = Thrift.copyList(args.events, [Monitor_ttypes.EventLog]);
    }
  }
};
AggrStatsReport.prototype = {};
AggrStatsReport.prototype.read = function(input) {
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
      if (ftype == Thrift.Type.LIST) {
        this.stats = [];
        var _rtmp31 = input.readListBegin();
        var _size0 = _rtmp31.size || 0;
        for (var _i2 = 0; _i2 < _size0; ++_i2) {
          var elem3 = null;
          elem3 = new ttypes.AggrStat();
          elem3.read(input);
          this.stats.push(elem3);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.LIST) {
        this.events = [];
        var _rtmp35 = input.readListBegin();
        var _size4 = _rtmp35.size || 0;
        for (var _i6 = 0; _i6 < _size4; ++_i6) {
          var elem7 = null;
          elem7 = new Monitor_ttypes.EventLog();
          elem7.read(input);
          this.events.push(elem7);
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

AggrStatsReport.prototype.write = function(output) {
  output.writeStructBegin('AggrStatsReport');
  if (this.stats !== null && this.stats !== undefined) {
    output.writeFieldBegin('stats', Thrift.Type.LIST, 1);
    output.writeListBegin(Thrift.Type.STRUCT, this.stats.length);
    for (var iter8 in this.stats) {
      if (this.stats.hasOwnProperty(iter8)) {
        iter8 = this.stats[iter8];
        iter8.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.events !== null && this.events !== undefined) {
    output.writeFieldBegin('events', Thrift.Type.LIST, 2);
    output.writeListBegin(Thrift.Type.STRUCT, this.events.length);
    for (var iter9 in this.events) {
      if (this.events.hasOwnProperty(iter9)) {
        iter9 = this.events[iter9];
        iter9.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrAlertConf = module.exports.AggrAlertConf = function(args) {
  this.id = null;
  this.key = null;
  this.threshold = null;
  this.comp = null;
  this.level = null;
  this.nodeMac = null;
  if (args) {
    if (args.id !== undefined && args.id !== null) {
      this.id = args.id;
    }
    if (args.key !== undefined && args.key !== null) {
      this.key = args.key;
    }
    if (args.threshold !== undefined && args.threshold !== null) {
      this.threshold = args.threshold;
    }
    if (args.comp !== undefined && args.comp !== null) {
      this.comp = args.comp;
    }
    if (args.level !== undefined && args.level !== null) {
      this.level = args.level;
    }
    if (args.nodeMac !== undefined && args.nodeMac !== null) {
      this.nodeMac = args.nodeMac;
    }
  }
};
AggrAlertConf.prototype = {};
AggrAlertConf.prototype.read = function(input) {
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
        this.id = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.STRING) {
        this.key = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.DOUBLE) {
        this.threshold = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.I32) {
        this.comp = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 5:
      if (ftype == Thrift.Type.I32) {
        this.level = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 6:
      if (ftype == Thrift.Type.STRING) {
        this.nodeMac = input.readString();
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

AggrAlertConf.prototype.write = function(output) {
  output.writeStructBegin('AggrAlertConf');
  if (this.id !== null && this.id !== undefined) {
    output.writeFieldBegin('id', Thrift.Type.STRING, 1);
    output.writeString(this.id);
    output.writeFieldEnd();
  }
  if (this.key !== null && this.key !== undefined) {
    output.writeFieldBegin('key', Thrift.Type.STRING, 2);
    output.writeString(this.key);
    output.writeFieldEnd();
  }
  if (this.threshold !== null && this.threshold !== undefined) {
    output.writeFieldBegin('threshold', Thrift.Type.DOUBLE, 3);
    output.writeDouble(this.threshold);
    output.writeFieldEnd();
  }
  if (this.comp !== null && this.comp !== undefined) {
    output.writeFieldBegin('comp', Thrift.Type.I32, 4);
    output.writeI32(this.comp);
    output.writeFieldEnd();
  }
  if (this.level !== null && this.level !== undefined) {
    output.writeFieldBegin('level', Thrift.Type.I32, 5);
    output.writeI32(this.level);
    output.writeFieldEnd();
  }
  if (this.nodeMac !== null && this.nodeMac !== undefined) {
    output.writeFieldBegin('nodeMac', Thrift.Type.STRING, 6);
    output.writeString(this.nodeMac);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrAlertConfList = module.exports.AggrAlertConfList = function(args) {
  this.alerts = null;
  if (args) {
    if (args.alerts !== undefined && args.alerts !== null) {
      this.alerts = Thrift.copyList(args.alerts, [ttypes.AggrAlertConf]);
    }
  }
};
AggrAlertConfList.prototype = {};
AggrAlertConfList.prototype.read = function(input) {
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
      if (ftype == Thrift.Type.LIST) {
        this.alerts = [];
        var _rtmp311 = input.readListBegin();
        var _size10 = _rtmp311.size || 0;
        for (var _i12 = 0; _i12 < _size10; ++_i12) {
          var elem13 = null;
          elem13 = new ttypes.AggrAlertConf();
          elem13.read(input);
          this.alerts.push(elem13);
        }
        input.readListEnd();
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

AggrAlertConfList.prototype.write = function(output) {
  output.writeStructBegin('AggrAlertConfList');
  if (this.alerts !== null && this.alerts !== undefined) {
    output.writeFieldBegin('alerts', Thrift.Type.LIST, 1);
    output.writeListBegin(Thrift.Type.STRUCT, this.alerts.length);
    for (var iter14 in this.alerts) {
      if (this.alerts.hasOwnProperty(iter14)) {
        iter14 = this.alerts[iter14];
        iter14.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrSetAlertsConfigResp = module.exports.AggrSetAlertsConfigResp = function(args) {
  this.success = null;
  if (args) {
    if (args.success !== undefined && args.success !== null) {
      this.success = args.success;
    }
  }
};
AggrSetAlertsConfigResp.prototype = {};
AggrSetAlertsConfigResp.prototype.read = function(input) {
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
      if (ftype == Thrift.Type.BOOL) {
        this.success = input.readBool();
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

AggrSetAlertsConfigResp.prototype.write = function(output) {
  output.writeStructBegin('AggrSetAlertsConfigResp');
  if (this.success !== null && this.success !== undefined) {
    output.writeFieldBegin('success', Thrift.Type.BOOL, 1);
    output.writeBool(this.success);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrSyslog = module.exports.AggrSyslog = function(args) {
  this.timestamp = null;
  this.index = null;
  this.log = null;
  if (args) {
    if (args.timestamp !== undefined && args.timestamp !== null) {
      this.timestamp = args.timestamp;
    }
    if (args.index !== undefined && args.index !== null) {
      this.index = args.index;
    }
    if (args.log !== undefined && args.log !== null) {
      this.log = args.log;
    }
  }
};
AggrSyslog.prototype = {};
AggrSyslog.prototype.read = function(input) {
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
        this.timestamp = input.readI64();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.STRING) {
        this.index = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.STRING) {
        this.log = input.readString();
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

AggrSyslog.prototype.write = function(output) {
  output.writeStructBegin('AggrSyslog');
  if (this.timestamp !== null && this.timestamp !== undefined) {
    output.writeFieldBegin('timestamp', Thrift.Type.I64, 1);
    output.writeI64(this.timestamp);
    output.writeFieldEnd();
  }
  if (this.index !== null && this.index !== undefined) {
    output.writeFieldBegin('index', Thrift.Type.STRING, 2);
    output.writeString(this.index);
    output.writeFieldEnd();
  }
  if (this.log !== null && this.log !== undefined) {
    output.writeFieldBegin('log', Thrift.Type.STRING, 3);
    output.writeString(this.log);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrSyslogReport = module.exports.AggrSyslogReport = function(args) {
  this.macAddr = null;
  this.syslogs = null;
  if (args) {
    if (args.macAddr !== undefined && args.macAddr !== null) {
      this.macAddr = args.macAddr;
    }
    if (args.syslogs !== undefined && args.syslogs !== null) {
      this.syslogs = Thrift.copyList(args.syslogs, [ttypes.AggrSyslog]);
    }
  }
};
AggrSyslogReport.prototype = {};
AggrSyslogReport.prototype.read = function(input) {
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
        this.macAddr = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.LIST) {
        this.syslogs = [];
        var _rtmp316 = input.readListBegin();
        var _size15 = _rtmp316.size || 0;
        for (var _i17 = 0; _i17 < _size15; ++_i17) {
          var elem18 = null;
          elem18 = new ttypes.AggrSyslog();
          elem18.read(input);
          this.syslogs.push(elem18);
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

AggrSyslogReport.prototype.write = function(output) {
  output.writeStructBegin('AggrSyslogReport');
  if (this.macAddr !== null && this.macAddr !== undefined) {
    output.writeFieldBegin('macAddr', Thrift.Type.STRING, 1);
    output.writeString(this.macAddr);
    output.writeFieldEnd();
  }
  if (this.syslogs !== null && this.syslogs !== undefined) {
    output.writeFieldBegin('syslogs', Thrift.Type.LIST, 2);
    output.writeListBegin(Thrift.Type.STRUCT, this.syslogs.length);
    for (var iter19 in this.syslogs) {
      if (this.syslogs.hasOwnProperty(iter19)) {
        iter19 = this.syslogs[iter19];
        iter19.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrGetTopology = module.exports.AggrGetTopology = function(args) {
};
AggrGetTopology.prototype = {};
AggrGetTopology.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    input.skip(ftype);
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

AggrGetTopology.prototype.write = function(output) {
  output.writeStructBegin('AggrGetTopology');
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrPing = module.exports.AggrPing = function(args) {
  this.clientTs = null;
  if (args) {
    if (args.clientTs !== undefined && args.clientTs !== null) {
      this.clientTs = args.clientTs;
    }
  }
};
AggrPing.prototype = {};
AggrPing.prototype.read = function(input) {
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
        this.clientTs = input.readI64();
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

AggrPing.prototype.write = function(output) {
  output.writeStructBegin('AggrPing');
  if (this.clientTs !== null && this.clientTs !== undefined) {
    output.writeFieldBegin('clientTs', Thrift.Type.I64, 1);
    output.writeI64(this.clientTs);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrPong = module.exports.AggrPong = function(args) {
  this.clientTs = null;
  if (args) {
    if (args.clientTs !== undefined && args.clientTs !== null) {
      this.clientTs = args.clientTs;
    }
  }
};
AggrPong.prototype = {};
AggrPong.prototype.read = function(input) {
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
        this.clientTs = input.readI64();
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

AggrPong.prototype.write = function(output) {
  output.writeStructBegin('AggrPong');
  if (this.clientTs !== null && this.clientTs !== undefined) {
    output.writeFieldBegin('clientTs', Thrift.Type.I64, 1);
    output.writeI64(this.clientTs);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggregatorConfig = module.exports.AggregatorConfig = function(args) {
  this.flags = null;
  if (args) {
    if (args.flags !== undefined && args.flags !== null) {
      this.flags = Thrift.copyMap(args.flags, [null]);
    }
  }
};
AggregatorConfig.prototype = {};
AggregatorConfig.prototype.read = function(input) {
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
        this.flags = {};
        var _rtmp321 = input.readMapBegin();
        var _size20 = _rtmp321.size || 0;
        for (var _i22 = 0; _i22 < _size20; ++_i22) {
          var key23 = null;
          var val24 = null;
          key23 = input.readString();
          val24 = input.readString();
          this.flags[key23] = val24;
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

AggregatorConfig.prototype.write = function(output) {
  output.writeStructBegin('AggregatorConfig');
  if (this.flags !== null && this.flags !== undefined) {
    output.writeFieldBegin('flags', Thrift.Type.MAP, 1);
    output.writeMapBegin(Thrift.Type.STRING, Thrift.Type.STRING, Thrift.objectLength(this.flags));
    for (var kiter25 in this.flags) {
      if (this.flags.hasOwnProperty(kiter25)) {
        var viter26 = this.flags[kiter25];
        output.writeString(kiter25);
        output.writeString(viter26);
      }
    }
    output.writeMapEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrGetConfigReq = module.exports.AggrGetConfigReq = function(args) {
};
AggrGetConfigReq.prototype = {};
AggrGetConfigReq.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    input.skip(ftype);
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

AggrGetConfigReq.prototype.write = function(output) {
  output.writeStructBegin('AggrGetConfigReq');
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrGetConfigResp = module.exports.AggrGetConfigResp = function(args) {
  this.config = null;
  if (args) {
    if (args.config !== undefined && args.config !== null) {
      this.config = args.config;
    }
  }
};
AggrGetConfigResp.prototype = {};
AggrGetConfigResp.prototype.read = function(input) {
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
        this.config = input.readString();
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

AggrGetConfigResp.prototype.write = function(output) {
  output.writeStructBegin('AggrGetConfigResp');
  if (this.config !== null && this.config !== undefined) {
    output.writeFieldBegin('config', Thrift.Type.STRING, 1);
    output.writeString(this.config);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrSetConfigReq = module.exports.AggrSetConfigReq = function(args) {
  this.config = null;
  if (args) {
    if (args.config !== undefined && args.config !== null) {
      this.config = args.config;
    }
  }
};
AggrSetConfigReq.prototype = {};
AggrSetConfigReq.prototype.read = function(input) {
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
        this.config = input.readString();
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

AggrSetConfigReq.prototype.write = function(output) {
  output.writeStructBegin('AggrSetConfigReq');
  if (this.config !== null && this.config !== undefined) {
    output.writeFieldBegin('config', Thrift.Type.STRING, 1);
    output.writeString(this.config);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrGetConfigMetadata = module.exports.AggrGetConfigMetadata = function(args) {
};
AggrGetConfigMetadata.prototype = {};
AggrGetConfigMetadata.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    var ret = input.readFieldBegin();
    var ftype = ret.ftype;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    input.skip(ftype);
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

AggrGetConfigMetadata.prototype.write = function(output) {
  output.writeStructBegin('AggrGetConfigMetadata');
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrGetConfigMetadataResp = module.exports.AggrGetConfigMetadataResp = function(args) {
  this.metadata = null;
  if (args) {
    if (args.metadata !== undefined && args.metadata !== null) {
      this.metadata = args.metadata;
    }
  }
};
AggrGetConfigMetadataResp.prototype = {};
AggrGetConfigMetadataResp.prototype.read = function(input) {
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
        this.metadata = input.readString();
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

AggrGetConfigMetadataResp.prototype.write = function(output) {
  output.writeStructBegin('AggrGetConfigMetadataResp');
  if (this.metadata !== null && this.metadata !== undefined) {
    output.writeFieldBegin('metadata', Thrift.Type.STRING, 1);
    output.writeString(this.metadata);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrMessage = module.exports.AggrMessage = function(args) {
  this.mType = null;
  this.value = null;
  this.compressed = null;
  this.compressionFormat = null;
  if (args) {
    if (args.mType !== undefined && args.mType !== null) {
      this.mType = args.mType;
    }
    if (args.value !== undefined && args.value !== null) {
      this.value = args.value;
    }
    if (args.compressed !== undefined && args.compressed !== null) {
      this.compressed = args.compressed;
    }
    if (args.compressionFormat !== undefined && args.compressionFormat !== null) {
      this.compressionFormat = args.compressionFormat;
    }
  }
};
AggrMessage.prototype = {};
AggrMessage.prototype.read = function(input) {
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
        this.mType = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.STRING) {
        this.value = input.readBinary();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.BOOL) {
        this.compressed = input.readBool();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.I32) {
        this.compressionFormat = input.readI32();
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

AggrMessage.prototype.write = function(output) {
  output.writeStructBegin('AggrMessage');
  if (this.mType !== null && this.mType !== undefined) {
    output.writeFieldBegin('mType', Thrift.Type.I32, 1);
    output.writeI32(this.mType);
    output.writeFieldEnd();
  }
  if (this.value !== null && this.value !== undefined) {
    output.writeFieldBegin('value', Thrift.Type.STRING, 2);
    output.writeBinary(this.value);
    output.writeFieldEnd();
  }
  if (this.compressed !== null && this.compressed !== undefined) {
    output.writeFieldBegin('compressed', Thrift.Type.BOOL, 3);
    output.writeBool(this.compressed);
    output.writeFieldEnd();
  }
  if (this.compressionFormat !== null && this.compressionFormat !== undefined) {
    output.writeFieldBegin('compressionFormat', Thrift.Type.I32, 4);
    output.writeI32(this.compressionFormat);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AggrAck = module.exports.AggrAck = function(args) {
  this.success = null;
  this.message = null;
  if (args) {
    if (args.success !== undefined && args.success !== null) {
      this.success = args.success;
    }
    if (args.message !== undefined && args.message !== null) {
      this.message = args.message;
    }
  }
};
AggrAck.prototype = {};
AggrAck.prototype.read = function(input) {
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
      if (ftype == Thrift.Type.BOOL) {
        this.success = input.readBool();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.STRING) {
        this.message = input.readString();
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

AggrAck.prototype.write = function(output) {
  output.writeStructBegin('AggrAck');
  if (this.success !== null && this.success !== undefined) {
    output.writeFieldBegin('success', Thrift.Type.BOOL, 1);
    output.writeBool(this.success);
    output.writeFieldEnd();
  }
  if (this.message !== null && this.message !== undefined) {
    output.writeFieldBegin('message', Thrift.Type.STRING, 2);
    output.writeString(this.message);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

