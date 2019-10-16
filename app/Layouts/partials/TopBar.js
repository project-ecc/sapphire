import React, {Component} from 'react';
import {ipcRenderer} from 'electron';

class TopBar extends Component {
  constructor() {
    super();
    this.close = this.close.bind(this);
    this.maximize = this.maximize.bind(this);
  }

  minimize() {
    ipcRenderer.send('minimize');
  }

  fullScreen() {
    ipcRenderer.send('full-screen');
  }

  maximize() {
    ipcRenderer.send('maximize');
  }

  close() {
    ipcRenderer.send('closeApplication');
  }

  render() {
    const platform = process.platform === 'darwin' ? 'darwin' : 'win';
    return (
      <div id="topBar" className={`${platform}`}>
        <div className="buttons">
          <a onClick={this.fullScreen.bind(this, false)} className="fullscreen" />
          <a onClick={this.minimize} className="minimize" />
          <a onClick={this.maximize.bind(this, false)} className="maximize" />
          <a onClick={this.close} className="close" />
        </div>
      </div>
    );
  }
}

export default TopBar;
