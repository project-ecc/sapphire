import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import TransitionGroup from 'react-transition-group/TransitionGroup';

import ImportWallet from '../components/InitialSetupPage/ImportWallet';
import LanguageSelector from '../components/InitialSetupPage/LanguageSelector';
import ThemeSelectorStep from '../components/InitialSetupPage/ThemeSelectorStep';
import ImportPrivateKey from '../components/InitialSetupPage/ImportPrivateKey';
import EncryptWallet from '../components/InitialSetupPage/EncryptWallet';
import SetupDone from '../components/InitialSetupPage/SetupDone';
import { traduction } from '../lang/lang';
import * as actions from '../actions/index';
import TransitionComponent from '../components/Others/TransitionComponent';

const Tools = require('../utils/tools');

class Setup extends Component {
  constructor(props) {
    super(props);
    this.handleForward = this.handleForward.bind(this);
    this.renderStep = this.renderStep.bind(this);
    this.renderPartialInitialSetup = this.renderPartialInitialSetup.bind(this);
    this.renderInitialSetup = this.renderInitialSetup.bind(this);
  }

  componentDidAppear() {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.5, { opacity: 0 }, { opacity: 1, ease: Linear.easeNone });
  }

  componentWillEnter(callback) {
    callback();
  }

  componentWillLeave(callback) {
    const el = this.refs.second;
    TweenMax.to(el, 0.3, { opacity: 0, ease: Linear.easeNone, onComplete: callback });
  }

  handleForward() {
    if ((this.props.importing && !this.props.importingWalletWithSetupDone) || !this.props.stepOverVal || this.props.encrypting || this.props.importingPrivKey) return;
    else if ((this.props.setupDoneInternal || this.props.importingWalletWithSetupDone) && !this.props.shouldImportWallet) {
      console.log('Done with setup!');
      ipcRenderer.send('initialSetup');
      this.props.importedWallet();
      this.props.setImportingWalletWithSetupDone(false);
      this.props.setSetupDone();
      return;
    } else if (this.props.totalSteps === 1) {
      this.props.setUnencryptedWallet(false);
    }
    this.props.stepForward();
    setTimeout(() => {
      this.props.stepOver();
    }, 300);
  }

  // this is not the prettiest thing but for components to animate OUT they need to be unmounted from the TransitionComponent... The TransitionComponent needs to stay in the DOM otherwise we don't get the animation out (when the child component unmounts)
  renderInitialSetup() {
    return (
      <div>
        {/* <TransitionGroup key="1" component="article">
        {this.props.step == 1 ?
          <TransitionComponent
            children= {<LanguageSelector/>}
            animationType= "firstSetupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/>
            : null
        }
        </TransitionGroup> */}
        <TransitionGroup key="2" component="article">
          {this.props.step === 1 ?
            <TransitionComponent
              children={<ThemeSelectorStep />}
              animationType="setupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="3" component="article">
          {this.props.step === 2 ?
            <TransitionComponent
              children={<ImportWallet />}
              animationType="setupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="4" component="article">
          {this.props.step === 3 ?
            <TransitionComponent
              children={<EncryptWallet checkEncrypted={this.props.importedWalletVal} />}
              animationType="setupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="5" component="article">
          {this.props.step === 4 ?
            <TransitionComponent
              children={<ImportPrivateKey notInitialSetup={false} />}
              animationType="setupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="6" component="article">
          {this.props.step === 5 ?
            <TransitionComponent
              children={<SetupDone />}
              animationType="setupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
            : null
        }
        </TransitionGroup>
      </div>
    );
  }

  renderPartialInitialSetup() {
    return (
      <div>
        {/* <TransitionGroup key="1" component="article">
        {this.props.step == 1 ?
          <TransitionComponent
            children= {<LanguageSelector/>}
            animationType= "firstSetupStep"
            animateIn= {Tools.animateStepIn}
            animateOut = {Tools.animateStepOut}/>
            : null
        }
        </TransitionGroup> */}
        <TransitionGroup key="2" component="article">
          {this.props.step === 1 ?
            <TransitionComponent
              children={<ThemeSelectorStep />}
              animationType="setupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="3" component="article">
          {this.props.step === 2 ?
            <TransitionComponent
              children={<EncryptWallet checkEncrypted />}
              animationType="setupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="4" component="article">
          {this.props.step === 3 ?
            <TransitionComponent
              children={<SetupDone />}
              animationType="setupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
            : null
        }
        </TransitionGroup>
      </div>
    );
  }

  renderUnencryptedWalletSetup() {
    return (
      <div>
        <TransitionGroup key="1" component="article">
          {this.props.step === 1 ?
            <TransitionComponent
              children={<EncryptWallet checkEncrypted={false} />}
              animationType="firstSetupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="2" component="article">
          {this.props.step === 2 ?
            <TransitionComponent
              children={<SetupDone />}
              animationType="setupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
              : null
          }
        </TransitionGroup>
      </div>
    );
  }

  renderImportWallet() {
    return (
      <div>
        <TransitionGroup key="1" component="article">
          {this.props.step === 1 ?
            <TransitionComponent
              children={<ImportWallet />}
              animationType="firstSetupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="2" component="article">
          {this.props.step === 2 ?
            <TransitionComponent
              children={<EncryptWallet checkEncrypted={this.props.importedWalletVal} />}
              animationType="setupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
            : null
        }
        </TransitionGroup>
        <TransitionGroup key="3" component="article">
          {this.props.step === 3 ?
            <TransitionComponent
              children={<ImportPrivateKey notInitialSetup={false} />}
              animationType="setupStep"
              animateIn={Tools.animateStepIn}
              animateOut={Tools.animateStepOut}
            />
            : null
        }
        </TransitionGroup>
      </div>
    );
  }

  renderStep() {
    if (this.props.initialSetup) {
      return this.renderInitialSetup();
    } else if (this.props.partialInitialSetup) {
      return this.renderPartialInitialSetup();
    } else if (this.props.unencryptedWallet && !this.props.partialInitialSetup && !this.props.shouldImportWallet) {
      return this.renderUnencryptedWalletSetup();
    } else if (this.props.shouldImportWallet || this.props.importingWalletWithSetupDone) {
      return this.renderImportWallet();
    }
  }

  render() {
    const divStyle = {
      opacity: '0',
      cursor: 'default'
    };

    const buttonStyle = {
      cursor: this.props.importing || this.props.encrypting || this.props.importingPrivKey ? 'default' : 'pointer'
    };

    const logo = require('../../resources/images/logo_setup.png');
    return (
      <div ref="second">
        <div id="mainPanel">
          <div id="logo">
            <img src={logo} />
          </div>
          <div className="content">
            <p style={{ fontWeight: '200' }} id="welcome">
              { this.props.lang.welcome }
            </p>
            {this.renderStep()}
          </div>
          <div id="buttons">
            <div className="button" id="buttonForward" style={buttonStyle} onClick={this.handleForward}>
              <svg className="arrowRight" viewBox="0 0 256 256">
                <polyline
                  fill="none"
                  strokeWidth="33"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points="72,16 184,128 72,240"
                  className={(this.props.importing || this.props.encrypting || this.props.importingPrivKey) && !this.props.importingWalletWithSetupDone ? 'intialSetupButtonInactive' : ''}
                />
              </svg>
              <svg className="circle" height="35" width="35">
                <circle className={(this.props.importing || this.props.encrypting || this.props.importingPrivKey) && !this.props.importingWalletWithSetupDone ? 'intialSetupButtonInactive' : ''} cx="17.5" cy="17.5" r="17" strokeWidth="1.5" fill="transparent" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    step: state.setup.step,
    totalSteps: state.startup.totalSteps,
    lang: state.startup.lang,
    importing: state.setup.importing,
    importedWalletVal: state.setup.imported,
    stepOverVal: state.setup.stepOver,
    encrypting: state.setup.encrypting,
    initialSetup: state.startup.initialSetup,
    partialInitialSetup: state.startup.partialInitialSetup,
    unencryptedWallet: state.startup.unencryptedWallet,
    setupDoneInternal: state.startup.setupDoneInternal,
    importingPrivKey: state.application.checkingDaemonStatusPrivateKey,
    shouldImportWallet: state.startup.importWallet,
    importingWalletWithSetupDone: state.startup.importingWalletWithSetupDone
  };
};

export default connect(mapStateToProps, actions)(Setup);
