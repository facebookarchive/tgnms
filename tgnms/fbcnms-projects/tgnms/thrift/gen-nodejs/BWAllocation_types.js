//
// Autogenerated by Thrift Compiler (0.11.0)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//


const thrift = require('thrift');
const Thrift = thrift.Thrift;
const Q = thrift.Q;


const ttypes = module.exports = {};
ttypes.SlotAttrib = {
  'UNRSVD_SLOT' : 0,
  'BF_RSVD_SLOT' : 1,
  'MGMT_RSVD_SLOT' : 2,
};
const SlotInfo = module.exports.SlotInfo = function(args) {
  this.id = null;
  this.attrib = null;
  if (args) {
    if (args.id !== undefined && args.id !== null) {
      this.id = args.id;
    }
    if (args.attrib !== undefined && args.attrib !== null) {
      this.attrib = args.attrib;
    }
  }
};
SlotInfo.prototype = {};
SlotInfo.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    const ret = input.readFieldBegin();
    const fname = ret.fname;
    const ftype = ret.ftype;
    const fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.I16) {
        this.id = input.readI16();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.I32) {
        this.attrib = input.readI32();
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

SlotInfo.prototype.write = function(output) {
  output.writeStructBegin('SlotInfo');
  if (this.id !== null && this.id !== undefined) {
    output.writeFieldBegin('id', Thrift.Type.I16, 1);
    output.writeI16(this.id);
    output.writeFieldEnd();
  }
  if (this.attrib !== null && this.attrib !== undefined) {
    output.writeFieldBegin('attrib', Thrift.Type.I32, 2);
    output.writeI32(this.attrib);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

const NodeBwAlloc = module.exports.NodeBwAlloc = function(args) {
  this.frmCfgType = null;
  this.sframesPerBWGD = null;
  this.slotsPerFrame = null;
  this.macAddrList = null;
  this.txSlotMap = null;
  this.rxSlotMap = null;
  if (args) {
    if (args.frmCfgType !== undefined && args.frmCfgType !== null) {
      this.frmCfgType = args.frmCfgType;
    }
    if (args.sframesPerBWGD !== undefined && args.sframesPerBWGD !== null) {
      this.sframesPerBWGD = args.sframesPerBWGD;
    }
    if (args.slotsPerFrame !== undefined && args.slotsPerFrame !== null) {
      this.slotsPerFrame = args.slotsPerFrame;
    }
    if (args.macAddrList !== undefined && args.macAddrList !== null) {
      this.macAddrList = Thrift.copyMap(args.macAddrList, [null]);
    }
    if (args.txSlotMap !== undefined && args.txSlotMap !== null) {
      this.txSlotMap = Thrift.copyMap(args.txSlotMap, [ttypes.SlotInfo]);
    }
    if (args.rxSlotMap !== undefined && args.rxSlotMap !== null) {
      this.rxSlotMap = Thrift.copyMap(args.rxSlotMap, [ttypes.SlotInfo]);
    }
  }
};
NodeBwAlloc.prototype = {};
NodeBwAlloc.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    const ret = input.readFieldBegin();
    const fname = ret.fname;
    const ftype = ret.ftype;
    const fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.I16) {
        this.frmCfgType = input.readI16();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.I16) {
        this.sframesPerBWGD = input.readI16();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.I16) {
        this.slotsPerFrame = input.readI16();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.MAP) {
        let _size0 = 0;
        var _rtmp34;
        this.macAddrList = {};
        let _ktype1 = 0;
        let _vtype2 = 0;
        _rtmp34 = input.readMapBegin();
        _ktype1 = _rtmp34.ktype;
        _vtype2 = _rtmp34.vtype;
        _size0 = _rtmp34.size;
        for (let _i5 = 0; _i5 < _size0; ++_i5) {
          let key6 = null;
          let val7 = null;
          key6 = input.readI16();
          val7 = input.readString();
          this.macAddrList[key6] = val7;
        }
        input.readMapEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 5:
      if (ftype == Thrift.Type.MAP) {
        let _size8 = 0;
        var _rtmp312;
        this.txSlotMap = {};
        let _ktype9 = 0;
        let _vtype10 = 0;
        _rtmp312 = input.readMapBegin();
        _ktype9 = _rtmp312.ktype;
        _vtype10 = _rtmp312.vtype;
        _size8 = _rtmp312.size;
        for (let _i13 = 0; _i13 < _size8; ++_i13) {
          let key14 = null;
          let val15 = null;
          key14 = input.readI16();
          val15 = new ttypes.SlotInfo();
          val15.read(input);
          this.txSlotMap[key14] = val15;
        }
        input.readMapEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 6:
      if (ftype == Thrift.Type.MAP) {
        let _size16 = 0;
        var _rtmp320;
        this.rxSlotMap = {};
        let _ktype17 = 0;
        let _vtype18 = 0;
        _rtmp320 = input.readMapBegin();
        _ktype17 = _rtmp320.ktype;
        _vtype18 = _rtmp320.vtype;
        _size16 = _rtmp320.size;
        for (let _i21 = 0; _i21 < _size16; ++_i21) {
          let key22 = null;
          let val23 = null;
          key22 = input.readI16();
          val23 = new ttypes.SlotInfo();
          val23.read(input);
          this.rxSlotMap[key22] = val23;
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

NodeBwAlloc.prototype.write = function(output) {
  output.writeStructBegin('NodeBwAlloc');
  if (this.frmCfgType !== null && this.frmCfgType !== undefined) {
    output.writeFieldBegin('frmCfgType', Thrift.Type.I16, 1);
    output.writeI16(this.frmCfgType);
    output.writeFieldEnd();
  }
  if (this.sframesPerBWGD !== null && this.sframesPerBWGD !== undefined) {
    output.writeFieldBegin('sframesPerBWGD', Thrift.Type.I16, 2);
    output.writeI16(this.sframesPerBWGD);
    output.writeFieldEnd();
  }
  if (this.slotsPerFrame !== null && this.slotsPerFrame !== undefined) {
    output.writeFieldBegin('slotsPerFrame', Thrift.Type.I16, 3);
    output.writeI16(this.slotsPerFrame);
    output.writeFieldEnd();
  }
  if (this.macAddrList !== null && this.macAddrList !== undefined) {
    output.writeFieldBegin('macAddrList', Thrift.Type.MAP, 4);
    output.writeMapBegin(Thrift.Type.I16, Thrift.Type.STRING, Thrift.objectLength(this.macAddrList));
    for (const kiter24 in this.macAddrList) {
      if (this.macAddrList.hasOwnProperty(kiter24)) {
        const viter25 = this.macAddrList[kiter24];
        output.writeI16(kiter24);
        output.writeString(viter25);
      }
    }
    output.writeMapEnd();
    output.writeFieldEnd();
  }
  if (this.txSlotMap !== null && this.txSlotMap !== undefined) {
    output.writeFieldBegin('txSlotMap', Thrift.Type.MAP, 5);
    output.writeMapBegin(Thrift.Type.I16, Thrift.Type.STRUCT, Thrift.objectLength(this.txSlotMap));
    for (const kiter26 in this.txSlotMap) {
      if (this.txSlotMap.hasOwnProperty(kiter26)) {
        const viter27 = this.txSlotMap[kiter26];
        output.writeI16(kiter26);
        viter27.write(output);
      }
    }
    output.writeMapEnd();
    output.writeFieldEnd();
  }
  if (this.rxSlotMap !== null && this.rxSlotMap !== undefined) {
    output.writeFieldBegin('rxSlotMap', Thrift.Type.MAP, 6);
    output.writeMapBegin(Thrift.Type.I16, Thrift.Type.STRUCT, Thrift.objectLength(this.rxSlotMap));
    for (const kiter28 in this.rxSlotMap) {
      if (this.rxSlotMap.hasOwnProperty(kiter28)) {
        const viter29 = this.rxSlotMap[kiter28];
        output.writeI16(kiter28);
        viter29.write(output);
      }
    }
    output.writeMapEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

const NetworkBwAlloc = module.exports.NetworkBwAlloc = function(args) {
  this.nodeBwAllocMap = null;
  if (args) {
    if (args.nodeBwAllocMap !== undefined && args.nodeBwAllocMap !== null) {
      this.nodeBwAllocMap = Thrift.copyMap(args.nodeBwAllocMap, [ttypes.NodeBwAlloc]);
    }
  }
};
NetworkBwAlloc.prototype = {};
NetworkBwAlloc.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    const ret = input.readFieldBegin();
    const fname = ret.fname;
    const ftype = ret.ftype;
    const fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.MAP) {
        let _size30 = 0;
        var _rtmp334;
        this.nodeBwAllocMap = {};
        let _ktype31 = 0;
        let _vtype32 = 0;
        _rtmp334 = input.readMapBegin();
        _ktype31 = _rtmp334.ktype;
        _vtype32 = _rtmp334.vtype;
        _size30 = _rtmp334.size;
        for (let _i35 = 0; _i35 < _size30; ++_i35) {
          let key36 = null;
          let val37 = null;
          key36 = input.readString();
          val37 = new ttypes.NodeBwAlloc();
          val37.read(input);
          this.nodeBwAllocMap[key36] = val37;
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

NetworkBwAlloc.prototype.write = function(output) {
  output.writeStructBegin('NetworkBwAlloc');
  if (this.nodeBwAllocMap !== null && this.nodeBwAllocMap !== undefined) {
    output.writeFieldBegin('nodeBwAllocMap', Thrift.Type.MAP, 1);
    output.writeMapBegin(Thrift.Type.STRING, Thrift.Type.STRUCT, Thrift.objectLength(this.nodeBwAllocMap));
    for (const kiter38 in this.nodeBwAllocMap) {
      if (this.nodeBwAllocMap.hasOwnProperty(kiter38)) {
        const viter39 = this.nodeBwAllocMap[kiter38];
        output.writeString(kiter38);
        viter39.write(output);
      }
    }
    output.writeMapEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

const LinkAirtime = module.exports.LinkAirtime = function(args) {
  this.macAddress = null;
  this.txIdeal = null;
  this.txMin = null;
  this.txMax = null;
  this.rxIdeal = null;
  this.rxMin = null;
  this.rxMax = null;
  if (args) {
    if (args.macAddress !== undefined && args.macAddress !== null) {
      this.macAddress = args.macAddress;
    }
    if (args.txIdeal !== undefined && args.txIdeal !== null) {
      this.txIdeal = args.txIdeal;
    }
    if (args.txMin !== undefined && args.txMin !== null) {
      this.txMin = args.txMin;
    }
    if (args.txMax !== undefined && args.txMax !== null) {
      this.txMax = args.txMax;
    }
    if (args.rxIdeal !== undefined && args.rxIdeal !== null) {
      this.rxIdeal = args.rxIdeal;
    }
    if (args.rxMin !== undefined && args.rxMin !== null) {
      this.rxMin = args.rxMin;
    }
    if (args.rxMax !== undefined && args.rxMax !== null) {
      this.rxMax = args.rxMax;
    }
  }
};
LinkAirtime.prototype = {};
LinkAirtime.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    const ret = input.readFieldBegin();
    const fname = ret.fname;
    const ftype = ret.ftype;
    const fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.STRING) {
        this.macAddress = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.I16) {
        this.txIdeal = input.readI16();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.I16) {
        this.txMin = input.readI16();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.I16) {
        this.txMax = input.readI16();
      } else {
        input.skip(ftype);
      }
      break;
      case 5:
      if (ftype == Thrift.Type.I16) {
        this.rxIdeal = input.readI16();
      } else {
        input.skip(ftype);
      }
      break;
      case 6:
      if (ftype == Thrift.Type.I16) {
        this.rxMin = input.readI16();
      } else {
        input.skip(ftype);
      }
      break;
      case 7:
      if (ftype == Thrift.Type.I16) {
        this.rxMax = input.readI16();
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

LinkAirtime.prototype.write = function(output) {
  output.writeStructBegin('LinkAirtime');
  if (this.macAddress !== null && this.macAddress !== undefined) {
    output.writeFieldBegin('macAddress', Thrift.Type.STRING, 1);
    output.writeString(this.macAddress);
    output.writeFieldEnd();
  }
  if (this.txIdeal !== null && this.txIdeal !== undefined) {
    output.writeFieldBegin('txIdeal', Thrift.Type.I16, 2);
    output.writeI16(this.txIdeal);
    output.writeFieldEnd();
  }
  if (this.txMin !== null && this.txMin !== undefined) {
    output.writeFieldBegin('txMin', Thrift.Type.I16, 3);
    output.writeI16(this.txMin);
    output.writeFieldEnd();
  }
  if (this.txMax !== null && this.txMax !== undefined) {
    output.writeFieldBegin('txMax', Thrift.Type.I16, 4);
    output.writeI16(this.txMax);
    output.writeFieldEnd();
  }
  if (this.rxIdeal !== null && this.rxIdeal !== undefined) {
    output.writeFieldBegin('rxIdeal', Thrift.Type.I16, 5);
    output.writeI16(this.rxIdeal);
    output.writeFieldEnd();
  }
  if (this.rxMin !== null && this.rxMin !== undefined) {
    output.writeFieldBegin('rxMin', Thrift.Type.I16, 6);
    output.writeI16(this.rxMin);
    output.writeFieldEnd();
  }
  if (this.rxMax !== null && this.rxMax !== undefined) {
    output.writeFieldBegin('rxMax', Thrift.Type.I16, 7);
    output.writeI16(this.rxMax);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

const NodeAirtime = module.exports.NodeAirtime = function(args) {
  this.linkAirtimes = null;
  if (args) {
    if (args.linkAirtimes !== undefined && args.linkAirtimes !== null) {
      this.linkAirtimes = Thrift.copyList(args.linkAirtimes, [ttypes.LinkAirtime]);
    }
  }
};
NodeAirtime.prototype = {};
NodeAirtime.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    const ret = input.readFieldBegin();
    const fname = ret.fname;
    const ftype = ret.ftype;
    const fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.LIST) {
        let _size40 = 0;
        var _rtmp344;
        this.linkAirtimes = [];
        let _etype43 = 0;
        _rtmp344 = input.readListBegin();
        _etype43 = _rtmp344.etype;
        _size40 = _rtmp344.size;
        for (let _i45 = 0; _i45 < _size40; ++_i45) {
          let elem46 = null;
          elem46 = new ttypes.LinkAirtime();
          elem46.read(input);
          this.linkAirtimes.push(elem46);
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

NodeAirtime.prototype.write = function(output) {
  output.writeStructBegin('NodeAirtime');
  if (this.linkAirtimes !== null && this.linkAirtimes !== undefined) {
    output.writeFieldBegin('linkAirtimes', Thrift.Type.LIST, 1);
    output.writeListBegin(Thrift.Type.STRUCT, this.linkAirtimes.length);
    for (let iter47 in this.linkAirtimes) {
      if (this.linkAirtimes.hasOwnProperty(iter47)) {
        iter47 = this.linkAirtimes[iter47];
        iter47.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

const NetworkAirtime = module.exports.NetworkAirtime = function(args) {
  this.nodeAirtimeMap = null;
  if (args) {
    if (args.nodeAirtimeMap !== undefined && args.nodeAirtimeMap !== null) {
      this.nodeAirtimeMap = Thrift.copyMap(args.nodeAirtimeMap, [ttypes.NodeAirtime]);
    }
  }
};
NetworkAirtime.prototype = {};
NetworkAirtime.prototype.read = function(input) {
  input.readStructBegin();
  while (true) {
    const ret = input.readFieldBegin();
    const fname = ret.fname;
    const ftype = ret.ftype;
    const fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid) {
      case 1:
      if (ftype == Thrift.Type.MAP) {
        let _size48 = 0;
        var _rtmp352;
        this.nodeAirtimeMap = {};
        let _ktype49 = 0;
        let _vtype50 = 0;
        _rtmp352 = input.readMapBegin();
        _ktype49 = _rtmp352.ktype;
        _vtype50 = _rtmp352.vtype;
        _size48 = _rtmp352.size;
        for (let _i53 = 0; _i53 < _size48; ++_i53) {
          let key54 = null;
          let val55 = null;
          key54 = input.readString();
          val55 = new ttypes.NodeAirtime();
          val55.read(input);
          this.nodeAirtimeMap[key54] = val55;
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

NetworkAirtime.prototype.write = function(output) {
  output.writeStructBegin('NetworkAirtime');
  if (this.nodeAirtimeMap !== null && this.nodeAirtimeMap !== undefined) {
    output.writeFieldBegin('nodeAirtimeMap', Thrift.Type.MAP, 1);
    output.writeMapBegin(Thrift.Type.STRING, Thrift.Type.STRUCT, Thrift.objectLength(this.nodeAirtimeMap));
    for (const kiter56 in this.nodeAirtimeMap) {
      if (this.nodeAirtimeMap.hasOwnProperty(kiter56)) {
        const viter57 = this.nodeAirtimeMap[kiter56];
        output.writeString(kiter56);
        viter57.write(output);
      }
    }
    output.writeMapEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

