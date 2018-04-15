import React, { Component } from 'react';
import * as actions from '../actions';
import { connect } from 'react-redux';
import ToggleButton from 'react-toggle';
import Sidebar from './Sidebar';
import MessagingPage from './Pages/MessagingPage';
import HomePage from './Pages/HomePage';
import ReceivePage from './Pages/ReceivePage';
import TransactionPage from './Pages/TransactionPage';
import SendPage from './Pages/SendPage';
import SettingsPage from './Pages/SettingsPage';
import ContactsPage from './Pages/ContactsPage';
import NetworkStatsPage from './Pages/NetworkStatsPage';
import NewsPage from './Pages/NewsPage';
import FileStoragePage from './Pages/FileStoragePage';
import {TweenMax} from "gsap";
const Tools = require('../utils/tools');

class GenericPanel extends Component {
  constructor(props) {
    super(props);
  }

  getPanel(){
    switch(this.props.selectedPanel){
      case "overview":
        return(<HomePage/>);
      case "send":
        return(<SendPage/>);
      case "addresses":
        return(<ReceivePage/>);
      case "transactions":
        return(<TransactionPage/>);
      case "news":
        return(<NewsPage/>);
      case "network":
        return(<NetworkStatsPage/>);
      case "contacts":
        return(<ContactsPage/>)
      case "messaging": 
        return(<MessagingPage/>)
      case "fileStorage": 
        return(<FileStoragePage/>)
    }
  }

  componentWillReceiveProps(props)
  {
    console.log(props)
  }

  componentWillMount(){
    if(!this.props.showingFunctionIcons){
      setTimeout(() => {
        Tools.showFunctionIcons();
        this.props.setShowingFunctionIcons(true);
      }, 400)
    }
  }

  render() {
    return (
      <div>
        <Sidebar/>
        <div className="mainSubPanel" style={this.props.selectedPanel == "messaging" ? {overflowY: "hidden"} : {}}>
          {this.getPanel()}
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    selectedPanel: state.application.selectedPanel,
    showingFunctionIcons: state.application.showingFunctionIcons,
    settings: state.application.settings
  };
};


export default connect(mapStateToProps, actions)(GenericPanel);
