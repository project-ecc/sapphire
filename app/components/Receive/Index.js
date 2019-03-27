import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Button, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText } from 'reactstrap';
import { CheckIcon } from 'mdi-react';
import { getAllTransactions } from '../../Managers/SQLManager';
import * as actions from '../../actions';
import NewRequestModal from './partials/NewRequestModal';

import Header from './../Others/Header';
import Body from './../Others/Body';


class Index extends Component {
  constructor(props) {
    super(props);
    this.openNewAddressModal = this.openNewAddressModal.bind(this);
    this.loadTransactions = this.loadTransactions.bind(this);

    this.state = {
      request: {
        amount: 0,
        description: '',
        address: '',
        latestTransactions: {}
      }
    };
  }

  openNewAddressModal () {
    this.confirmAddressModal.getWrappedInstance().toggle();
  }

  async componentDidMount() {
    await this.loadTransactions();
  }

  async loadTransactions(){
    const where = {
      is_main: 1,
      category: 'receive'
    };
    let data = await getAllTransactions(10, 0, where);
    this.setState({
      latestTransactions: data
    });
    console.log(data)
  }

  onTextFieldChange(key, e) {
    const value = e.target.value;
    const payload = {
      request: {}
    };
    payload.request[key] = value;
    this.setState(payload);
  }

  render() {

    console.log('ADDRESSES', this.props.userAddresses);
    return (
      <div className="padding-titlebar">
        <Header>
          { this.props.lang.receiveCoins }
        </Header>
        <Body noPadding>
          <div className="row">
            <div className="col-xl-8">
              <h4 className="mb-3">Request History</h4>
              <ListGroup>
                { this.state && this.state.latestTransactions && this.state.latestTransactions.map((result, index) => {
                  return (
                    <ListGroupItem key={index} active action>
                      <ListGroupItemHeading>{result.address.address}</ListGroupItemHeading>
                      <ListGroupItemText>
                        {result.amount}
                      </ListGroupItemText>
                    </ListGroupItem>
                  );
                })}
              </ListGroup>
            </div>
            <div className="col-xl-4">
              <h4 className="mb-3">New Request</h4>
              <p>
                Request coin from another address
              </p>
              <Input
                className="mt-3"
                placeholder="Amount (ECC)"
                value={this.state.request.amount}
                type="number"
                onChange={e => this.onTextFieldChange('amount', e)}
              />
              <Input
                className="mt-3"
                placeholder="Message"
                value={this.state.request.description}
                type="textarea"
                onChange={e => this.onTextFieldChange('description', e)}
              />
              <div className="mt-4 d-flex justify-content-end">
                <Button color="success" onClick={this.openNewAddressModal}>
                  Process Request
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
