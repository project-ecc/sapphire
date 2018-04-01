import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')

class MessagingOptions extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const searchImage = Tools.getIconForTheme("search2", false);
    const removeChatImage = Tools.getIconForTheme("removeChat", false);
    const disableNotificationImage = Tools.getIconForTheme("disableNotifications", false);
    const fileImage = Tools.getIconForTheme("sendFile", false);
    const sendEccImage = Tools.getIconForTheme("sendEcc", false);

    return (
      <div className="container" id={this.props.id}>
        <div className="row">
          <div className="col"></div>
            <div className="col text-center"><img className="messagingOption" src={sendEccImage}/></div>
            <div className="col text-center"><img className="messagingOption" src={fileImage}/></div>
            <div className="col text-center"><img className="messagingOption" src={disableNotificationImage}/></div>
            <div className="col text-center"><img className="messagingOption" src={removeChatImage}/></div>
            <div className="col text-center"><img className="messagingOption" src={searchImage}/></div>
          <div className="col"></div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang
  };
};

export default connect(mapStateToProps, actions)(MessagingOptions);