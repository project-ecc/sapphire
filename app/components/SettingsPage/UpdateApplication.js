import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";
import { ipcRenderer } from 'electron';

import * as actions from '../../actions';
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';

import $ from 'jquery';

const tools = require('../../utils/tools');

class UpdateApplication extends React.Component {
 constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleConfirm(){
    this.props.setUpdateApplication(false);
    setTimeout(() => {
      this.props.setUpdatingApplication(true);
      ipcRenderer.send('update');
    }, 300)
  }

  handleCancel(){
    this.props.setUpdateApplication(false);
  }

  getCorrectHtml(){
    if(this.props.guiUpdate || (this.props.guiUpdate && this.props.daemonUpdate)){
      return(
        <p className="updateApplicationMessage">{ this.props.lang.updateRequiresRestart }</p>
      )
    }
    else {
      return(
        <p className="updateApplicationMessage">{ this.props.lang.updateDoesNotRequireRestart }</p>
      )
    }
  }

  render() {
     return (
      <div style={{height: "220px"}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.lang.applicationUpdate }</p>
        {this.getCorrectHtml()}
        <ConfirmButtonPopup handleConfirm={this.handleConfirm} text={ this.props.lang.confirm }/>
      </div>
      );
    }

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    guiUpdate: state.startup.guiUpdate,
    daemonUpdate: state.startup.daemonUpdate
  };
};


export default connect(mapStateToProps, actions)(UpdateApplication);
