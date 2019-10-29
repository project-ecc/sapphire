class AbstractResponse {
  constructor() {
    if (this.constructor === AbstractResponse) {
      throw new TypeError('Abstract class "AbstractResponse" cannot be instantiated directly.');
    }

    if (this.processData() === undefined) {
      throw new TypeError('Classes extending the "AbstractResponse" abstract class must implement getData()');
    }
    if (this.returnData() === undefined) {
      throw new TypeError('Classes extending the "AbstractResponse" abstract class must implement isSuccessful()');
    }
  }
}
export default AbstractResponse;
