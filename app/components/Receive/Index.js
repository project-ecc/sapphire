import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Button, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText } from 'reactstrap';
import { CheckIcon } from 'mdi-react';

import * as actions from '../../actions';
import NewRequestModal from './partials/NewRequestModal';

import Header from './../Others/Header';
import Body from './../Others/Body';


class Index extends Component {
  constructor(props) {
    super(props);
    this.openNewAddressModal = this.openNewAddressModal.bind(this);

    this.state = {
      request: {
        amount: 0,
        description: '',
        address: ''
      }
    };
  }

  openNewAddressModal () {
    this.confirmAddressModal.getWrappedInstance().toggle();
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
                <ListGroupItem active action>
                  <ListGroupItemHeading>List group item heading</ListGroupItemHeading>
                  <ListGroupItemText>
                    Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.
                  </ListGroupItemText>
                </ListGroupItem>
                <ListGroupItem color="dark" action>
                  <ListGroupItemHeading>List group item heading</ListGroupItemHeading>
                  <ListGroupItemText>
                    Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.
                  </ListGroupItemText>
                </ListGroupItem>
                <ListGroupItem color="dark" action>
                  <ListGroupItemHeading>List group item heading</ListGroupItemHeading>
                  <ListGroupItemText>
                    Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.
                  </ListGroupItemText>
                </ListGroupItem>
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
