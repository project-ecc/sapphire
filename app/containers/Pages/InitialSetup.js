import React, { Component } from 'react';
import ImportWallet from    '../../components/InitialSetupPage/ImportWallet';
import LanguageSelector from     '../../components/InitialSetupPage/LanguageSelector';
import ThemeSelector from '../../components/InitialSetupPage/ThemeSelector';
import ImportPrivateKey from '../../components/InitialSetupPage/ImportPrivateKey';
import EncryptWallet from '../../components/InitialSetupPage/EncryptWallet';
import SetupDone from '../../components/InitialSetupPage/SetupDone';
import { connect } from 'react-redux';
import { traduction } from '../../lang/lang';
import * as actions from '../../actions';
import TransitionGroup from 'react-transition-group/TransitionGroup';
const settings = require('electron-settings');
import { ipcRenderer } from 'electron';
import connectWithTransitionGroup from 'connect-with-transition-group';

class InitialSetup extends Component {
  constructor(props) {
    super(props);
    this.handleForward = this.handleForward.bind(this);
  }
  
  componentDidAppear(e) {
    console.log("componentDidAppear")

    const el = this.refs.second;
    TweenMax.fromTo(el, 0.5, {opacity: 0}, {opacity:1 ,ease: Linear.easeNone});
  }
  
  componentWillEnter (callback) {
    console.log("componentWillEnter")
    callback();
  }
  
  componentWillLeave (callback) {
     console.log("componentWillLeave")
    const el = this.refs.second;
    TweenMax.to(el, 0.3, {opacity:0 ,ease: Linear.easeNone, onComplete: callback});
  }

  handleForward() {
    if(this.props.importing || !this.props.stepOverVal || this.props.encrypting) return;
    else if(this.props.step == 6 || (this.props.step == 5 && this.props.importedWalletVal) || (this.props.step == 4 && this.props.totalSteps == 2) || (this.props.step == 4 && this.props.totalSteps == 0)){
      console.log("Done with setup!") 
      ipcRenderer.send('initialSetup');
      this.props.setSetupDone();
      return;
    }
    this.props.stepForward();
      const self = this;
      setTimeout(() => {
        self.props.stepOver();
      }, 300);
  };

  render() {
    const divStyle = {
      opacity: '0',
      cursor: 'default'
    };

    const buttonStyle = {
      cursor: this.props.importing || this.props.encrypting ? 'default' : 'pointer'
    }

    const logo = require('../../../resources/images/logo_setup.png');
    console.log("STEP", this.props.step)
    console.log("total steps", this.props.totalSteps)
    return (
      <div ref="second">
        <div id="mainPanel">
          <div id="logo">
            <img src={logo}></img>
          </div>
          <div className="content">
            <p style={{fontWeight:"200"}} id="welcome">
             {this.props.lang.welcome}
           </p>
           <TransitionGroup component={"article"}>
               { this.props.step == 1 && this.props.totalSteps != 0 ? <LanguageSelector/> : null}
            </TransitionGroup>
            <TransitionGroup component={"article"}>
               { this.props.step == 2 && this.props.totalSteps != 0? <ThemeSelector/> : null}
            </TransitionGroup>
            <TransitionGroup component={"article"}>
               { (this.props.step == 3 && this.props.totalSteps == 4) || (this.props.step == 1 && this.props.totalSteps == 0) ? <ImportWallet/> : null}
            </TransitionGroup>
            <TransitionGroup component={"article"}>
               { (this.props.step == 4 && this.props.importedWalletVal) || (this.props.step == 2 && (this.props.totalSteps == 2 || this.props.totalSteps == 0))  ? <EncryptWallet checkEncrypted = {this.props.importedWalletVal || this.props.totalSteps == 2}/> : null}
            </TransitionGroup>
            <TransitionGroup component={"article"}>
               { (this.props.step == 4 && this.props.totalSteps == 4 && !this.props.importedWalletVal) || (this.props.step == 3 && this.props.totalSteps == 0) ? <ImportPrivateKey notInitialSetup = {false}/> : null}
            </TransitionGroup>
            <TransitionGroup component={"article"}>
               { this.props.step == 5 && !this.props.importedWalletVal ? <EncryptWallet checkEncrypted = {this.props.importedWalletVal}/> : null}
            </TransitionGroup>
            <TransitionGroup component={"article"}>
               { this.props.step == 6 || (this.props.step == 5 && this.props.importedWalletVal) || (this.props.step == 4 && this.props.totalSteps == 2) || (this.props.step == 4 && this.props.totalSteps == 0) ? <SetupDone/> : null}
            </TransitionGroup>
          </div>
          <div id="buttons">
            <div className="button" id="buttonForward" style = {buttonStyle} onClick={this.handleForward}>
              <svg className="arrowRight" viewBox="0 0 256 256">
                <polyline
                    fill="none" 
                    stroke=  {this.props.importing || this.props.encrypting ? "#212a4c" : "#d09128"}
                    strokeWidth="33" 
                    strokeLinejoin="round" 
                    strokeLinecap="round" 
                    points="72,16 184,128 72,240" 
                />
              </svg>
              <svg className="circle" height="35" width="35">
                <circle cx="17.5" cy="17.5" r="17" stroke = {this.props.importing || this.props.encrypting ? "#212a4c" : "#d09128"} strokeWidth= "1.5" fill="transparent" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    step: state.setup.step,
    totalSteps: state.startup.totalSteps,
    lang: state.startup.lang,
    importing: state.setup.importing,
    importedWalletVal : state.setup.imported,
    stepOverVal: state.setup.stepOver,
    encrypting: state.setup.encrypting
  };
};

export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(InitialSetup));