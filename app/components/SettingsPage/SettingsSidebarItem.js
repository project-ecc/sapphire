import React, { Component } from 'react';
import ToggleButton from 'react-toggle';

class SettingsSidebarItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div onClick={this.props.handleClicked} className={this.props.selected ? "settingsSidebarItem selectedSideBarItem" : "settingsSidebarItem"} data-id={this.props.dataId}>
        <p >{this.props.text}</p>
      </div>
    );
  }
}

export default SettingsSidebarItem;
