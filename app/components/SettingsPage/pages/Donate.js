import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SettingsIcon } from 'mdi-react';

import * as actions from '../../../actions';
import Donations from './../Donations';
import Header from './../../Others/Header';
import Body from './../../Others/Body';

class Donate extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="wrapper padding-titlebar">
        <Header>
          <SettingsIcon />
          { this.props.lang.donate  }
        </Header>
        <Body>
          <Donations />
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

export default connect(mapStateToProps, actions)(Donate);
