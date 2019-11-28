import React, {Component} from 'react';
import {connect} from 'react-redux';

import Body from './../../Others/Body';
import Header from './../../Others/Header';
import * as actions from '../../../actions';
import Footer from "../../Others/Footer";
import db from '../../../utils/database/db'
import PeerList from "../partials/PeerList";
const Peer = db.Peer
const event = require('./../../../utils/eventhandler');

class MyAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      peers: []
    }
  }

  async componentDidMount() {
    let peers = await Peer.findAll()
    if(peers != null) {
      this.setState({
        peers: peers,
      })
    }
  }

  render() {

    return (
      <div className="d-flex flex-row">
        <div className="padding-titlebar flex-auto d-flex flex-column">
          <Header>
            My Peers
          </Header>
          <Body noPadding className="scrollable messaging-body">
            <PeerList />
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
