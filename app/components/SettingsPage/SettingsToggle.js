import React, { Component } from 'react';
import ToggleButton from 'react-toggle';

class SettingsToggle extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="row settingsToggle">
        <div className="col-sm-10 text-left removePadding">
          <p>{this.props.text}</p>
        </div>
        <div className="col-sm-2 text-right removePadding">
        <ToggleButton checked={this.props.checked}  onChange={() => {this.props.handleChange(); }} />
        </div>
      </div>
    );
  }
}

export default SettingsToggle;
