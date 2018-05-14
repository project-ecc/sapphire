import React, { Component } from 'react';
var classNames = require('classnames');

class Input extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleOnFocus = this.handleOnFocus.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.placeholderId = "#" + this.props.placeholderId;
    this.state={focus: false}
  }

  handleOnFocus(){
    this.setState({focus: true})
  }

  handleOnBlur(event){
    const value = event.target.value;
    this.setState({focus: false})
  }

  handleChange(event){
    const value = event.target.value;
    this.props.handleChange(value)
    this.setState({focus: true})
  }

  render() {
    var inputClass = classNames({
      'inputDiv': true,
      'inputDiv--is-left': this.props.isLeft,
      'inputDiv--is-disabled': this.props.isDisabled,
      'inputDiv--is-active': this.props.value !== "" || this.state.focus
    });

    return (
      <div className={inputClass} id={this.props.divId ? this.props.divId : ""} style={this.props.style}>
        <p id={this.props.placeholderId}>{this.props.placeholder}</p>
        <input onFocus={this.handleOnFocus} onBlur={this.handleOnBlur} id={this.props.inputId ? this.props.inputId : ""} className="inputCustom" type={this.props.type} value={this.props.value} onChange={this.handleChange}  autoFocus={this.props.autoFocus}></input>
      </div>
    );
  }
}

export default Input;
