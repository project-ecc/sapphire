import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import AddressBook from '../SendTransactions/partials/AddressBook';
import ContactModal from './partials/ContactModal';

class Index extends Component {
  constructor(props) {
    super(props);
    this.addContact = this.addContact.bind(this);
  }

  async addContact(){
    this.modal.getWrappedInstance().toggle(true);
  }

  render() {
    return (
      <div className="panel">
        <AddressBook sendPanel={false}/>
        <div id="inputAddress" style={{width: "650px", margin: "0 auto", display:"flex", justifyContent: "space-between", marginTop:"100px"}}>
          <div onClick={this.addContact} className="buttonPrimary addContactButton">
          { this.props.lang.addContact }
          </div>
        </div>

        <ContactModal ref={(e) => {this.modal = e}} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};

export default connect(mapStateToProps, actions)(Index);
