import React, { Component } from 'react';
import { connect } from 'react-redux';
import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';
import { ipcRenderer } from 'electron';

class ImportWallet extends React.Component {
 constructor() {
    super();
    this.openFile = this.openFile.bind(this);
    this.sendActionImportCancelled = this.sendActionImportCancelled.bind(this);
    this.sendActionImportedWallet = this.sendActionImportedWallet.bind(this);
    this.sendActionImportStarted = this.sendActionImportStarted.bind(this);
  }
  
 componentWillAppear (callback) {
    callback();
  }
  
  componentDidAppear(e) {
    console.log("componentDidAppear")
  }
  
   componentWillEnter (callback) {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.3, {x: 600, opacity: 0}, {x: 0, opacity:1,ease: Linear.easeNone, onComplete: callback});
  }
  
  componentDidEnter(callback) {
  }

  componentWillLeave (callback) {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.3, {x: 0, opacity: 1}, {x: -600, opacity: 0, ease: Linear.easeNone, onComplete: callback});
  }
  
  componentDidLeave(callback) {
  }

  componentWillMount(){
    ipcRenderer.on('importedWallet', this.sendActionImportedWallet);
    ipcRenderer.on('importStarted', this.sendActionImportStarted);
    ipcRenderer.on('importCancelled', this.sendActionImportCancelled);
  }

  sendActionImportedWallet(){
    this.props.importedWallet();
    TweenMax.to('#importing', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.fromTo('.imported', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
  }

  sendActionImportCancelled(){
    this.props.importCancelled();
  }

  sendActionImportStarted(){
    this.props.importStarted();
    TweenMax.to('#import', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.to('#importing', 0.2, {autoAlpha: 1, scale: 1});
  }

  componentWillUnmount(){
    ipcRenderer.removeListener('importedWallet', this.sendActionImportedWallet);
    ipcRenderer.removeListener('importStarted', this.sendActionImportStarted);
    ipcRenderer.removeListener('importCancelled', this.sendActionImportCancelled);
  }
  
  openFile() {
    if(this.props.importing) 
      return;
    this.props.importingWallet();
    ipcRenderer.send('importWallet');
  }

  toRender(){
    if(!this.props.imported){
      return (
        <div>
          <p style={{fontWeight:"300"}} className="subTitle">
           Import an existing wallet if you have one
          </p>
          <div id="import">
             <div onClick={this.openFile} id="importButton">
               Import
             </div>
          </div>
          <div style={{fontWeight:"300"}} id="importing">
            Importing your wallet
          </div>
          <div style={{fontWeight:"300"}} id="imported">
            Imported your wallet successfully
          </div>
        </div>
      )
    }
    else{
      return (
        <div>
          <p style={{fontWeight:"300"}} className="subTitle">
           Import an existing wallet if you have one
          </p>
          <div style={{fontWeight:"300"}} className="imported">
            Imported your wallet successfully
          </div>
        </div>
      )
    }
  }

  render() { 
      var shapeStyle = {
      fill: this.props.bgColor
    };
     return (
      <div ref="second" style={{height: "330px"}}>
        {this.toRender()}
      </div>
      );
    } 
};

const mapStateToProps = state => {
  return{
    direction: state.setup.direction,
    lang: state.startup.lang,
    importing: state.setup.importing,
    imported: state.setup.imported,
    importHasStarted: state.setup.importStarted
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(ImportWallet));