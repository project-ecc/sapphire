import React, { Component } from 'react';

class Input extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="inputDiv" id={this.props.divId ? this.props.divId : ""} style={this.props.divStyle}>
        <p className={this.props.placeHolderClassName ? this.props.placeHolderClassName : "inputPlaceholder"} style={{width: this.props.inputStyle.width}} id={this.props.placeholderId}>{this.props.placeholder}</p>
        <input id={this.props.inputId ? this.props.inputId : ""} className={this.props.inputClassName ? this.props.inputClassName : "inputCustom"} type={this.props.type} value={this.props.value} onChange={this.props.handleChange} style={this.props.inputStyle} autoFocus={this.props.autoFocus ? this.props.autoFocus : false}></input>
      </div>
    );
  }
}

export default Input;
