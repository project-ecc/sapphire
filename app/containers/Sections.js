import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { SettingsIcon, BitcoinIcon } from 'mdi-react';
import ReactTooltip from 'react-tooltip';
import { connect } from 'react-redux';
import * as actions from './../actions';

class Sections extends Component {
  render() {
    return (
      <div className="sections">
        <div>
          <NavLink to="/coin" activeClassName="active" data-tip={this.props.lang.default}>
            <BitcoinIcon size={35} />
          </NavLink>
        </div>
        <div>
          <NavLink to="/settings" activeClassName="active" data-tip={this.props.lang.settings}>
            <SettingsIcon size={35} />
          </NavLink>
        </div>
        <ReactTooltip />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};

export default connect(mapStateToProps, actions)(Sections);
