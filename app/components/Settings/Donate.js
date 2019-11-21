import React, {Component} from 'react';
import {connect} from 'react-redux';
import {LockIcon, SettingsIcon} from 'mdi-react';
import {Input} from 'reactstrap';
import * as actions from '../../actions/index';
import Header from '../Others/Header';
import Body from '../Others/Body';

class Donate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedGoal: null,
      modalToggle: null
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(val) {

  }

  render() {

    return (
      <div className="padding-titlebar">
        <Header>
          <SettingsIcon />
          { this.props.lang.donate }
        </Header>
        <Body noPadding>
        <p>The developer fund is used to cover many of the expenses that are incurred while developing ecc.
          Currently all of these expenses are paid for out of pocket by the dev team.<br/>
          These include but are not limited to paying for github services, website hosting, services like blockexplorers, research, and development in general.<br/>
          We would like to offer the ability to donate directly to the developers who do appreciate any amount you may want to contribute.</p>
        <div className="mt-3">
         <p>BTC</p>
          <Input
            readOnly
            style={{ width: '400px' }}
            value="1LC8zhYNXgRQ5d6sCTxDrC8wBq6D1gdQDZ"
            type="test"
            className="mb-4"
          />
          <p>BCH</p>
          <Input
            readOnly
            style={{ width: '400px' }}
            value="1LC8zhYNXgRQ5d6sCTxDrC8wBq6D1gdQDZ"
            type="test"
            className=" mb-4"
          />
          <p>ECC</p>
          <Input
            readOnly
            style={{ width: '400px' }}
            value="ESnoQdpHH5vLafzj9nvXqRugPSkd2ZNrch"
            type="test"
            className=" mb-4"
          />
          <p>LTC</p>
          <Input
            readOnly
            style={{ width: '400px' }}
            value="LPADrS2UjUXjYikZd3y3jv6MeZSHP5HukT"
            type="test"
            className=" mb-4"
          />
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

export default connect(mapStateToProps, actions)(Donate);
