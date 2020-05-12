class UserPeer {
  constructor(peerId, displayName, displayImage, publicPaymentAddress, privatePaymentAddress){
    this._peerId = peerId;
    this._displayName = displayName;
    this._displayImage = displayImage;
    this._publicPaymentAddress = publicPaymentAddress;
    this._privatePaymentAddress = privatePaymentAddress;
  }
  get peerId() {
    return this._peerId;
  }

  set peerId(value) {
    this._peerId = value;
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

}
export default UserPeer;

