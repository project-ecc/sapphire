import React, {Component} from 'react';
import {connect} from 'react-redux';
import {SettingsIcon} from 'mdi-react';

import * as actions from '../../actions/index';
import ThemeSelector from '../Others/ThemeSelector';
import Header from '../Others/Header';
import Body from '../Others/Body';

class Appearance extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="padding-titlebar">
        <Header>
          <SettingsIcon />
          { this.props.lang.appearance }
        </Header>
        <Body>
          <p id="walletBackup">{ this.props.lang.theme }</p>
          <ThemeSelector />
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

export default connect(mapStateToProps, actions)(Appearance);
