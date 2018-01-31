import React, { Component } from 'react';
import bitcoinImage from '../../../resources/images/bitcoin.png';
import slackImage from '../../../resources/images/slack.png';
import githubImage from '../../../resources/images/github.png';
import { traduction } from '../../lang/lang';

const shell = require('electron').shell;

const lang = traduction();

export default class About extends Component {
  openLink(link) {
    shell.openExternal(link);
  }

  render() {
    return (
      <div className={'row about'}>
        <div className="col-md-12">
          <p className="title">{lang.aboutTitle}</p>
          <div className="panel panel-default">
            <div className="panel-body text-center larger-text">
              <div className="col-md-12 col-lg-12 col-xs-12 " style={{ marginBottom: '25px' }}>
                This User Interface is brought to you by <a style={{ cursor: 'pointer' }} onClick={this.openLink.bind(this, 'https://www.cryptounited.io/')}>CryptoUnited 2017 &#169;</a>
              </div>
              <div className="col-md-6 col-lg-6 col-xs-6" style={{ cursor: 'pointer' }}>
                <a onClick={this.openLink.bind(this, 'https://bitcointalk.org/index.php?topic=1006830.0')} className="section">
                  <img src={bitcoinImage} style={{ width: '50%' }} alt="" />
                  <br />
                  <span className="sub">{lang.aboutAnnouncementThread}</span>
                </a>
              </div>
              <div className="col-md-6 col-lg-6 col-xs-6">
                <img src={githubImage} style={{ width: '50%' }} alt="" />
                <div className="section">
                  <a style={{ cursor: 'pointer' }} onClick={this.openLink.bind(this, 'https://github.com/Greg-Griffith/ECCoin')}> ECC Github </a>
                </div>
              </div>
              <div>
                <div className="larger-text">
                    <p>The Lynx User Interface for ECC</p>
                    <p>This user interface is brought to you free of charge by the engineers at CryptoUnited. If you like this product and would like to show your support for future development of this and other free software, you may send a donation to:<br/> BTC: 1LWdVxMkdYDSJKoLEXddUKFh5b2AWqu4M6<br/> BCH: 1LWdVxMkdYDSJKoLEXddUKFh5b2AWqu4M6 <br/></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
