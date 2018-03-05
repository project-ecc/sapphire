import React, { Component } from 'react';
import * as actions from '../actions';
import { connect } from 'react-redux';
import $ from 'jquery';
import ToggleButton from 'react-toggle';
import Sidebar from './Sidebar';
import HomePage from './Pages/HomePage';
import ReceivePage from './Pages/ReceivePage';
import TransactionPage from './Pages/TransactionPage';
import SendPage from './Pages/SendPage';
import SettingsPage from './Pages/SettingsPage';
import ContactsPage from './Pages/ContactsPage';
import NetworkStatsPage from './Pages/NetworkStatsPage';
import NewsPage from './Pages/NewsPage';

class GenericPanel extends Component {
  constructor(props) {
    super(props);
  }

  getPanel(){
    switch(this.props.selectedPanel){
      case "overview": 
        return(<HomePage/>)
      case "send": 
        return(<SendPage/>)
      case "addresses": 
        return(<ReceivePage/>)
      case "transactions": 
        return(<TransactionPage/>)
      case "news": 
        return(<NewsPage/>)
      case "network": 
        return(<NetworkStatsPage/>)
      case "contacts": 
        return(<ContactsPage/>)
    }
  }

  render() {
    return (
      <div>
        <Sidebar/>
        <div className="mainSubPanel">
          {this.getPanel()}
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    selectedPanel: state.application.selectedPanel
  };
};


export default connect(mapStateToProps, actions)(GenericPanel);