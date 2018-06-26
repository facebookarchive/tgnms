//
// Autogenerated by Thrift Compiler (0.9.1)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//
var Thrift = require('thrift').Thrift;
var IpPrefix_ttypes = require('./IpPrefix_types')


var ttypes = module.exports = {};
Adjacency = module.exports.Adjacency = function(args) {
  this.otherNodeName = null;
  this.ifName = null;
  this.nextHopV6 = null;
  this.nextHopV4 = null;
  this.metric = null;
  this.adjLabel = 0;
  this.isOverloaded = false;
  this.rtt = null;
  if (args) {
    if (args.otherNodeName !== undefined) {
      this.otherNodeName = args.otherNodeName;
    }
    if (args.ifName !== undefined) {
      this.ifName = args.ifName;
    }
    if (args.nextHopV6 !== undefined) {
      this.nextHopV6 = args.nextHopV6;
    }
    if (args.nextHopV4 !== undefined) {
      this.nextHopV4 = args.nextHopV4;
    }
    if (args.metric !== undefined) {
      this.metric = args.metric;
    }
    if (args.adjLabel !== undefined) {
      this.adjLabel = args.adjLabel;
    }
    if (args.isOverloaded !== undefined) {
      this.isOverloaded = args.isOverloaded;
    }
    if (args.rtt !== undefined) {
      this.rtt = args.rtt;
    }
  }
};
Adjacency.prototype = {};
Adjacency.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.STRING) {
        this.otherNodeName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.STRING) {
        this.ifName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.STRUCT) {
        this.nextHopV6 = new IpPrefix_ttypes.BinaryAddress();
        this.nextHopV6.read(input);
      } else {
        input.skip(ftype);
      }
      break;
      case 5:
      if (ftype == Thrift.Type.STRUCT) {
        this.nextHopV4 = new IpPrefix_ttypes.BinaryAddress();
        this.nextHopV4.read(input);
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.I32) {
        this.metric = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 6:
      if (ftype == Thrift.Type.I32) {
        this.adjLabel = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 7:
      if (ftype == Thrift.Type.BOOL) {
        this.isOverloaded = input.readBool();
      } else {
        input.skip(ftype);
      }
      break;
      case 8:
      if (ftype == Thrift.Type.I32) {
        this.rtt = input.readI32();
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

Adjacency.prototype.write = function(output) {
  output.writeStructBegin('Adjacency');
  if (this.otherNodeName !== null && this.otherNodeName !== undefined) {
    output.writeFieldBegin('otherNodeName', Thrift.Type.STRING, 1);
    output.writeString(this.otherNodeName);
    output.writeFieldEnd();
  }
  if (this.ifName !== null && this.ifName !== undefined) {
    output.writeFieldBegin('ifName', Thrift.Type.STRING, 2);
    output.writeString(this.ifName);
    output.writeFieldEnd();
  }
  if (this.nextHopV6 !== null && this.nextHopV6 !== undefined) {
    output.writeFieldBegin('nextHopV6', Thrift.Type.STRUCT, 3);
    this.nextHopV6.write(output);
    output.writeFieldEnd();
  }
  if (this.nextHopV4 !== null && this.nextHopV4 !== undefined) {
    output.writeFieldBegin('nextHopV4', Thrift.Type.STRUCT, 5);
    this.nextHopV4.write(output);
    output.writeFieldEnd();
  }
  if (this.metric !== null && this.metric !== undefined) {
    output.writeFieldBegin('metric', Thrift.Type.I32, 4);
    output.writeI32(this.metric);
    output.writeFieldEnd();
  }
  if (this.adjLabel !== null && this.adjLabel !== undefined) {
    output.writeFieldBegin('adjLabel', Thrift.Type.I32, 6);
    output.writeI32(this.adjLabel);
    output.writeFieldEnd();
  }
  if (this.isOverloaded !== null && this.isOverloaded !== undefined) {
    output.writeFieldBegin('isOverloaded', Thrift.Type.BOOL, 7);
    output.writeBool(this.isOverloaded);
    output.writeFieldEnd();
  }
  if (this.rtt !== null && this.rtt !== undefined) {
    output.writeFieldBegin('rtt', Thrift.Type.I32, 8);
    output.writeI32(this.rtt);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

AdjacencyDatabase = module.exports.AdjacencyDatabase = function(args) {
  this.thisNodeName = null;
  this.isOverloaded = false;
  this.adjacencies = null;
  this.nodeLabel = null;
  if (args) {
    if (args.thisNodeName !== undefined) {
      this.thisNodeName = args.thisNodeName;
    }
    if (args.isOverloaded !== undefined) {
      this.isOverloaded = args.isOverloaded;
    }
    if (args.adjacencies !== undefined) {
      this.adjacencies = args.adjacencies;
    }
    if (args.nodeLabel !== undefined) {
      this.nodeLabel = args.nodeLabel;
    }
  }
};
AdjacencyDatabase.prototype = {};
AdjacencyDatabase.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.STRING) {
        this.thisNodeName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.BOOL) {
        this.isOverloaded = input.readBool();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.LIST) {
        var _size0 = 0;
        var _rtmp34;
        this.adjacencies = [];
        var _etype3 = 0;
        _rtmp34 = input.readListBegin();
        _etype3 = _rtmp34.etype;
        _size0 = _rtmp34.size;
        for (var _i5 = 0; _i5 < _size0; ++_i5)
        {
          var elem6 = null;
          elem6 = new ttypes.Adjacency();
          elem6.read(input);
          this.adjacencies.push(elem6);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.I32) {
        this.nodeLabel = input.readI32();
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

AdjacencyDatabase.prototype.write = function(output) {
  output.writeStructBegin('AdjacencyDatabase');
  if (this.thisNodeName !== null && this.thisNodeName !== undefined) {
    output.writeFieldBegin('thisNodeName', Thrift.Type.STRING, 1);
    output.writeString(this.thisNodeName);
    output.writeFieldEnd();
  }
  if (this.isOverloaded !== null && this.isOverloaded !== undefined) {
    output.writeFieldBegin('isOverloaded', Thrift.Type.BOOL, 2);
    output.writeBool(this.isOverloaded);
    output.writeFieldEnd();
  }
  if (this.adjacencies !== null && this.adjacencies !== undefined) {
    output.writeFieldBegin('adjacencies', Thrift.Type.LIST, 3);
    output.writeListBegin(Thrift.Type.STRUCT, this.adjacencies.length);
    for (var iter7 in this.adjacencies)
    {
      if (this.adjacencies.hasOwnProperty(iter7))
      {
        iter7 = this.adjacencies[iter7];
        iter7.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.nodeLabel !== null && this.nodeLabel !== undefined) {
    output.writeFieldBegin('nodeLabel', Thrift.Type.I32, 4);
    output.writeI32(this.nodeLabel);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

PrefixDatabase = module.exports.PrefixDatabase = function(args) {
  this.thisNodeName = null;
  this.prefixes = null;
  if (args) {
    if (args.thisNodeName !== undefined) {
      this.thisNodeName = args.thisNodeName;
    }
    if (args.prefixes !== undefined) {
      this.prefixes = args.prefixes;
    }
  }
};
PrefixDatabase.prototype = {};
PrefixDatabase.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.STRING) {
        this.thisNodeName = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.LIST) {
        var _size8 = 0;
        var _rtmp312;
        this.prefixes = [];
        var _etype11 = 0;
        _rtmp312 = input.readListBegin();
        _etype11 = _rtmp312.etype;
        _size8 = _rtmp312.size;
        for (var _i13 = 0; _i13 < _size8; ++_i13)
        {
          var elem14 = null;
          elem14 = new IpPrefix_ttypes.IpPrefix();
          elem14.read(input);
          this.prefixes.push(elem14);
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

PrefixDatabase.prototype.write = function(output) {
  output.writeStructBegin('PrefixDatabase');
  if (this.thisNodeName !== null && this.thisNodeName !== undefined) {
    output.writeFieldBegin('thisNodeName', Thrift.Type.STRING, 1);
    output.writeString(this.thisNodeName);
    output.writeFieldEnd();
  }
  if (this.prefixes !== null && this.prefixes !== undefined) {
    output.writeFieldBegin('prefixes', Thrift.Type.LIST, 2);
    output.writeListBegin(Thrift.Type.STRUCT, this.prefixes.length);
    for (var iter15 in this.prefixes)
    {
      if (this.prefixes.hasOwnProperty(iter15))
      {
        iter15 = this.prefixes[iter15];
        iter15.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

