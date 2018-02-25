 import React, { Component } from 'react';
import { connect } from 'react-redux';
import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';
import $ from 'jquery';
import CloseButtonPopup from '../Others/CloseButtonPopup';
const tools = require('../../utils/tools')
import Input from '../Others/input';

class ImportPrivateKey extends React.Component {
 constructor() {
    super();
    this.handleChangePrivateKey = this.handleChangePrivateKey.bind(this)
    this.handleChangePassword = this.handleChangePassword.bind(this);
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
      tools.animatePopupIn(this.refs.second, callback, "22%");
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

  componentWillUnmount(){
    this.props.privateKey("");
    this.props.password("");
  }
  
  componentDidLeave(callback) {
  }

  unlockWallet(flag, time, callback){
    var self = this;
    var batch = [];
    var obj = {
      method: 'walletpassphrase', parameters: [this.props.passwordVal, time, flag]
    }
    batch.push(obj)

    this.props.wallet.command(batch).then((data) => {
      console.log("data: ", data)
      data = data[0];
      if (data !== null && data.code === -14) {
        self.showWrongPassword();
      } else if (data !== null && data.code === 'ECONNREFUSED') {
          console.log("daemong ain't working mate :(")
      } else if (data === null) {
          callback();
      } else {
        console.log("error unlocking wallet: ", data)
      }
    }).catch((err) => {
      console.log("err unlocking wallet: ", err);
    });
  }


  importPrivateKey(){
    if(this.props.passwordVal == ""){
      this.showWrongPassword();
      return;
    }
    this.unlockWallet(false, 5, () => {
      this.importingAddress();
      this.props.setCheckingDaemonStatusPrivKey(true)
      const method = "importprivkey"
      const parameters = [this.props.privateKeyValue];
      this.props.wallet.command([{ method, parameters }]).then((result) => {
        console.log(result)
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
        console.log("ERROR IMPORTING ADDRESS: ", result);
        if(result.code == "ECONNREFUSED")
          this.failedToImportAddress();
        //imported but rescaning 
        else if(result.code == "ESOCKETTIMEDOUT"){
          this.checkDaemonStatus();
          TweenMax.to('#importing p', 0.5, {autoAlpha: 1});
        }
      });
    });
  }

  checkDaemonStatus(){
    var self = this;
    this.props.wallet.getInfo().then((data) => {
      self.props.setCheckingDaemonStatusPrivKey(false);
      self.addressImported();
    })
    .catch((err) => {
      setTimeout(()=>{
        self.checkDaemonStatus();
      }, 1000)
    });
  }

  animateDots(){
    var tl = new TimelineMax({repeat:-1,repeatDelay:1});
    tl.staggerTo(".toAnimate", 0.5, {opacity:0, yoyo:true,repeat:-1}, 0.1);
  }

  importingAddress(){
    TweenMax.to('#importAddress', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.to('#importingPrivKey', 0.2, {autoAlpha: 1, scale: 1});
    this.animateDots();
  }

  addressImported(){
    this.props.password("");
    TweenMax.set('#enterPrivKey', {autoAlpha: 1});
    TweenMax.set('#enterPassword', {autoAlpha: 1});
    TweenMax.to(['#importingPrivKey','#importAddress'], 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.fromTo('#importedAddress', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
  }

  failedToImportAddress(){
    TweenMax.to(['#importingPrivKey','#importAddress'], 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.fromTo('#importFailed', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
  }
   
  handleChangePrivateKey(event) {
    let privKey = event.target.value;
    if(privKey.length == 0){
      TweenMax.set('#enterPrivKey', {autoAlpha: 1});
    }
    else 
      TweenMax.set('#enterPrivKey', {autoAlpha: 0});
    console.log(privKey)
    this.props.privateKey(privKey);
  }

  handleChangePassword(event) {
    let pw = event.target.value;
    if(pw.length == 0){
      TweenMax.set('#enterPassword', {autoAlpha: 1});
    }
    else 
      TweenMax.set('#enterPassword', {autoAlpha: 0});
    console.log(pw)
    this.props.password(pw);
  }

  goBackToFirstStep(){
    $('input').val('');
    this.props.privateKey("");
    this.props.password("");
    TweenMax.set('#enterPrivKey', {autoAlpha: 1});
    TweenMax.set('#enterPassword', {autoAlpha: 1});
    TweenMax.to('#importFailed', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.to('#importedAddress', 0.2, {autoAlpha: 0, scale: 0.5});
    TweenMax.fromTo('#importAddress', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
  }

  handleClose()
  {
    if(!this.props.checkingDaemonStatusPrivateKey)
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

  showWrongPassword(){
    tools.showTemporaryMessage('#wrongPassword');
  }

  toRender(){
    var textStyle = {fontWeight: "300"};
    var textStyleFix = {fontWeight: "300"};
    var title = null;
    var subTitle = {};

    if(this.props.notInitialSetup){
      textStyle = {
       fontWeight: "",
       fontSize: "16px",
       paddingTop: "30px"
      }
      textStyleFix = {
       fontWeight: "",
       fontSize: "16px"
      }
      subTitle = {
        paddingBottom: "30px"
      }
      title = <p style={{fontSize: "18px", color:"#b4b7c8", paddingTop: "20px"}}>Import Private Key</p>;
    }

    return (
      <div>
        {this.getCloseButton()}
        {title}
        <div id="importAddress" style={textStyle}>
          <p style={subTitle} className= {this.props.notInitialSetup ? "" : "subTitle"}>
           Write down a private key to import an address
           </p>
           <Input 
            divStyle={{width: "400px", fontWeight: "600"}}
              placeholder= "Private Key"
              placeholderId="enterPrivKey"
              value={this.props.privateKeyValue}
              handleChange={this.handleChangePrivateKey.bind(this)}
              type="text"
              inputStyle={{marginBottom:"32px", width:"400px"}}
            />
           <Input 
              divStyle={{width: "400px", fontWeight: "600"}}
              placeholder= "Enter your password"
              placeholderId="enterPassword"
              value={this.props.passwordVal}
              handleChange={this.handleChangePassword.bind(this)}
              type="text"
              inputStyle={{marginBottom:"10px", width:"400px"}}
            />
          <p id="wrongPassword" className="wrongPassword">Wrong password</p>
          <div onClick={this.importPrivateKey} className= {this.props.notInitialSetup ? "buttonUnlock buttonFixPrivKey" : ""} id= {this.props.notInitialSetup ? "" : "importButton"}>
               Import   
           </div>
        </div>
        <div style={textStyleFix} id="importingPrivKey" className={this.props.notInitialSetup ? "importingAddressPopup" : ""}>
          Importing your address <span className="toAnimate">.</span><span className="toAnimate">.</span><span className="toAnimate">.</span>
          <p>This process may take a few minutes to finish. Please do not close the application.</p>
        </div>
        <div style={textStyleFix} id="importedAddress" className={this.props.notInitialSetup ? "importedAddressPopup" : ""}>
          Imported the address successfully
          <div onClick={this.goBackToFirstStep} className= {this.props.notInitialSetup ? "buttonUnlock buttonFixPrivKey buttonIncreaseSize" : "importButtonAddress"} id= {this.props.notInitialSetup ? "" : "importButton"}>
               Import another address
           </div>
        </div>
        <div style={textStyleFix} id="importFailed" className={this.props.notInitialSetup ? "importFailedPopup" : ""}>
          Invalid address
          <div onClick={this.goBackToFirstStep} className= {this.props.notInitialSetup ? "buttonUnlock buttonFixPrivKey buttonIncreaseSize" : "importButtonAddress"} id= {this.props.notInitialSetup ? "" : "importButton"}>
               Import another address
           </div>
        </div>
      </div>
    )
  }

  render() { 
    console.log(this.props.notInitialSetup)
    var style = {height: "330px"};
    if(this.props.notInitialSetup){
      style = {
        height: "320px",
        width: "600px",
        backgroundColor: "#14182f",
        marginLeft: "-300px"
      }
    }
     return (
      <div  ref="second" id= {this.props.notInitialSetup ? "unlockPanel" : ""} style={style}>
        {this.toRender()}
      </div>
      );
    } 
};

const mapStateToProps = state => {
  return{
    direction: state.setup.direction,
    lang: state.startup.lang,
    privateKeyValue: state.setup.privateKey,
    wallet: state.application.wallet,
    passwordVal: state.setup.password,
    checkingDaemonStatusPrivateKey: state.application.checkingDaemonStatusPrivateKey
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(ImportPrivateKey));