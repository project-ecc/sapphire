import React, { Component } from 'react';

class TopBar extends React.Component {
 constructor() {
    super();
  }

  render() { 
    const minimize = require('../../resources/images/minimize.png');
    const maximize = require('../../resources/images/maximize.png');
    const close = require('../../resources/images/close.png');
    const miniButton = require('../../resources/images/logo_setup.png');
    let settings = require('../../resources/images/settings-white.png');
    let notification = require('../../resources/images/notification-white.png');
    let news = require('../../resources/images/news-white.png');
    if(this.props.settings){
      settings = require('../../resources/images/settings-orange.png');
    }
    if(this.props.news && !this.props.settings){
       news = require('../../resources/images/news-orange.png');
    }

     return (
        <div id="wrapperToBeAbleToResize">
          <div id="topBar">
          <img className="miniButton" src={miniButton}></img>
            <div id="appButtons">
             <div onClick={this.notification} className="appButton functionIcon" id="eccNewsIcon">
                <img src={notification}></img>
              </div>
             <div onClick={this.news} className="appButton functionIcon" id="eccNewsIcon">
                <img src={news}></img>
              </div>
              <div onClick={this.settings} className="appButton functionIcon">
                <img src={settings}></img>
              </div>
              <div onClick={this.minimize} className="appButton">
                <img src={minimize}></img>
              </div>
              <div onClick={this.maximize} className="appButton">
                <img src={maximize}></img>
              </div>
              <div onClick={this.close} className="appButton appButtonClose">
                <img src={close}></img>
              </div>
            </div>
          </div>
        </div>
      );
    } 
};

export default TopBar;
