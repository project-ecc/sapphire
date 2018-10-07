import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax, TimelineMax} from "gsap";
import { ipcRenderer } from 'electron';
import * as actions from '../../actions';

import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';

import $ from 'jquery';
import Toast from '../../globals/Toast/Toast';

const Tools = require('../../utils/tools');
const os = require('os');
const { clipboard } = require('electron');

var fs = require('fs');
var jsPDF = require('jspdf');

class ExportPrivateKeys extends React.Component {
  constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.showWrongPassword = this.showWrongPassword.bind(this);
    this.handlePanels = this.handlePanels.bind(this);
    this.handleExportClick = this.handleExportClick.bind(this);
    this.generatePDF = this.generatePDF.bind(this);
    this.handleDisplayKeys = this.handleDisplayKeys.bind(this);

    this.tween = undefined;
    this.toPrint = [];
    this.displayConfirm = true;

    this.state = {
      toDisplay: {}
    };
    this.addressesToCopy = "";
  }

  showWrongPassword(){
    Toast({
      title: this.props.lang.error,
      message: this.props.lang.wrongPassword,
      color: 'red'
    });
    this.props.setPopupLoading(false);
  }

  componentWillUnmount(){
    this.toPrint = null;
    this.addressesToCopy = "";
    this.props.setPanelExportingPrivateKeys(1);
    this.tween = undefined;
    this.props.setPassword("");
  }

  componentWillMount(){
    this.setState({toDisplay: {}})
  }

  handleCancel(){
    this.props.setExportingPrivateKeys(false)
  }

  async handlePanels(){
    if(this.props.panelNumber === 1){
      this.displayConfirm = false;
      this.props.setPopupLoading(true)
      this.handleConfirm();
    }
    else if(this.props.panelNumber === 2){
      this.handleExportOptions();
      this.displayConfirm = true;

      /*$('#selectedlocation').text("No location selected");
      $('#selectedlocation').css("visibility", "visible");
      $('#selectedlocation').css("color", "#d09128");
      TweenMax.fromTo('#selectedlocation', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
      this.tween = TweenMax.to('#selectedlocation', 0.2, {scale: 0.5, autoAlpha: 0, delay: 3})
      TweenMax.set('#selectedlocation',{scale: 1, delay: 3.2})*/
    }
    else if(this.props.panelNumber === 3){
      //this.displayConfirm = true;
      this.export();
    }
    else if(this.props.panelNumber === 4){
      clipboard.writeText(this.addressesToCopy);
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
    let t = new TimelineMax({repeat:-1});
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
        <p style={{fontSize: "16px", width: "450px", margin: "0 auto",textAlign: "justify"}}>{ this.props.lang.exportWarning }</p>
        <div>
          <Input
            style={{width: "80%", marginTop: "34px"}}
            placeholder= { this.props.lang.password }
            placeholderId= "password"
            value={this.props.passwordVal}
            handleChange={this.props.setPassword}
            type="password"
            inputId="exportPrivKeyId"
            autoFocus
            onSubmit={this.handlePanels}
          />
        </div>
      </div>
    )
  }

  // getExportingPanel(){
  //   return(
  //     <div id="exportingPanel" style={{position: "absolute", left: "200%", width: "100%", top: "70px"}}>
  //       <p style={{marginTop:"30px"}}>{ this.props.lang.generatingFile }</p>
  //       <span style={{visibility: "visible", fontSize: "40px", opacity:"0.2"}} className="ecc" id="firstDot">.</span><span style={{visibility: "visible", fontSize: "40px", opacity:"0.2"}} className="ecc" id="secondDot">.</span><span style={{visibility: "visible", fontSize: "40px", opacity:"0.2"}} className="ecc" id="thirdDot">.</span>
  //     </div>
  //   )
  // }

  handleExportOptions(){
    $('#exportPrivKeyButton').text( this.props.lang.export);
    TweenMax.to('#exportOptions', 0.3, {css:{left: "-100%"}});
    TweenMax.to('#setLocationPanel', 0.3, {css:{left: "0%"}});
    $('#confirmButtonPopup').text(this.props.lang.export);
    TweenMax.to('#confirmButtonPopup', 0.3, {autoAlpha: 1, delay: 0.3});

    this.props.setPanelExportingPrivateKeys(this.props.panelNumber+1);
  }

  handleDisplayKeys(){
    let height = Object.keys(this.state.toDisplay).length === 1 ? 300 : 400;
    TweenMax.to('#exportOptions', 0.3, {css:{left: "-100%"}});
    TweenMax.to('#displayKeys', 0.3, {css:{left: "0%", width: "570px"}});
    TweenMax.to('#unlockPanel', 0.2, {css:{height: height +"px", top: "19%", minWidth:"570px", marginLeft:"-274px"}});
    TweenMax.to('#exportPrivKey', 0.2, {css:{height: height+"px"}});
    $('#confirmButtonPopup').text(this.props.lang.copyAll);
    //TweenMax.set('#confirmButtonPopup', {css:{left: "218px"}});
    TweenMax.to('#confirmButtonPopup', 0.3, {autoAlpha: 1, delay: 0.8});
    TweenMax.set('#displayKeys p', {width: "450px"});
    this.props.setPanelExportingPrivateKeys(this.props.panelNumber+2);
  }

  handleConfirm(){
    if(this.props.passwordVal === ""){
      this.showWrongPassword();
      return;
    }
    this.unlockWallet(false, 30, async () => {
      await this.getDataToExport();
    })
  }

  async getDataToExport(){
    let wasStaking = this.props.staking;
    let addresses = this.props.addresses;
    let batch = [];
    let addressesArray = [];
    addresses.map((address) => {
      batch.push({
        method: 'dumpprivkey', parameters: [address.address]
      });
      addressesArray.push(address.address);
    });

    let privKeys = await this.getPrivateKeys(batch);
    let counter = 1;
    let aux = [];
    let keys = [];


    for(let i = 0; i < addressesArray.length; i++){
      aux.push(addressesArray[i]);
      aux.push(privKeys[i]);
      aux.push("");

      keys[i] = {publicKey: addressesArray[i], privateKey: privKeys[i]};

      counter++;
      if(counter === 24 || i === addressesArray.length - 1 ){
        this.toPrint.push([]);
        for(let j = 0; j < aux.length; j++)
          this.toPrint[this.toPrint.length-1].push(aux[j]);
        aux.length = 0;
        counter=1;
      }
    }
    this.setState({ toDisplay: keys });
    console.log(this.state.toDisplay)
    this.props.setPopupLoading(false)
    if(wasStaking){
      this.unlockWallet(true, 31556926, () => {});
    } else {
      this.props.setStaking(false);
    }
    TweenMax.to('#passwordPanel', 0.3, {x: "-100%"});
    TweenMax.to('#exportOptions', 0.3, {css: {left:"0%"}});
    TweenMax.to('#confirmButtonPopup', 0.3, {x: "-450px", autoAlpha: 0});
    setTimeout(() => {
      TweenMax.set('#confirmButtonPopup', {x: "-50%"});
    }, 300)
    this.props.setPanelExportingPrivateKeys(this.props.panelNumber+1);
    this.props.setPassword("");
  }

  unlockWallet(flag, time, callback){
    let batch = [];
    let obj = {
      method: 'walletpassphrase', parameters: [this.props.passwordVal, time, flag]
    };
    batch.push(obj);

   this.props.wallet.command(batch).then((data) => {
      data = data[0];
      if (data !== null && data.code === -14) {
        this.showWrongPassword();
      } else if (data !== null && data.code === 'ECONNREFUSED') {
        console.log("daemong ain't working mate :(")
      } else if (data === null) {
        this.props.setPopupLoading(false)
        callback();
      } else {
        console.log("error unlocking wallet: ", data)
      }
      this.props.setPopupLoading(false)
    }).catch((err) => {
      console.log("err unlocking wallet: ", err);
      this.props.setPopupLoading(false)
    });
  }

  export(){
    this.generatePDF();
  }

  generatePDF(){
    let doc = new jsPDF();
    doc.setFontSize(10);
    doc.text(this.toPrint[0], 10, 10);
    for(let i = 1; i < this.toPrint.length; i++){
      doc.addPage();
      doc.text(this.toPrint[i], 10, 10)
    }
    doc.save('printMe.pdf');
    this.toPrint = [];
    this.props.setExportingPrivateKeys(false);
    //this.props.setBackupOperationCompleted(true);
  }

  getPrivateKeys(batch){
    return new Promise((resolve, reject) => {
      this.props.wallet.command(batch).then((data) => {
        resolve(data);
      }).catch((err) => {
        console.log(err)
        reject(null);
      });
    });
  }

  handleExportClick(){
    ipcRenderer.send('exportPrivateKeys');
    ipcRenderer.on('locationSelected', (event, arg) => {
      if(arg !== undefined){
        $('#exportPrivKeyButton').text(this.props.lang.export);
        $('#selectedlocation').text(arg);
        if(this.tween !== undefined)
          this.tween.kill();
        $('#selectedlocation').css("opacity", "1");
        $('#selectedlocation').css("color", "#555d77");
        $('#selectedlocation').css("visibility", "visible");
        this.props.setLocationToExport(arg);
      }
    });
  }

  getLocationToExportPanel(){
    return(
      <div id="setLocationPanel" style={{position: "absolute", left:"100%", width: "100%", top: "52px"}}>
        <p style={{fontSize: "16px", width: "400px", margin: "0 auto", paddingTop: "25px", marginBottom:"25px", textAlign: "left"}}>
          { this.props.lang.exportFormat }:
        </p>
        <p className="pdfExample">{`<${this.props.lang.publicAddress}>`}</p>
        <p className="pdfExample">{`<${this.props.lang.privateKey}>`}</p>
        <p className="pdfExample">{`<${this.props.lang.lineBreak}>`}</p>
      </div>
    )
  }

  renderExportOptions(){
    return(
      <div id="exportOptions" style={{position: "absolute", left:"100%", width: "100%", top: "52px"}}>
        <p style={{fontSize: "16px", width: "440px", textAlign: "center", margin: "0 auto", paddingTop: "25px", marginBottom:"25px", textAlign: "left"}}>
          {this.props.lang.exportPrivKeyDesc}
        </p>
        <div style={{display: "flex", width: "80%", margin: "0 auto", marginTop: "35px"}}>
          <div onClick={this.handleDisplayKeys}  className="buttonPrimary" style={{top: "130px", left:"115px"}}>{this.props.lang.viewOnScreen}</div>
          <div onClick={this.handlePanels} className="buttonPrimary" style={{top: "130px", left:"293px"}}>{this.props.lang.exportToPdf}</div>
        </div>
      </div>
    )
  }

  handleMouseEnterAddress(id){
    TweenMax.set(id, {autoAlpha: 1});
  }

  handleMouseLeaveAddress(id){
    TweenMax.set(id, {autoAlpha: 0});
  }

  handleCopyAddressClicked(publicAddress, privateAddress, element){
    let toCopy = publicAddress + os.EOL + privateAddress;
    clipboard.writeText(toCopy);
    TweenMax.to(element, 0.1, {scale: 1.1});
    TweenMax.to(element, 0.1, {scale: 1, delay: 0.1})
  }

  renderdisplayKeys(){
    if(this.state.toDisplay === null){
      return
    }
    let counter = 0;
    console.log(this.state.toDisplay)
    const keys = Object.keys(this.state.toDisplay).map((key) => {
      let pubKey = this.state.toDisplay[key].publicKey;
      let privKey = this.state.toDisplay[key].privateKey;
      this.addressesToCopy += pubKey + os.EOL;
      this.addressesToCopy += privKey + os.EOL;
      this.addressesToCopy += os.EOL;
      counter+=1;
      return(
        <div onMouseEnter={this.handleMouseEnterAddress.bind(this, "#copyPrivKey" + counter)} onMouseLeave={this.handleMouseLeaveAddress.bind(this, "#copyPrivKey" + counter)} className="keysItem" key={key}>
          <p onClick={this.handleCopyAddressClicked.bind(this, pubKey, privKey, "#copyPrivKey" + counter)} id={"copyPrivKey" + counter} className="copyPrivKey">copy</p>
          <p>{pubKey}</p>
          <p>{privKey}</p>
        </div>
      )
      }
    );
    return(
      <div id="displayKeys" style={{position: "relative", left:"100%", width: "535px"}}>
        <p style={{fontSize: "16px", width: "400px", textAlign: "center", margin: "0 auto", paddingTop: "25px", marginBottom:"20px", textAlign: "left"}}>
          {`${this.props.lang.listing} ${keys.length}  ${keys.length === 1 ? this.props.lang.addressInFormat : this.props.lang.addressesInFormat}:`}
        </p>
        <p style={{paddingTop: "15px"}} className="pdfExample">{`<${this.props.lang.publicAddress}>`}</p>
        <p className="pdfExample">{`<${this.props.lang.privateKey}>`}</p>
        <div className="keysHolder">
          {keys}
        </div>
      </div>
    )
  }

  render() {
    return (
      <div id="exportPrivKey">
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.lang.exportPrivateKeys }</p>
        {this.getPasswordPanel()}
        {this.renderExportOptions()}
        {this.getLocationToExportPanel()}
        {this.renderdisplayKeys()}

        <ConfirmButtonPopup inputId="#exportPrivKeyId" handleConfirm={this.handlePanels} textLoading={this.props.lang.next} text={this.props.lang.next}/>
      </div>
    );
  }

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    passwordVal: state.application.password,
    panelNumber: state.application.panelExportPrivateKey,
    locationToExport: state.application.locationToExport,
    sideBarHidden: state.sideBar.sidebarHidden,
    wallet: state.application.wallet,
    staking: state.chains.isStaking,
    addresses: state.application.userAddresses
  };
};


export default connect(mapStateToProps, actions)(ExportPrivateKeys);
