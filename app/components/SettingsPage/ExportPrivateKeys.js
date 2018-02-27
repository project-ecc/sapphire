import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {TweenMax, TimelineMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';
import $ from 'jquery';
import { ipcRenderer } from 'electron';
var fs = require('fs');
var jsPDF = require('jsPDF');
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';
const tools = require('../../utils/tools')

class ExportPrivateKeys extends React.Component {
 constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.showWrongPassword = this.showWrongPassword.bind(this);
    this.handlePanels = this.handlePanels.bind(this);
    this.handleExportClick = this.handleExportClick.bind(this);
    this.generatePDF = this.generatePDF.bind(this);
    this.tween = undefined;
    this.toPrint = [];
  }
  
 componentWillAppear (callback) {
    callback();
  }
  
  componentDidAppear(e) {

  }
  
  componentWillEnter (callback) {
    callback();
  }
  
  componentDidEnter(callback) {
    tools.animatePopupIn(this.refs.second, callback, "22%");
  }

  componentWillLeave (callback) {
    tools.animatePopupOut(this.refs.second, callback)
  }

  showWrongPassword(){
    tools.showTemporaryMessage('#wrongPassword');
  }

  
  componentDidLeave(callback) {
  }  

  componentDidMount(){

  }

  componentWillUnmount(){
    this.props.setPanelExportingPrivateKeys(1);
  }

  handleChange(event) {
    this.props.setPassword(event.target.value);
  }

  handleCancel(){
    this.props.setExportingPrivateKeys(false)
  }

  handlePanels(){
    if(this.props.panelNumber == 1){
      this.handleConfirm();
    }
    else if(this.props.panelNumber == 2){
      this.export();
      /*$('#selectedlocation').text("No location selected");
      $('#selectedlocation').css("visibility", "visible");
      $('#selectedlocation').css("color", "#d09128");
      TweenMax.fromTo('#selectedlocation', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
      this.tween = TweenMax.to('#selectedlocation', 0.2, {scale: 0.5, autoAlpha: 0, delay: 3})
      TweenMax.set('#selectedlocation',{scale: 1, delay: 3.2})*/
    }
    /*else if(this.props.panelNumber == 2){
      TweenMax.to('#setLocationPanel', 0.3, {x: "-200%"})
      TweenMax.to('#exportingPanel', 0.3, {x: "-200%"})
      this.props.setPanelExportingPrivateKeys(this.props.panelNumber+1);
      this.animateDots();
      this.export();
    }*/
  }

  animateDots(){
    var t = new TimelineMax({repeat:-1});
    //t.staggerTo('.ecc', 0.2, {autoAlpha: 1}, 0.2)
    //.staggerTo('.ecc', 0.4, {autoAlpha: 0.2}, 0.1)
    t.to('#firstDot', 0.25, {autoAlpha: 1})
    .to('#secondDot', 0.25, {autoAlpha: 1})
    .to('#thirdDot', 0.25, {autoAlpha: 1})
    .to('#firstDot', 0.4, {autoAlpha: 0.2})
    .to('#secondDot', 0.4, {autoAlpha: 0.2, delay: -0.2})
    .to('#thirdDot', 0.4, {autoAlpha: 0.2, delay: -0.2})
  }

  getPasswordPanel(){
    return(
      <div id="passwordPanel" style={{position: "absolute", width: "100%", top: "70px"}}>
        <p style={{fontSize: "16px", color:"#b4b7c8", width: "400px", textAlign: "center", margin: "0 auto", paddingTop: "25px"}}>Please type your password</p>
        <input className="inputCustom" type="password" style={{width: "400px", top: "20px", marginBottom: "30px"}} value={this.props.passwordVal} onChange={this.handleChange} autoFocus></input>
        <div>
          <p id="wrongPassword" className="wrongPassword">Wrong password</p>
        </div>
      </div>
    )
  }

  getExportingPanel(){
    return(
      <div id="exportingPanel" style={{position: "absolute", left: "200%", width: "100%", top: "70px"}}>
        <p style={{marginTop:"30px"}}>Generating file</p>
        <span style={{visibility: "visible", fontSize: "40px", opacity:"0.2"}} className="ecc" id="firstDot">.</span><span style={{visibility: "visible", fontSize: "40px", opacity:"0.2"}} className="ecc" id="secondDot">.</span><span style={{visibility: "visible", fontSize: "40px", opacity:"0.2"}} className="ecc" id="thirdDot">.</span>
      </div>
    )
  }

  handleConfirm(){
    var self = this;
    var wasStaking = this.props.staking;
    this.unlockWallet(false, 5, async () => {
      TweenMax.to('#passwordPanel', 0.3, {x: "-100%"})
      TweenMax.to('#setLocationPanel', 0.3, {x: "-100%"})
      this.props.setPanelExportingPrivateKeys(this.props.panelNumber+1);
      $('#exportPrivKeyButton').text("Export");
      await this.getDataToExport();

      if(wasStaking){
          self.unlockWallet(true, 31556926, () => {
         });
      }
      else{ 
        self.props.setStaking(false);
      }
      self.props.setPassword("");
    })
  }

  async getDataToExport(){
    var accounts = await this.getAccounts();
    var addresses = await this.getAddressesOfAccounts(accounts);
    var batch = [];
    for(var i = 0; i < addresses[0].length; i++){
      batch.push({
        method: 'dumpprivkey', parameters: [addresses[0][i]]
      });
    }
    var privKeys = await this.getPrivateKeys(batch);
    
    var counter = 1;
    var aux = [];
    for(var i = 0; i < addresses[0].length; i++){

      aux.push(addresses[0][i]); 
      aux.push(privKeys[i]);
      aux.push("");
      counter++;
      if(counter == 24 || i == addresses[0].length - 1 ){
        this.toPrint.push([]);
        for(var j = 0; j < aux.length; j++)
          this.toPrint[this.toPrint.length-1].push(aux[j]);
        aux.length = 0;
        counter=1;
      }
    }
  }

  unlockWallet(flag, time, callback){
    var self = this;
    var batch = [];
    var obj = {
      method: 'walletpassphrase', parameters: [this.props.passwordVal, time, flag]
    }
    batch.push(obj)

    this.props.wallet.command(batch).then((data) => {
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

  export(){
    this.generatePDF();
  }

  generatePDF(){
    var doc = new jsPDF()
    doc.setFontSize(10);
    doc.text(this.toPrint[0], 10, 10)
    for(var i = 1; i < this.toPrint.length; i++){
      doc.addPage();
      doc.text(this.toPrint[i], 10, 10)
    }
    doc.save('printMe.pdf');
    this.toPrint = [];
    this.props.setExportingPrivateKeys(false)
    this.props.setBackupOperationCompleted(true);
  }

  getPrivateKeys(batch){
    return new Promise((resolve, reject) => {
      this.props.wallet.command(batch).then((data) => {
          resolve(data);
      }).catch((err) => {
          reject(null);
      });
    });
  }

  getAccounts(){
    return new Promise((resolve, reject) => {
      this.props.wallet.listAccounts().then((data) => {
          resolve(data);
      }).catch((err) => {
          reject(null);
      });
    });
  }

  getAddressesOfAccounts(accounts){
    return new Promise((resolve, reject) => {
      var promises = [];
      var keys = Object.keys(accounts);
      for(var i = 0; i < keys.length; i++){
        var promise = this.getAddress(keys[i]);
        promises.push(promise);
      }

      Promise.all(promises).then((data) => {
        var oneArray = [];
        if(data.length > 1)
        {
          for(var i = 0; i < data.length; i++){
            for(var j = 0; j < data[i].length; j++){
              oneArray.push(data[i][j]);
            }
          }
          data = oneArray;
        }
        resolve(data);
      }).catch((err) => {
        console.log("error waiting for all promises: ", err)
        reject(null);
      })
    });
  }

  getAddress(account){
    return new Promise((resolve, reject) => {
      this.props.wallet.getAddressesByAccount(account).then((address) => {
           resolve(address);
      }).catch((err) => {
          console.log("error getting address of account ", err)
          reject(null);
      });
    });
  }

  handleExportClick(){
    ipcRenderer.send('exportPrivateKeys');
    const self = this;
    ipcRenderer.on('locationSelected', (event, arg) => {
      if(arg != undefined){
        $('#exportPrivKeyButton').text("Export");
        $('#selectedlocation').text(arg);
        if(self.tween !== undefined)
          self.tween.kill();
        $('#selectedlocation').css("opacity", "1");
        $('#selectedlocation').css("color", "#555d77");
        $('#selectedlocation').css("visibility", "visible");
        self.props.setLocationToExport(arg);
      }
    });
  }

  getLocationToExportPanel(){
    return(
      <div id="setLocationPanel" style={{position: "absolute", left:"100%", width: "100%", top: "52px"}}>
        <p style={{fontSize: "16px", color:"#b4b7c8", width: "400px", textAlign: "center", margin: "0 auto", paddingTop: "25px", marginBottom:"25px", textAlign: "left"}}>
         The exported PDF has all your public and private keys. In this format:
        </p>
        <p style={{color:"#555d77", fontWeight: "600"}}>{`<Public Address>`}</p>
        <p style={{color:"#555d77", fontWeight: "600"}}>{`<Private Key>`}</p>
        <p style={{color:"#555d77", fontWeight: "600"}}>{`<Line Break>`}</p>
      </div>
    )
  }

  render() { 
      var shapeStyle = {
      fill: this.props.bgColor
    };
     return (
      <div ref="second" id="unlockPanel" style={{height: "300px", top: "22%", overflowX: "hidden"}}>
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">Export Private Keys</p>
        {this.getPasswordPanel()}
        {this.getLocationToExportPanel()}
        {this.getExportingPanel()}
        <ConfirmButtonPopup buttonId="exportPrivKeyButton" handleConfirm={this.handlePanels} text="Next"/>
      </div>
      );
    } 
};


const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    passwordVal: state.application.password,
    panelNumber: state.application.panelExportPrivateKey,
    locationToExport: state.application.locationToExport,
    sideBarHidden: state.sideBar.sidebarHidden,
    wallet: state.application.wallet,
    staking: state.chains.staking,
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(ExportPrivateKeys));