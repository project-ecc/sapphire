import React, {Component} from 'react';
import {connect} from 'react-redux';

import Body from './../../Others/Body';
import Header from './../../Others/Header';
import * as actions from '../../../actions';
import Footer from "../../Others/Footer";
import {Input,Button} from 'reactstrap';
import db from '../../../../app/utils/database/db';
const MyAccountDatabase = db.MyAccount;
const event = require('./../../../utils/eventhandler');
import Toast from '../../../globals/Toast/Toast'

class MyAccount extends Component {
  constructor(props) {
    super(props);
    this.saveAccount = this.saveAccount.bind(this)
    this.handleChangeImage = this.handleChangeImage.bind(this)
    this.handleChangeInput = this.handleChangeInput.bind(this)
    this.saveAccount = this.saveAccount.bind(this)
    this.state = {
      display_image: null,
      id: null,
      display_name: null,
      public_payment_address: null,
      private_payment_address: null,
      is_active: true
    }

  }

  async componentDidMount() {
    let currentRoutingKey = await this.props.wallet.getRoutingPubKey()
    let myAccount = await MyAccountDatabase.findByPk(currentRoutingKey)
    console.log(myAccount)
    if (myAccount != null) (
      this.setState({
        display_image: myAccount.display_image,
        id: myAccount.id,
        display_name: myAccount.display_name,
        public_payment_address: myAccount.public_payment_address,
        private_payment_address: myAccount.private_payment_address
      })
    )
    this.setState({
      id: currentRoutingKey
    })
  }

  async saveAccount() {
    try {
      let myAccount = MyAccountDatabase
        .findByPk(this.state.id)
        .then((obj) => {
          // update
          if(obj)
            return obj.update(this.state);
          // insert
          return MyAccountDatabase.create(this.state);
        })
      this.props.setActiveMessagingAccount(myAccount)

      Toast({
        title: this.props.lang.success,
        message: 'Account Info Updated',
        color: 'green'
      });
    } catch (e) {
      Toast({
        title: this.props.lang.error,
        message: 'Cannot update your account',
        color: 'red'
      });
    }

  }

  handleChangeImage (evt) {
    console.log("Uploading");
    var self = this;
    var reader = new FileReader();
    var file = evt.target.files[0];

    reader.onload = (upload) =>{
      this.setState({
        display_image: upload.target.result
      });
    };
    reader.readAsDataURL(file);
    console.log(this.state.display_image);
    console.log("Uploaded");
  }

  handleChangeInput(evt){
    this.setState({
      [evt.target.name]: evt.target.value
    })
    console.log(this.state)
  }

  render() {

    return (
      <div className="d-flex flex-row">
        <div className="padding-titlebar flex-auto d-flex flex-column">
          <Header>
            My Account
          </Header>
          <Body noPadding className="scrollable messaging-body">
            <div className="row">
              <div className="col-12 col-md-3">
                <img src={this.state.display_image != null ? this.state.display_image : "https://statrader.com/wp-content/uploads/2018/06/ecc-logo.jpg"} height="200px" width="200"/>
              </div>
              <div className="col-12 col-md-9">
                <Input ref="file" type="file" name="file"
                       className="upload-file"
                       id="file"
                       onChange={this.handleChangeImage}
                       encType="multipart/form-data"
                       required/>
              </div>
            </div>
            <div className="row">
              <div className="mt-3">
                <p>Routing Key</p>
                <Input
                  readOnly
                  style={{ width: '400px' }}
                  value={this.state.id}
                  className="mb-4"
                />
                <p>Display Name</p>
                <Input
                  name="display_name"
                  onChange={this.handleChangeInput}
                  style={{ width: '400px' }}
                  value={this.state.display_name}
                  className="mb-4"
                />
                <p>Public Payment Address</p>
                <Input
                  name="public_payment_address"
                  onChange={this.handleChangeInput}
                  style={{ width: '400px' }}
                  value={this.state.public_payment_address}
                  className=" mb-4"
                />
                <p>Private Payment Address</p>
                <Input
                  name="private_payment_address"
                  onChange={this.handleChangeInput}
                  style={{ width: '400px' }}
                  value={this.state.private_payment_address}
                  className=" mb-4"
                />
              </div>
            </div>
          </Body>
          <Footer>
            <Button size="md" outline color="warning" onClick={async () => { await this.saveAccount() }} className="ml-2">
              Save
            </Button>
          </Footer>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};



export default connect(mapStateToProps, actions)(MyAccount);
