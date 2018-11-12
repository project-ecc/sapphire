import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../actions';
import ThemeSelector from '../../Others/ThemeSelector';

class Appearance extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <p id="walletBackup">{ this.props.lang.theme }</p>
        <ThemeSelector />
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
