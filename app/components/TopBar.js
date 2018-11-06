import React, { Component } from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { BellOutlineIcon } from 'mdi-react';

import * as actions from '../actions';

class TopBar extends Component {
  constructor() {
    super();
    this.getDarwinBar = this.getDarwinBar.bind(this);
    this.close = this.close.bind(this);
    this.notification = this.notification.bind(this);
    this.maximize = this.maximize.bind(this);
  }

  minimize() {
    ipcRenderer.send('minimize');
    $('.appButton').removeClass('appButtonHover');
  }

  fullScreen() {
    ipcRenderer.send('full-screen');
  }

  maximize() {
    ipcRenderer.send('maximize');
  }

  close() {
    ipcRenderer.send('quit');
  }

  notification() {
    if (!this.props.notificationPopup) {
      this.props.setImportingPrivateKey(false);
      this.props.setUpdateApplication(false);
      TweenMax.to($('.mancha'), 0.2, { autoAlpha: 0, ease: Linear.easeNone });
    }
    this.props.setNotifications(!this.props.notificationPopup);
  }

  getDarwinBar() {
    const notification = require('../../resources/images/notification-white.png');

    let numberOfNotifications = this.props.notifications.total;
    if (this.props.updateAvailable) { numberOfNotifications += 1; }

    return (
      <div>
        <div id="appButtons">
          <div onClick={this.notification} className="appButton functionIcon" id="eccNewsIcon">
            <div className="appButtons__notifications-counter-holder">
              <p className="appButtons__notifications-total">{numberOfNotifications > 0 ? numberOfNotifications : ''}</p>
            </div>
            <BellOutlineIcon size={24} />
            {/*<img src={notification} />*/}
          </div>
        </div>
      </div>
    );
  }

  getWinLinBar() {
    let numberOfNotifications = this.props.notifications.total;
    if (this.props.updateAvailable) { numberOfNotifications += 1; }

    return (
      <div>
        {/* <p id="topBarCustomTitle" className= {process.platform === 'darwin' ? "topBarCustomTitleMac" : "topBarCustomTitleWin"}>Messaging</p> */}
        <div id="appButtons">
          <div onClick={this.notification} className="appButton functionIcon" id="eccNewsIcon">
            <div className="appButtons__notifications-counter-holder">
              <p className="appButtons__notifications-total">{numberOfNotifications > 0 ? numberOfNotifications : ''}</p>
            </div>
            <BellOutlineIcon size={24} />
            {/*<img src={notification} />*/}
          </div>
        </div>
      </div>
    );
  }

  render() {
    let menuBar = null;
    if (process.platform === 'darwin') {
      menuBar = this.getDarwinBar();
    } else {
      menuBar = this.getDarwinBar();
    }

    const platform = process.platform === 'darwin' ? 'darwin' : 'win';
    return (
      <div id="topBar" className={`${platform}`}>
        <div className="buttons">
          <a onClick={this.fullScreen.bind(this, false)} className="fullscreen" />
          <a onClick={this.minimize} className="minimize" />
          <a onClick={this.maximize.bind(this, false)} className="maximize" />
          <a onClick={this.close} className="close" />
        </div>
        {/*{menuBar}*/}
      </div>
    );
  }

}

const mapStateToProps = state => {
  return {
    notificationPopup: state.notifications.popupEnabled,
    notifications: state.notifications.entries,
    updateAvailable: state.startup.guiUpdate || state.startup.daemonUpdate,
  };
};

export default connect(mapStateToProps, actions)(TopBar);
