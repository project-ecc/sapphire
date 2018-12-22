import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import DonateModal from './partials/DonateModal';
import Goal from './partials/Goal';

class Donations extends Component {
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

  // the key element is required, otherwise we get a weird behavior (caused by react optimizations) switching between panels that have toggles, feel free to remove the key element and give it a go
  render() {
    const goals = this.props.donationGoals || {}

    return (
      <div>
        <p id="walletBackup">{ this.props.lang.donate }</p>
        <div className="row" style={{ overflowY: 'scroll' }}>
          {goals.map((goal, index) => {
            return (
              <Goal key={index} goal={goal} handleClick={this.handleClick} />
            );
          })
        }
        </div>
        <ReactTooltip />
        <DonateModal ref={(e) => {this.modal = e}} goal={this.state.selectedGoal} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    donationGoals: state.application.donationGoals,
    donationGoalsLastUpdated: state.application.donationGoalsLastUpdated
  };
};

export default connect(mapStateToProps, actions)(Donations);
