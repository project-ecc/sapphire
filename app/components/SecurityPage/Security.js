import React, { Component } from 'react';
import glob from 'glob';
import os from 'os';
import $ from 'jquery';
import Wallet from '../../utils/wallet';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
const event = require('../../utils/eventhandler');
const remote = require('electron').remote;

const dialog = remote.require('electron').dialog;
const app = remote.app;

const lang = traduction();
const wallet = new Wallet();

class Security extends Component {
  constructor(props) {
    super(props);

    this.state = {
      step: 0,
      pass1: '',
      pass2: '',
      passStrength: lang.backup1PasswordWeak,
      passEqual: '',
      passValidated: false,
      currPass: '',
      newPass: '',
      reenteredNewPass: '',
      changePassRequesting: false,
    };

    this.checkIfWalletEncrypted = this.checkIfWalletEncrypted.bind(this);
    this.scorePassword = this.scorePassword.bind(this);
    this.onChangePass1 = this.onChangePass1.bind(this);
    this.onChangePass2 = this.onChangePass2.bind(this);
    this.onClickNext1 = this.onClickNext1.bind(this);
    this.onClickNext2 = this.onClickNext2.bind(this);
    this.onClickBack = this.onClickBack.bind(this);
    this.onClickBackupLocation = this.onClickBackupLocation.bind(this);
    this.renderCircle = this.renderCircle.bind(this);
    this.renderPageStep = this.renderPageStep.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.handleCurrPassChange = this.handleCurrPassChange.bind(this);
    this.handleNewPassChange = this.handleNewPassChange.bind(this);
    this.handleNewPassReenterChange = this.handleNewPassReenterChange.bind(this);
  }

  componentDidMount() {
    this.checkIfWalletEncrypted();
  }

  checkIfWalletEncrypted() {
    const self = this;
    wallet.help().then((data) => {
      // console.log(data);
      if (data.indexOf('walletlock') > -1) {
        self.setState({ step: 3 });
      } else {
        self.setState({ step: 1 });
      }
    }).catch((err) => {
      if (err.message === 'connect ECONNREFUSED 127.0.0.1:19119') {
        glob(`${homedir}/.eccoin-daemon/Eccoind*`, (error, files) => {
          if (!files.length) {
            event.emit('show', 'Install daemon via Downloads tab.');
          } else {
            event.emit('show', 'Daemon not running.');
          }
        });
      } else if (err.message !== 'Loading block index...' && err.message !== 'connect ECONNREFUSED 127.0.0.1:19119') {
        event.emit('animate', err.message);
      }
    });
  }

