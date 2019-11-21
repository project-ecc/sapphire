import React, {Component} from 'react';
import {connect} from 'react-redux';
import {TweenMax} from "gsap";
import {ipcRenderer} from 'electron';

import * as actions from '../../../actions/index';
import CloseButtonPopup from '../../Others/CloseButtonPopup';

const tools = require('../../../utils/tools');

class UpdateApplicationModal extends Component {
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

    return(
      <p className="updateApplicationMessage">{ this.props.lang.updateDoesNotRequireRestart }</p>
    )

  }

  render() {
     return (
      <div style={{height: "220px"}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.lang.applicationUpdate }</p>
        {this.getCorrectHtml()}
      </div>
      );
    }

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    daemonUpdate: state.startup.daemonUpdate
  };
};


export default connect(mapStateToProps, actions)(UpdateApplicationModal);
