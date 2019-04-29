import React, {Component} from 'react';
import {connect} from "react-redux";
import * as actions from "../../../actions";
import {Modal, ModalBody, ModalHeader} from 'reactstrap';
import ImportPrivateKeysPartial from './ImportPrivateKeysPartial';

class ImportPrivateKeysModal extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      open: false
    };
  }

  toggle() {
    this.setState({
      open: !this.state.open,
      panel: 1
    });
  }

  render() {
    return (
      <div>
        <Modal isOpen={this.state.open} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>{ this.props.lang.importPrivateKey }</ModalHeader>
          <ModalBody>
            <ImportPrivateKeysPartial />
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};

export default connect(mapStateToProps, actions, null, { withRef: true })(ImportPrivateKeysModal);
