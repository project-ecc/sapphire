 import React, { Component } from 'react';
import { connect } from 'react-redux';
import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import $ from 'jquery';
import CloseButtonPopup from '../Others/CloseButtonPopup';
const Tools = require('../../utils/tools')
import Input from '../Others/Input';

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

  componentWillUnmount(){
    this.props.privateKey("");
    this.props.password("");
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
        self.props.setCheckingDaemonStatusPrivKey(false)
        self.showWrongPassword();
      } else if (data !== null && data.code === 'ECONNREFUSED') {
          console.log("daemong ain't working mate :(")
      } else if (data === null) {
          callback();
      } else {
        setTimeout(()=> {
            self.props.setCheckingDaemonStatusPrivKey(true)
            self.importPrivateKey();
          }, 500);
      }
    }).catch((err) => {
      console.log("err unlocking wallet: ", err);
    });
  }

  hideFunctionIcons(){
    if(this.props.showingFunctionIcons){
      Tools.hideFunctionIcons();
      this.props.setShowingFunctionIcons(false);
    }
  }

  showFunctionIcons(){
    if(!this.props.showingFunctionIcons){
      Tools.showFunctionIcons();
      this.props.setShowingFunctionIcons(true);
    }
  }

  importPrivateKey(){
    if(this.props.passwordVal == ""){
      this.showWrongPassword();
      return;
    }
    this.unlockWallet(false, 5, () => {
      this.hideFunctionIcons();
      this.importingAddress();
      this.props.setCheckingDaemonStatusPrivKey(true)
      const method = "importprivkey"
      const parameters = [this.props.privateKeyValue];
      this.props.wallet.command([{ method, parameters }]).then((result) => {
        console.log(result)
        if(result[0] == null){
          console.log("imported address")
          this.props.setCheckingDaemonStatusPrivKey(false);
          this.showFunctionIcons();
          this.addressImported();
        }
        //loading wallet
        else if(result[0].code == "-28"){
          setTimeout(()=> {
            this.importPrivateKey();
          }, 500);
          
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
          TweenMax.to('#importingPrivKey p', 0.5, {autoAlpha: 1});
        }
      });
    });
  }

  checkDaemonStatus(){
    var self = this;
    this.props.wallet.getInfo().then((data) => {
      self.showFunctionIcons();
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
    Tools.showTemporaryMessage('#wrongPassword');
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
      title = <p style={{fontSize: "18px", color:"#b4b7c8", paddingTop: "20px"}}>{ this.props.lang.importPrivateKey }</p>;
    }

    return (
      <div>
        {this.getCloseButton()}
        {title}
        <div id="importAddress" style={textStyle}>
          <p style={subTitle} className= {this.props.notInitialSetup ? "" : "subTitle"}>
           { this.props.lang.writeDownAPrivateKeyToImport }
           </p>
           <Input 
            divStyle={{width: "400px"}}
              placeholder= { this.props.lang.enterPrivKey }
              placeholderId="enterPrivKey"
              placeHolderClassName="inputPlaceholder changePasswordInput"
              value={this.props.privateKeyValue}
              handleChange={this.handleChangePrivateKey.bind(this)}
              type="text"
              inputStyle={{marginBottom:"32px", width:"400px"}}
            />
           <Input 
              divStyle={{width: "400px"}}
              placeholder= { this.props.lang.enterYourPassword }
              placeholderId="enterPassword"
              placeHolderClassName="inputPlaceholder changePasswordInput"
              value={this.props.passwordVal}
              handleChange={this.handleChangePassword.bind(this)}
              type="text"
              inputStyle={{marginBottom:"10px", width:"400px"}}
            />
          <p id="wrongPassword" className="wrongPassword">{ this.props.lang.wrongPassword }</p>
          <div onClick={this.importPrivateKey} className= {this.props.notInitialSetup ? "buttonUnlock buttonFixPrivKey" : ""} id= {this.props.notInitialSetup ? "" : "importButton"}>
            { this.props.lang.import }   
           </div>
        </div>
        <div style={textStyleFix} id="importingPrivKey" className={this.props.notInitialSetup ? "importingAddressPopup" : ""}>
          { this.props.lang.importingAddressPopup } <span className="toAnimate">.</span><span className="toAnimate">.</span><span className="toAnimate">.</span>
          <p>{ this.props.lang.pleaseWait }</p>
        </div>
        <div style={textStyleFix} id="importedAddress" className={this.props.notInitialSetup ? "importedAddressPopup" : ""}>
          { this.props.lang.importedAddress }
          <div onClick={this.goBackToFirstStep} className= {this.props.notInitialSetup ? "buttonUnlock buttonFixPrivKey buttonIncreaseSize" : "importButtonAddress"} id= {this.props.notInitialSetup ? "" : "importButton"}>
            { this.props.lang.importAnotherAddress }
           </div>
        </div>
        <div style={textStyleFix} id="importFailed" className={this.props.notInitialSetup ? "importFailedPopup" : ""}>
          { this.props.lang.invalidFailedAddress }
          <div onClick={this.goBackToFirstStep} className= {this.props.notInitialSetup ? "buttonUnlock buttonFixPrivKey buttonIncreaseSize" : "importButtonAddress"} id= {this.props.notInitialSetup ? "" : "importButton"}>
            { this.props.lang.importAnotherAddress }
           </div>
        </div>
      </div>
    )
  }

  render() { 
    var id = "importPrivKey";
    if(this.props.notInitialSetup){
      id="importPrivKeyPopup";
    }
     return (
      <div id={id}>
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
    checkingDaemonStatusPrivateKey: state.application.checkingDaemonStatusPrivateKey,
    showingFunctionIcons: state.application.showingFunctionIcons
  };
};


export default connect(mapStateToProps, actions)(ImportPrivateKey);