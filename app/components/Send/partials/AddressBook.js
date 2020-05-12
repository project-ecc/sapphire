import React, {Component} from 'react';
import {TweenMax} from 'gsap';
import {connect} from 'react-redux';
import {Table} from 'reactstrap';
import * as actions from '../../../actions/index';

import {getContacts} from '../../../Managers/SQLManager';

const moment = require('moment');
const event = require('./../../../utils/eventhandler');

moment.locale('en');

class AddressBook extends Component {
  constructor(props) {
    super(props);

    this.loadContacts = this.loadContacts.bind(this);
  }

  componentDidMount() {
    this.loadContacts();

    event.on('reloadContacts', this.loadContacts);
  }

  componentWillUnmount() {
    event.removeListener('reloadContacts', this.loadContacts);
  }

  async loadContacts() {
    const friendList = await getContacts();
    this.props.setContacts(friendList);
  }

  // Temporary function in case prop doesn't contain a clicker
  clickContact() {}

  render() {
    const clickContact = this.props.onContactClick || this.clickContact;

    return (
      <div className="tableCustom" >
        { this.props.children }
        <Table responsive hover borderless>
          <tbody>
            { this.props.friends.length > 0 ?
              this.props.friends.map((friend, index) => {
                const selected = this.props.selected === friend.id;
                return (
                  <tr key={index} className={`${selected ? 'selected tableRowCustom' : 'tableRowCustom'} cursor-pointer`} onClick={() => clickContact(friend)}>
                    <td>
                      {friend.name}
                      <br/>
                      <small className="transactionInfoTitle">
                        {friend.address !== null ? friend.address.address : 'Unknown Address'}
                      </small>
                    </td>
                  </tr>
                );
              })
            : (
              <tr>
                <td className="text-center" colSpan="3">
                  No contacts to display.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    friends: state.application.friends
  };
};

export default connect(mapStateToProps, actions)(AddressBook);
