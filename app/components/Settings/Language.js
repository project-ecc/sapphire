import React, {Component} from 'react';
import {connect} from 'react-redux';
import {SettingsIcon} from 'mdi-react';

import * as actions from '../../actions/index';
import LanguageSelector from '../Others/LanguageSelector';
import Header from '../Others/Header';
import Body from '../Others/Body';

class Language extends Component {
  constructor(props) {
    super(props);
  }

  goToUrl(url){
    open(url);
  }

  render() {
    return (
      <div className="padding-titlebar">
        <Header>
          <SettingsIcon />
          { this.props.lang.language }
        </Header>
        <Body>
          <div id="languageRectangle">
            <p id="languageHelp">{ this.props.lang.helpTranslate1 }</p>
            <p id="languageHelpDesc">{ this.props.lang.helpTranslate2 } <span onClick={this.goToUrl.bind(this,"https://poeditor.com/join/project/p7WYAsLDSj")}>{ this.props.lang.helpTranslate3 }.</span></p>
          </div>
          <div className="row" id="settingsLanguageSelector">
            <div className="col-sm-4 text-left">
              <p>{ this.props.lang.language }</p>
            </div>
            <div className="col-sm-8 text-right">
              <LanguageSelector />
            </div>
          </div>
        </Body>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Language);
