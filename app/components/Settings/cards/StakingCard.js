import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Card, CardText, CardTitle} from 'reactstrap';
import * as actions from '../../../actions';

class StakingCard extends Component {
  constructor(props) {
    super(props);

    this.handleConfirm = this.handleConfirm.bind(this);
  }

  async lockWallet() {
    const batch = [];
    const obj = {
      method: 'walletlock', parameters: []
    };
    batch.push(obj);

    this.props.wallet.command(batch).then((data) => {
      console.log('data: ', data);
      data = data[0];
      if (data !== null && data.code === 'ECONNREFUSED') {
        console.log('daemon not working?');
      } else if (data !== null) {
        console.log('error unlocking wallet: ', data);
      }
    }).catch((err) => {
      console.log('err unlocking wallet: ', err);
    });
  }

  handleConfirm() {
    this.lockWallet().then(() => {
      this.props.wallet.setGenerate().then(() => {
        this.props.setStaking(false);
      });
    });
  }

  render() {
    return (
      <div>
        <Card body inverse className="bg-gradient-orange standout mb-5">
          <CardTitle>{ this.props.lang.walletLocked }</CardTitle>
          <CardText>{ this.props.lang.walletLockedDescription }</CardText>
          <div className="d-flex justify-content-end">
            <Button color="danger" className="mt-2" onClick={this.handleConfirm}>
              { this.props.lang.disable }
            </Button>
          </div>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    staking: state.chains.isStaking
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(StakingCard);
