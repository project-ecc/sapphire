// Initializing a class definition
const uuidv4 = require('uuid/v4')
class Packet {
  constructor(to, from, type, content) {
    this._id = uuidv4();
    this._protocolId = 1;
    this._protocolVersion = 1;
    this._type = type;
    this._content = content;
    this._to = to;
    this._from = from;
  }
  get to() {
    return this._to;
  }

  set to(value) {
    this._to = value;
  }

  get from() {
    return this._from;
  }

  set from(value) {
    this._from = value;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }

  get content() {
    return this._content;
  }

  set content(value) {
    this._content = value;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get protocolId() {
    return this._protocolId;
  }

  set protocolId(value) {
    this._protocolId = value;
  }

  get protocolVersion() {
    return this._protocolVersion;
  }

  set protocolVersion(value) {
    this._protocolVersion = value;
  }
}
export default Packet;
