import $ from 'jquery';
import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import { connect } from 'react-redux';
const Tools = require('../../utils/tools')
import MessagingInput from './MessagingInput';

class MessagingTopBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="messagingTopBar">
        
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang
  };
};

export default connect(mapStateToProps, actions)(MessagingTopBar);