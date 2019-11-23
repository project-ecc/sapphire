import React, {Component} from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
const moment = require('moment');
import {CreateIcon, UserIcon} from 'mdi-react';

import * as actions from '../../actions/index';

const Tools = require('../../utils/tools');

class MessagingSidebar extends Component {
  constructor(props) {
    super(props);

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
                  <a className="subheading">{ this.props.lang.myinfo }</a>
                </li>
                <li>
                  <NavLink to="/myAccount/" className="bg-dark">
                    <UserIcon size={35} />
                    My Account
                  </NavLink>
                </li>
                <li>
                  <a className="subheading">{ this.props.lang.peerinfo }</a>
                </li>
                <li>
                  <NavLink to="/myAccount/peers" className="bg-dark">
                    <UserIcon size={35} />
                    My Peers
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
          <div className="menu mt-0">
            {/*<ul>*/}
              {/*<li>*/}
                {/*<NavLink to="/friends/newMessage" className="bg-dark">*/}
                  {/*<CreateIcon size={35} />*/}
                  {/*New Messsage*/}
                {/*</NavLink>*/}
              {/*</li>*/}
              {/*<li>*/}
                {/*<NavLink to="/friends/newMessage" className="bg-dark">*/}
                  {/*<UserIcon size={35} />*/}
                  {/*Me*/}
                {/*</NavLink>*/}
              {/*</li>*/}
            {/*</ul>*/}
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
