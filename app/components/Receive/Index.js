import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Button, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText } from 'reactstrap';
import { CheckIcon } from 'mdi-react';
import { getAllMyAddresses } from '../../Managers/SQLManager';
import * as actions from '../../actions';
import NewRequestModal from './partials/NewRequestModal';

import Header from './../Others/Header';
import Body from './../Others/Body';
const moment = require('moment');

moment.locale('en');

class Index extends Component {
  constructor(props) {
    super(props);
    this.openNewAddressModal = this.openNewAddressModal.bind(this);
    this.loadAddresses = this.loadAddresses.bind(this);

    this.state = {
      request: {
        amount: 0,
        description: '',
        address: '',
      },
      allAddresses: {}
    };
  }

  async componentDidMount() {
    await this.loadAddresses();
  }

  openNewAddressModal () {
    this.confirmAddressModal.getWrappedInstance().toggle();
  }

  async loadAddresses(){
    let data = await getAllMyAddresses();
    this.setState({
      allAddresses: data
    });
  }

  render() {
    return (
      <div className="padding-titlebar">
        <Header>
          { this.props.lang.receiveCoins }
        </Header>
        <Body noPadding>
          <div className="row">
            <div className="col-xl-8">
              <h4 className="mb-3">Addresses available in this wallet</h4>
              <ListGroup style={{backgroundColor: null, maxHeight: '400px', overflowY:'scroll'}}>
                { this.state && this.state.allAddresses != null && Object.entries(this.state.allAddresses).map((result) => {
                  let data = result[1];
                  let index = result[0];
                  return (
                    <div id="rows">
                      <div className={"row normalWeight tableRowCustom tableRowCustomTransactions"} style={{backgroundColor: null}} key={index} >
                        Address: {data['address']} <br/>
                        Created on: {moment(data['created_at']).format('MMMM Do YYYY hh:mm a')}
                      </div>
                    </div>
                  );
                })}
              </ListGroup>
            </div>
            <div className="col-xl-4">
              <h4 className="mb-3">Generate new address</h4>
              <p>
                Generate new address to receive ECC
              </p>
              <div className="mt-4 d-flex justify-content-end">
                <Button color="success" onClick={this.openNewAddressModal}>
                  Generate Now
                  <CheckIcon className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Body>

        <NewRequestModal ref={(e) => { this.confirmAddressModal = e; }} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    userAddresses: state.application.userAddresses,
    showZeroBalance: state.application.showZeroBalance
  };
};

export default connect(mapStateToProps, actions)(Index);
