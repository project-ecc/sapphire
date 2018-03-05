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
import TransitionComponent from '../../components/Others/TransitionComponent';
const Tools = require('../../utils/tools')

class InitialSetup extends Component {
  constructor(props) {
    super(props);
    this.handleForward = this.handleForward.bind(this);
    this.renderStep = this.renderStep.bind(this);
    this.renderPartialInitialSetup = this.renderPartialInitialSetup.bind(this);
    this.renderInitialSetup = this.renderInitialSetup.bind(this);
  }
  
  componentDidAppear() {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.5, {opacity: 0}, {opacity:1 ,ease: Linear.easeNone});
  }
  
  componentWillEnter (callback) {
    callback();
  }
  
  componentWillLeave (callback) {
    const el = this.refs.second;
    TweenMax.to(el, 0.3, {opacity:0 ,ease: Linear.easeNone, onComplete: callback});
  }

  handleForward() {
    if(this.props.importing || !this.props.stepOverVal || this.props.encrypting || this.props.importingPrivKey) return;
    else if(this.props.setupDoneInternal){
      console.log("Done with setup!") 
      ipcRenderer.send('initialSetup');
      this.props.setSetupDone();
      return;
    }
    else if(this.props.totalSteps == 1){
      this.props.setUnencryptedWallet(false);
    }
    this.props.stepForward();
      const self = this;
      setTimeout(() => {
        self.props.stepOver();
      }, 300);
  };

  //this is not the prettiest thing but for components to animate OUT they need to be unmounted from the TransitionComponent... The TransitionComponent needs to stay in the DOM otherwise we don't get the animation out (when the child component unmounts)
  renderInitialSetup(){
    return(
      <div>
        <TransitionGroup key="1" component="article">
        {this.props.step == 1 ?
          <TransitionComponent 
            children= {<LanguageSelector/>}
            animationType= "firstSetupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/>
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="2" component="article">
        {this.props.step == 2 ?
          <TransitionComponent 
            children= {<ThemeSelector/>}
            animationType= "setupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/> 
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="3" component="article">
        {this.props.step == 3 ?
          <TransitionComponent 
            children= {<ImportWallet/>}
            animationType= "setupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/> 
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="4" component="article">
        {this.props.step == 4 ?
          <TransitionComponent 
            children= {<EncryptWallet checkEncrypted = {this.props.importedWalletVal}/>}
            animationType= "setupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/> 
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="5" component="article">
        {this.props.step == 5 ?
          <TransitionComponent 
            children= {<ImportPrivateKey notInitialSetup = {false}/>}
            animationType= "setupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/> 
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="6" component="article">
        {this.props.step == 6 ?
          <TransitionComponent 
            children= {<SetupDone />}
            animationType= "setupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/> 
            : null
        }
        </TransitionGroup>
      </div>
    )
  }

  renderPartialInitialSetup(){
    return(
      <div>
        <TransitionGroup key="1" component="article">
        {this.props.step == 1 ?
          <TransitionComponent 
            children= {<LanguageSelector/>}
            animationType= "firstSetupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/>
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="2" component="article">
        {this.props.step == 2 ?
          <TransitionComponent 
            children= {<ThemeSelector/>}
            animationType= "setupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/> 
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="3" component="article">
        {this.props.step == 3 ?
          <TransitionComponent 
            children= {<EncryptWallet checkEncrypted = {true}/>}
            animationType= "setupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/> 
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="4" component="article">
        {this.props.step == 4 ?
          <TransitionComponent 
            children= {<SetupDone />}
            animationType= "setupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/> 
            : null
        }
        </TransitionGroup>
      </div>
    )
  }

  renderUnencryptedWalletSetup(){
    return(
      <div>
        <TransitionGroup key="1" component="article">
        {this.props.step == 1 ?
          <TransitionComponent 
            children= {<EncryptWallet checkEncrypted = {false}/>}
            animationType= "firstSetupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/> 
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="2" component="article">
          {this.props.step == 2 ?
            <TransitionComponent 
              children= {<SetupDone />}
              animationType= "setupStep"
              animateIn= {Tools.animateStepIn}
              animateOut = {Tools.animateStepOut}/> 
              : null
          }
        </TransitionGroup>
      </div>
    )
  }

  renderStep(){
    if(this.props.initialSetup){
      return this.renderInitialSetup();
    }
    else if(this.props.partialInitialSetup){
      return this.renderPartialInitialSetup();
    }
    else if(this.props.unencryptedWallet){
      return this.renderUnencryptedWalletSetup();
    }
  }

  render() {
    const divStyle = {
      opacity: '0',
      cursor: 'default'
    };

    const buttonStyle = {
      cursor: this.props.importing || this.props.encrypting || this.props.importingPrivKey ? 'default' : 'pointer'
    }

    const logo = require('../../../resources/images/logo_setup.png');
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
          {this.renderStep()}
          </div>
          <div id="buttons">
            <div className="button" id="buttonForward" style = {buttonStyle} onClick={this.handleForward}>
              <svg className="arrowRight" viewBox="0 0 256 256">
                <polyline
                    fill="none" 
                    stroke=  {this.props.importing || this.props.encrypting || this.props.importingPrivKey ? "#212a4c" : "#d09128"}
                    strokeWidth="33" 
                    strokeLinejoin="round" 
                    strokeLinecap="round" 
                    points="72,16 184,128 72,240" 
                />
              </svg>
              <svg className="circle" height="35" width="35">
                <circle cx="17.5" cy="17.5" r="17" stroke = {this.props.importing || this.props.encrypting || this.props.importingPrivKey ? "#212a4c" : "#d09128"} strokeWidth= "1.5" fill="transparent" />
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
    encrypting: state.setup.encrypting,
    initialSetup: state.startup.initialSetup,
    partialInitialSetup: state.startup.partialInitialSetup,
    unencryptedWallet: state.startup.unencryptedWallet,
    setupDoneInternal: state.startup.setupDoneInternal,
    importingPrivKey: state.application.checkingDaemonStatusPrivateKey
  };
};

export default connect(mapStateToProps, actions)(InitialSetup);