import React, { Component } from 'react';
import { connect } from 'react-redux';
import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';
import $ from 'jquery';
import Wallet from '../../utils/wallet';
import CloseButtonPopup from '../Others/CloseButtonPopup';
const tools = require('../../utils/tools')

class ImportPrivateKey extends React.Component {
 constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.wallet = new Wallet();
    this.importPrivateKey = this.importPrivateKey.bind(this);
    this.addressImported = this.addressImported.bind(this);
    this.goBackToFirstStep = this.goBackToFirstStep.bind(this);
    this.failedToImportAddress = this.failedToImportAddress.bind(this);
    this.getCloseButton = this.getCloseButton.bind(this);
  }
  
 componentWillAppear (callback) {
    callback();
  }
  
  componentDidAppear(e) {
  }
  
  componentWillEnter (callback) {
    const el = this.refs.second;
    if(this.props.notInitialSetup){
      tools.animatePopupIn(this.refs.second, callback, "30%");
    }
    else
    {
      TweenMax.fromTo(el, 0.3, {x: 600, opacity: 0}, {x: 0, opacity:1,ease: Linear.easeNone, onComplete: callback});
    }
  }
  
  componentDidEnter() {
  }

  componentWillLeave (callback) {
    const el = this.refs.second;
    if(this.props.notInitialSetup){
      tools.animatePopupOut(this.refs.second, callback)
    }
    else{
      TweenMax.fromTo(el, 0.3, {x: 0, opacity: 1}, {x: -600, opacity: 0, ease: Linear.easeNone, onComplete: callback});
    }
  }
  
  componentDidLeave(callback) {
  }

  componentWillMount(){
    this.wallet.walletstart((result) => {
      if (result) {
        console.log("started daemon")
      }
    });
  }


  importPrivateKey(){
    TweenMax.to('#importAddress', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.to('#importing', 0.2, {autoAlpha: 1, scale: 1});

    const method = "importprivkey"
    const parameters = [this.props.privateKeyValue];
    this.wallet.command([{ method, parameters }]).then((result) => {
      if(result[0] == null){
        console.log("imported address")
        this.addressImported();
      }
      //loading wallet
      else if(result[0].code == "-28"){
        setTimeout(()=> {
          this.importPrivateKey();
        }, 100);
        
      }
      else{
        console.log("failed to import address")
        this.failedToImportAddress();
      }
    }).catch((result) => {
      if(result.code == "ECONNREFUSED")
      this.failedToImportAddress(true);
    });
  }

  addressImported(){
    TweenMax.to('#importing', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.fromTo('#importedAddress', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
  }

  failedToImportAddress(flag){
    TweenMax.to('#importing', 0.2, {autoAlpha: 0, scale: 0.5});
    if(!flag)
      TweenMax.fromTo('#importFailed', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    else 
      TweenMax.fromTo('#importFailedSlack', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
  }
   
  handleChange(event) {
    let privKey = event.target.value;
    if(privKey.length == 0){
      TweenMax.set('#enterPrivKey', {autoAlpha: 1});
    }
    else 
      TweenMax.set('#enterPrivKey', {autoAlpha: 0});
    console.log(privKey)
    this.props.privateKey(privKey);
  }

  goBackToFirstStep(){
    $('input').val('');
    TweenMax.to('#importFailed', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.to('#importedAddress', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.fromTo('#importAddress', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
  }

  handleClose()
  {
    this.props.setImportingPrivateKey(false);
  }

  getCloseButton(){
    if(this.props.notInitialSetup){
      return(
        <CloseButtonPopup handleClose={this.handleClose.bind(this)} />
      )
    }
    else return null;
  }

  toRender(){
    var textStyle = {fontWeight: "300"};
    var title = null;
    var subTitle = {};

    if(this.props.notInitialSetup){
      textStyle = {
       fontWeight: "",
       fontSize: "16px",
       paddingTop: "30px"
      }
      subTitle = {
        paddingBottom: "30px"
      }
      title = <p style={{fontSize: "18px", color:"#b4b7c8", paddingTop: "20px"}}>Import Private Key</p>;
    }
    
    //padding top 30 bottom 20

    return (
      <div>
        {this.getCloseButton()}
        {title}
        <div id="importAddress" style={textStyle}>
          <p style={subTitle} className= {this.props.notInitialSetup ? "" : "subTitle"}>
           Write down a private key to import an address
           </p>
         <div style={{position:"relative", width:"500px", margin:"0 auto"}}>
            <p id="enterPrivKey" style={{position:"absolute",top: "2px", width: "500px", textAlign: "center", color: "#555d77", fontSize: "15px", fontWeight: "600", zIndex:"-1"}}>Private Key</p>
            <input className="privateKey" type="text" value={this.props.privateKeyValue} onChange={this.handleChange} style={{color: "#555d77", fontSize: "15px", fontWeight:"600"}}></input>
          </div>
          <div onClick={this.importPrivateKey} id="importButton">
               Import   
           </div>
        </div>
        <div style={textStyle} id="importing">
          Importing your address
        </div>
        <div style={textStyle} id="importedAddress">
          Imported the address successfully
          <div onClick={this.goBackToFirstStep} id="importButton" className="importButtonAddress">
               Import another address
           </div>
        </div>
        <div style={textStyle} id="importFailed">
          Invalid address
          <div onClick={this.goBackToFirstStep} id="importButton" className="importButtonAddress">
               Import another address
           </div>
        </div>
          <div id="importFailedSlack">
          <p className="subTitle" style={{width: "400px", paddingTop: "0px", fontWeight: this.props.notInitialSetup ? "" : "300"}}>Failed to import address, please contact us on Slack because something is very wrong and we are very embarrassed</p>
        </div>
      </div>
    )
  }

  render() { 
    var style = {height: "330px"};
    if(this.props.notInitialSetup){
      style = {
        height: "265px",
        width: "600px",
        backgroundColor: "#14182f",
        marginLeft: "-300px"
      }
    }
     return (
      <div  ref="second" id="unlockPanel" style={style}>
        {this.toRender()}
      </div>
      );
    } 
};

const mapStateToProps = state => {
  return{
    direction: state.setup.direction,
    lang: state.startup.lang,
    privateKeyValue: state.setup.privateKey
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(ImportPrivateKey));