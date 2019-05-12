import React, {Component} from 'react';

const classNames = require('classnames');

class Input extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleOnFocus = this.handleOnFocus.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.placeholderId = `#${this.props.placeholderId}`;
    this.handleKeyPressed = this.handleKeyPressed.bind(this);
    this.state = { focus: false };
  }

  handleOnFocus() {
    this.setState({ focus: true });
  }

  handleOnBlur(event) {
    const value = event.target.value;
    this.setState({ focus: false });
  }

  handleChange(event) {
    const value = event.target.value;
    this.props.handleChange(value);
    this.setState({ focus: true });
  }

  handleKeyPressed(event, callback) {
    if (!this.props.onSubmit) return;
    if (event.key === 'Enter') {
      this.props.onSubmit();
      const value = event.target.value;
      if (value === '') {
        this.setState({ focus: false });
      }
    }
  }

  render() {
    const inputClass = classNames({
      inputDiv: true,
      'inputDiv--is-left': this.props.isLeft,
      'inputDiv--is-disabled': this.props.isDisabled || false,
      'inputDiv--is-active': this.props.value !== '' || this.state.focus
    });

    return (
      <div className={inputClass} id={this.props.divId ? this.props.divId : ''} style={this.props.style}>
        <p id={this.props.placeholderId}>{this.props.placeholder}</p>
        <input onKeyPress={this.handleKeyPressed} onFocus={this.handleOnFocus} onBlur={this.handleOnBlur} id={this.props.inputId || ''} className="inputCustom" type={this.props.type} value={this.props.value} onChange={this.handleChange} autoFocus={this.props.autoFocus} />
      </div>
    );
  }
}

export default Input;
