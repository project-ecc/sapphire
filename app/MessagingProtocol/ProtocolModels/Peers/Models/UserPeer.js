class UserPeer {
  get peerId() {
    return this._peerId;
  }

  set peerId(value) {
    this._peerId = value;
  }

  get networkKey() {
    return this._networkKey;
  }

  set networkKey(value) {
    this._networkKey = value;
  }

  get networkName() {
    return this._networkName;
  }

  set networkName(value) {
    this._networkName = value;
  }

  get displayName() {
    return this._displayName;
  }

  set displayName(value) {
    this._displayName = value;
  }

  get displayImage() {
    return this._displayImage;
  }

  set displayImage(value) {
    this._displayImage = value;
  }

  get publicPaymentAddress() {
    return this._publicPaymentAddress;
  }

  set publicPaymentAddress(value) {
    this._publicPaymentAddress = value;
  }

  get privatePaymentAddress() {
    return this._privatePaymentAddress;
  }

  set privatePaymentAddress(value) {
    this._privatePaymentAddress = value;
  }
  constructor(peerId, networkKey, networkName, displayName,displayImage, publicPaymentAddress, privatePaymentAddress){
    this._peerId = peerId;
    this._networkKey = networkKey;
    this._networkName = networkName;
    this._displayName = displayName;
    this._displayImage = displayImage;
    this._publicPaymentAddress = publicPaymentAddress;
    this._privatePaymentAddress = privatePaymentAddress;
  }
}

