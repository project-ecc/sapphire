import React, {Component} from 'react';
import {connect} from 'react-redux';

import Body from './../../Others/Body';
import Header from './../../Others/Header';
import * as actions from '../../../actions';
import Footer from "../../Others/Footer";

const event = require('./../../../utils/eventhandler');

class MyAccount extends Component {
  constructor(props) {
    super(props);

  }

  render() {

    return (
      <div className="d-flex flex-row">
        <div className="padding-titlebar flex-auto d-flex flex-column">
          <Header>
            My Account
          </Header>
          <Body noPadding className="scrollable messaging-body">

          </Body>
          <Footer>

          </Footer>
        </div>
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



export default connect(mapStateToProps, actions)(MyAccount);
