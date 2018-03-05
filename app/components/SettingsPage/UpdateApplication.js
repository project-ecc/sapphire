import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import $ from 'jquery';
const tools = require('../../utils/tools')
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import { ipcRenderer } from 'electron';

class UpdateApplication extends React.Component {
 constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  
  handleConfirm(){
    var self = this;
    this.props.setUpdateApplication(false);
    this.props.setUpdateAvailable();
    setTimeout(() => {
      self.props.setUpdatingApplication(true);
      ipcRenderer.send('update');
    }, 300)
  }

  handleCancel(){
    this.props.setUpdateApplication(false);
  }

  getCorrectHtml(){
    if(this.props.guiUpdate || (this.props.guiUpdate && this.props.daemonUpdate)){
      return(
        <p className="updateApplicationMessage">This update requires a restart</p>
      )
    }
    else {
      return(
        <p className="updateApplicationMessage">This update does not require a restart</p>
      )
    }
  }

  render() { 
      var shapeStyle = {
      fill: this.props.bgColor
    };
     return (
      <div style={{height: "220px"}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">Application Update</p>
        {this.getCorrectHtml()}
        <ConfirmButtonPopup handleConfirm={this.handleConfirm} text="Confirm"/>
      </div>
      );
    } 
};

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    guiUpdate: state.startup.guiUpdate,
    daemonUpdate: state.startup.daemonUpdate
  };
};


export default connect(mapStateToProps, actions)(UpdateApplication);