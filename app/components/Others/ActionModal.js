import React, { Component } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button } from 'reactstrap';
import { connect } from 'react-redux';
import * as actions from '../../actions';

class ActionModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };

    this.toggle = this.toggle.bind(this);
    this.cancel = this.cancel.bind(this);
    this.ok = this.ok.bind(this);
  }

  ok() {}
  cancel() {}

  toggle(wasOk = false) {
    this.setState({
      open: !this.state.open
    });

    if (!this.state.open) {
      const okFunc = this.props.ok || this.ok;
      const cancelFunc = this.props.cancel || this.cancel;
      if (wasOk) {
        okFunc();
      } else {
        cancelFunc();
      }
    }
  }

  render() {
    return (
      <Modal isOpen={this.state.open} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>
          { this.props.header || this.props.lang.message }
        </ModalHeader>
        <ModalBody>
          { this.props.body }
        </ModalBody>
        <ModalFooter>
          { this.props.ok && (
            <Button color="primary" onClick={() => this.toggle(true)}>
              { this.props.okText || this.props.lang.close }
            </Button>
          )}
          <Button color="link" onClick={() => this.toggle((!this.props.ok))}>
            { this.props.cancelText || (this.props.ok ? this.props.lang.cancel : this.props.lang.close) }
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};

export default connect(mapStateToProps, actions, null, { withRef: true })(ActionModal);
