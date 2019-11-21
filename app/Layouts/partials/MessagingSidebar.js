import React, {Component} from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
const moment = require('moment');
import {CreateIcon} from 'mdi-react';

import * as actions from '../../actions/index';

const Tools = require('../../utils/tools');

class MessagingSidebar extends Component {
  constructor(props) {
    super(props);

    this.isUserSelected = this.isUserSelected.bind(this)

    this.state = {
      users : [
        {
          name: "Dylan",
          id: "1",
          routingId: "AuFYObBTfSghNXvlNxzqUFeRWNqoL714i5BWWAgi0KqD"
        }
      ],
    };
  }

  isUserSelected(match, location) {
    if (!match) {
      return false
    }

    const eventID = parseInt(match.params.id)
    this.state.users.map((object, key) => {
      if (object.id == eventID) {
        return true
      }
    })
  }

  render() {
    const usericon = require('../../../resources/images/logo_setup.png');
    return (
      <div className="sidebar">
        <div className="d-flex flex-column justify-content-between" style={{ minHeight: '100%' }}>
          <div>
            <div className="userimage">
              <img id="sidebarLogo" src={usericon} />
            </div>
            <div className="menu">
              <ul>
                <li>
                  <a className="subheading">{ this.props.lang.directMessages }</a>
                </li>
                { this.state.users.length > 0 ?
                  this.state.users.map((object, key) => {
                    return (
                      <li key={key}>
                        <NavLink   to={{
                          pathname: "/friends/" + object.id}} isActive={this.isUserSelected} exact activeClassName="active">
                          {object.name}
                        </NavLink>
                      </li>
                    );
                })
                : (
                    <li>
                      <a className="subheading">{ this.props.lang.noFriendsAvailable }</a>
                    </li>
                )}
                <li>
                  <a className="subheading">{ this.props.lang.groupMessaging }</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="menu mt-0">
            <ul>
              <li>
                <NavLink to="/friends/newMessage" className="bg-dark">
                  <CreateIcon size={35} />
                  New Messsage
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};

export default connect(mapStateToProps, actions, null, { pure: false })(MessagingSidebar);
