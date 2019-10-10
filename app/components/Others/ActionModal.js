import React, {Component} from 'react';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {connect} from 'react-redux';
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

  ok() {
    if (this.props.ok) {
      this.props.ok();
    }
    this.toggle()
  }

  cancel() {
    if (this.props.cancel) {
      this.props.cancel();
    }
    this.toggle()
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
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
            <Button color="primary" onClick={this.ok}>
              { this.props.okText || this.props.lang.close }
            </Button>
          )}
          <Button color="link" onClick={this.cancel}>
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
