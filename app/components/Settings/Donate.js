import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SettingsIcon } from 'mdi-react';
import ReactTooltip from 'react-tooltip';

import * as actions from '../../actions/index';
import Header from '../Others/Header';
import Body from '../Others/Body';
import DonateModal from './partials/DonateModal';
import Goal from './partials/Goal';

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
    this.setState({
      selectedGoal: val
    });
    this.modal.getWrappedInstance().toggle();
  }

  render() {
    const goals = this.props.donationGoals || {};

    return (
      <div className="padding-titlebar">
        <Header>
          <SettingsIcon />
          { this.props.lang.donate }
        </Header>
        <Body noPadding>
          { Object.keys(goals).length > 0 && (
            <div className="row">
              {goals.map((goal, index) => {
                return (
                  <Goal key={index} goal={goal} handleClick={this.handleClick} />
                );
              })
              }
            </div>
          )}
          <ReactTooltip />
          <DonateModal ref={(e) => {this.modal = e}} goal={this.state.selectedGoal} />
        </Body>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    donationGoals: state.application.donationGoals,
    donationGoalsLastUpdated: state.application.donationGoalsLastUpdated
  };
};

export default connect(mapStateToProps, actions)(Donate);
