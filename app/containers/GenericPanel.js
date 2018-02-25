import React, { Component } from 'react';
import connectWithTransitionGroup from 'connect-with-transition-group';
import * as actions from '../actions';
import { connect } from 'react-redux';
import $ from 'jquery';
import ToggleButton from 'react-toggle';
import TransitionGroup from 'react-transition-group/TransitionGroup';
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

  componentDidMount(){
  }


  componentWillUnmount(){

  }

  componentWillAppear (callback) {
    callback();
  }
  
  componentDidAppear(e) {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1, ease: Linear.easeNone});
  }
  
  componentWillEnter (callback) {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1, ease: Linear.easeNone, onComplete: callback});
  }
  
  componentDidEnter(callback) {
  }

  componentWillLeave (callback) {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.15, {autoAlpha: 1, scale: 1}, {autoAlpha: 1, scale: 0.5, ease: Linear.easeNone});
  }
  
  componentDidLeave(callback) {
  }

  componentWillReceiveProps(props){
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
      <div ref="second" className="genericPanel">
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


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(GenericPanel));