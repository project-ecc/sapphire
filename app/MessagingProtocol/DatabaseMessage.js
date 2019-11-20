// Initializing a class definition
class DatabaseMessage {
  get action() {
    return this._action;
  }

  set action(value) {
    this._action = value;
  }

  get model() {
    return this._model;
  }

  set model(value) {
    this._model = value;
  }

  get content() {
    return this._content;
  }

  set content(value) {
    this._content = value;
  }
  constructor(action, model, content) {
    this._action = action;
    this._model = model;
    this._content = content;
  }
}
export default DatabaseMessage;