  scorePassword(pass) {
    let score = 0;
    if (!pass) {
      return score;
    }

    // award every unique letter until 5 repetitions
    const letters = {};
    for (let i = 0; i < pass.length; i += 1) {
      letters[pass[i]] = (letters[pass[i]] || 0) + 1;
      score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    const variations = {
      digits: /\d/.test(pass),
      lower: /[a-z]/.test(pass),
      upper: /[A-Z]/.test(pass),
      nonWords: /\W/.test(pass),
    };

    let variationCount = 0;
    for (const check in variations) {
      variationCount += (variations[check] === true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return parseInt(score);
  }

  onChangePass1(event) {
    const score = this.scorePassword(event.target.value);
    let aux = lang.backup1PasswordWeak;
    if (score > 80) {
      aux = lang.backup1PasswordStrong;
    } else if (score > 60) {
      aux = lang.backup1PasswordGood;
    }
    this.setState({ pass1: event.target.value, passStrength: aux });
  }

  onChangePass2(event) {
    this.setState({ pass2: event.target.value });
  }

  onClickNext1() {
    if (this.state.pass1.length <= 0) {
      event.emit('animate', lang.invalidFields);
    } else {
      this.setState({ step: 2, pass2: '', passEqual: '' });
    }
  }

  onClickNext2() {
    const self = this;
    if (this.state.pass2.length <= 0) {
      event.emit('animate', lang.invalidFields);
    } else {
      if (this.state.pass1 !== this.state.pass2) {
        this.setState({ passEqual: lang.backup2PasswordsDontMatch });
      } else {
        wallet.encryptWallet(self.state.pass2).then((data) =>{
          if (data.code === -1) {
            event.emit('animate', lang.walletEncryptedError);
          } else {
            self.setState({ step: 3 });
            event.emit('animate', lang.walletEncrypted);
          }
        }).catch((err) => {
          console.log(err);
          event.emit('animate', err);
        });
      }
    }
  }

  onClickBack() {
    this.setState({ step: 1, pass1: '', passStrength: ''});
  }

  onClickBackupLocation() {
    const self = this;
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (folderPaths) => {
      if (folderPaths === undefined) {
        event.emit('animate', lang.noFolderSelected);
        return;
      }
      const platform = os.platform();
      let walletpath;

      if (platform.indexOf('win') > -1) {
        walletpath = `${app.getPath('appData')}/eccoin/wallet.dat`;
      } else {
        walletpath = `${app.getPath('home')}/.eccoin/wallet.dat`;
      }

      fs.readFile(walletpath, (err, data) => {
        if (err) {
          console.log(err);
          event.emit('animate', lang.readingFileError);
          return;
        }

        fs.writeFile(`${folderPaths}/walletBackup.dat`, data, (err) => {
          if (err) {
            console.log(err);
            event.emit('animate', lang.writtingFileError);
          }
          event.emit('animate', lang.backupOk);
        });
      });
    });
  }

  renderCircle(opt) {
    if (this.state.step === opt) {
      return 'circle_active';
    }
    return null;
  }

  handleCurrPassChange(event) {
    this.setState({ currPass: event.target.value });
  }

  handleNewPassChange(event) {
    const score = this.scorePassword(event.target.value);
    let aux = lang.backup1PasswordWeak;
    if (score > 80) {
      aux = lang.backup1PasswordStrong;
    } else if (score > 60) {
      aux = lang.backup1PasswordGood;
    }
    this.setState({ newPass: event.target.value, passStrength: aux });
  }

  handleNewPassReenterChange(event) {
    this.setState({
      reenteredNewPass: event.target.value,
      passValidated: event.target.value === this.state.newPass && this.state.currPass
    });
  }

  changePassword() {
    this.setState({ changePassRequesting: true });
    wallet.walletChangePassphrase(this.state.currPass, this.state.newPass)
      .then((result) => {
        this.setState({
          currPass: '',
          newPass: '',
          reenteredNewPass: '',
          passValidated: false,
          changePassRequesting: false,
          passStrength: lang.backup1PasswordWeak,
        });
        event.emit('show', 'Passphrase changed successfully.');
        setTimeout(() => {
          event.emit('hide');
        }, 2500);
      })
      .catch(err => {
        this.setState({
          currPass: '',
          newPass: '',
          reenteredNewPass: '',
          passValidated: false,
          changePassRequesting: false
        });
        console.error(err);
        return event.emit('show', err);
      });
  }

  renderPageStep() {
    if (this.state.step === 0) {
      return (
        <div className="page">
          <p className="title">{lang.backup1CreateYourPassword}</p>
          <p>This feature is unavailable while the daemon is not running.</p>
        </div>
      );
    } else if (this.state.step === 1) {
      let passColor = '#f44336';

      if (this.state.passStrength === lang.backup1PasswordGood) {
        passColor = '#ffc107';
      } else if (this.state.passStrength === lang.backup1PasswordStrong) {
        passColor = '#4caf50';
      }

      return (
        
        <div className="page">
          <p className="title">{lang.backup1CreateYourPassword}</p>
          <p className="desc">{lang.backup1Warning1} <span className="desc_green">{lang.backup1Warning2Green}</span> {lang.backup1Warning3}</p>
          <input className="input" placeholder={lang.typeYourPassword} type="password" value={this.state.pass1} onChange={this.onChangePass1} />
          <p style={{ color: passColor }} className="desc_pass">{this.state.passStrength}</p>
          <p className="nextButton" onClick={this.onClickNext1.bind(this)}>{lang.backupNext}</p>
        </div>
      );
    } else if (this.state.step === 2) {
      return (
        <div className="page">
          <p className="title">{lang.backup2TitleBold}</p>
          <p className="desc">{lang.backup2Warning1} <span className="desc_green">{lang.backup2Warning2Green}</span> {lang.backup2Warning3}</p>
          <input className="input" placeholder={lang.typeYourPassword} type="password" value={this.state.pass2} onChange={this.onChangePass2} />
          <p className="desc_pass">{this.state.passEqual}</p>
          <p className="nextButton left" onClick={this.onClickBack.bind(this)}>{lang.backupBack}</p>
          <p className="nextButton right" onClick={this.onClickNext2.bind(this)}>{lang.backupNext}</p>
        </div>
      );
    } else if (this.state.step === 3) {

      let passColor = '#f44336';
      let equalColor = '#ff4336';

      if (this.state.passStrength === lang.backup1PasswordWeak) {
        passColor = '#f44336';
        equalColor = '#ff4336';
      } else if (this.state.passStrength === lang.backup1PasswordGood) {
        passColor = '#ffc107';
      } else if (this.state.passStrength === lang.backup1PasswordStrong) {
        passColor = '#4caf50';
      }

      if (this.state.passValidated) {
        equalColor = '#4caf50';
      }

      return (
        <div className="page">
          <p className="title">{lang.backup3TitleBold}</p>
          <p className="desc">{lang.backup3Message1}</p>
          <p className="desc">You may also change your password any time by filling in the fields below and pressing the "Change Passphrase" button.</p>
          <p className="desc">{lang.backup3Message4}</p>
          <div>
            <input value={this.state.currPass} onChange={this.handleCurrPassChange} type="password" className="passwordInput" placeholder="Current passphrase" />
            <input value={this.state.newPass} onChange={this.handleNewPassChange} type="password" className="passwordInput" placeholder="New passphrase" />
            <input value={this.state.reenteredNewPass} onChange={this.handleNewPassReenterChange} type="password" className="passwordInput" placeholder="Re-enter new passphrase" />
          </div>
          <div><p style={{ color: passColor }} className="desc_pass">{this.state.passStrength}</p></div>
          <div>
            <p
              style={{ color: equalColor }}
              className="desc_pass"
            >
              {this.state.currPass
                ? (this.state.reenteredNewPass
                  ? (this.state.passValidated
                    ? 'Passphrases match' : 'Passphrases do not match')
                  : 'Please fill out new passphrase fields')
                : 'Current passphrase field is empty'
              }
            </p>
          </div>
          <button
            className={`${!this.state.passValidated || this.state.changePassRequesting ? '-passButtonDisabled' : 'changePassButton '}`}
            disabled={!this.state.passValidated || this.state.changePassRequesting}
            onClick={this.changePassword}
          >
            Change Passphrase
          </button>
          <p className="desc -space-top">{lang.backup3Message2}
            <span className="desc_green"> {lang.backup3Message3Green}</span>
          </p>
          <button className="nextButton" onClick={this.onClickBackupLocation}>{lang.backup3SetBackupLocation}</button>
        </div>
      );
    }
  }

  render() {


    return (
      
      <div className="backup">
        <div className={`circle circle_left ${this.renderCircle(1)}`}>1</div>
        <div className={`circle circle_center ${this.renderCircle(2)}`}>2</div>
        <div className={`circle circle_right ${this.renderCircle(3)}`}>3</div>
        <div className="line" />
        <div className="backup_inner">
          <p>{this.state.step ? `${lang.backup1Step} ${this.state.step} ${lang.conjuctionOf} 3` : null}</p>
          {this.renderPageStep()}        
        </div>
        <div className="tip">
            <p className="tip_title">{lang.backupTipBold}</p>
            <p className="tip_desc">{lang.backupTipMessage}</p>
          </div>
      </div>
      
    );
  }
}

export default Security;
