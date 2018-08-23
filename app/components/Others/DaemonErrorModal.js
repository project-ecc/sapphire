import React, { Component } from 'react';
import { connect } from 'react-redux';
import renderHTML from 'react-render-html';
import * as actions from '../../actions';
import CloseButtonPopup from '../Others/CloseButtonPopup';
import {getDebugUri} from "../../utils/platform.service";
import {SELECTED_PANEL, SELECTED_SIDEBAR} from "../../actions/types";

const fs = require('fs-extra')
const Tools = require('../../utils/tools');
const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;

class DaemonErrorModal extends React.Component {
  constructor() {
    super();
    this.handleCancel = this.handleCancel.bind(this);
    this.exportDebugLogFile = this.exportDebugLogFile.bind(this);
    // this._handleKeyPress = this._handleKeyPress.bind(this);
  }

  _handleKeyPress = (e) => {
    console.log(e);
    if (e.key === 'Enter') {
      this.handleConfirm();
    }
  }

  exportDebugLogFile(){
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (folderPaths) => {
      if (folderPaths === undefined) {
        return;
      }

      var backupLocation = `${folderPaths}/debug.log`;
      try{
        fs.copySync(getDebugUri(), backupLocation);
      } catch (e){
        console.log(e)
      }
      
    });
  }

  componentWillMount(){
    Tools.hideFunctionIcons();
  }

  componentWillUnmount() {
    Tools.showFunctionIcons();
  }


  handleCancel(){
    this.props.setDaemonErrorPopup(false)
  }

  
  render() {
    const discordIcon = Tools.getIconForTheme('discord', false);
    return (
      <div style={{height: "100%", display: 'block', overflow: 'auto', width: '535px', margin: 'auto 0', padding: '10px',  minHeight: '400px'}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <div>
          <h3>Oops!</h3>
          <img height="75px" width="75px" src={discordIcon}></img>
          <p className="backupSuccessful">It looks like Sapphire is unable to load ECC's blockchain:</p>
          <p className="backupSuccessful">{this.props.daemonError}</p>
          <span style={{padding: '5px'}} onClick={this.exportDebugLogFile} className="buttonPrimary caps">Export Debug file</span>
          <p className="backupSuccessful">Please join our discord below, report your issue in #support and attach the above debug file</p>
          <a href="https://discord.gg/wAV3n2q" target="_blank">https://discord.gg/wAV3n2q</a>
          <div style={{height:"10px"}}></div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    daemonError: state.application.daemonError
  };
};


export default connect(mapStateToProps, actions)(DaemonErrorModal);
