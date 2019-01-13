import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import * as actions from '../../actions';
import TableToggle from '../Settings/partials/TableToggle';
import NewAddressModal from './partials/NewAddressModal';

import Header from './../Others/Header';
import Body from './../Others/Body';


class Index extends Component {
  constructor(props) {
    super(props);
    this.toggleZeroBalanceAddresses = this.toggleZeroBalanceAddresses.bind(this);
    this.openNewAddressModal = this.openNewAddressModal.bind(this);
  }

  openNewAddressModal () {
    this.confirmAddressModal.getWrappedInstance().toggle();
  }

  toggleZeroBalanceAddresses() {
    this.props.setShowZeroBalance(!this.props.showZeroBalance);
  }

  render() {
    console.log('ADDRESSES', this.props.userAddresses);
    return (
      <div className="padding-titlebar">
        <Header>
          { this.props.lang.addresses }
        </Header>
        <Body noPadding>
          <div className="panel Receive">
            <div className="tableCustom">
              <div className="tableHeaderBig tableHeaderNormal">
                <div className="row col-sm-12" style={{ justifyContent: 'space-between' }}>
                  <div className="col-sm-6">
                    <p className="tableHeaderTitle">{ this.props.lang.yourAddresses }</p>
                  </div>
                  <div className="row col-sm-6" style={{ justifyContent: 'flex-end', padding: '10px 0px 0px 0px' }}>
                    <div className="row col-sm-4" style={{ minWidth: '285px', textAlign: 'right' }}>
                      <p className="headerDescription" style={{ width: '100%', paddingRight: '10px' }}>{this.props.lang.showZeroBalances}</p>
                    </div>
                    <div className="row col-sm-4" style={{ maxWidth: '85px', justifyContent: 'flex-end' }}>
                      <TableToggle
                        keyVal={1}
                        handleChange={this.toggleZeroBalanceAddresses}
                        checked={this.props.showZeroBalance}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tableContainer">
                <div className="row rowDynamic">
                  <div id="addressHeader" className="col-sm-6 headerAddresses tableRowHeader">{ this.props.lang.address }</div>
                  <div id="addressHeader" className="col-sm-6 headerAddresses tableRowHeader">{ this.props.lang.amount }</div>
                </div>
                <div id="rows">
                  {this.props.userAddresses.map((address, index) => {
                    if (this.props.showZeroBalance === false && address.current_balance === 0) {
                      return;
                    }
                    return (
                      <div key={`address_${index}`}>
                        <div className="col-sm-6">
                          { address.address }
                        </div>
                        <div className="col-sm-6">
                          {address.current_balance}
                        </div>
                      </div>
                    );
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>

          <Button size="lg" onClick={this.openNewAddressModal}>Create New</Button>
        </Body>

        <NewAddressModal ref={(e) => { this.confirmAddressModal = e; }} />
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
