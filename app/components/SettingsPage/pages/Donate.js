import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../actions';
import Donations from './../Donations';

class Donate extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Donations />
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
