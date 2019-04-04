import React, {Component} from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/index';
import {getDebugUri} from '../../utils/platform.service';
import { Progress, Button, Row, Col } from 'reactstrap';

const fs = require('fs-extra');
const dialog = require('electron').remote.require('electron').dialog;

class DaemonErrorComponent extends Component {
  constructor() {
    super();
    this.handleCancel = this.handleCancel.bind(this);
    this.exportDebugLogFile = this.exportDebugLogFile.bind(this);
  }

  _handleKeyPress = (e) => {
    console.log(e);
    if (e.key === 'Enter') {
      this.handleConfirm();
    }
  }

  exportDebugLogFile() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (folderPaths) => {
      if (folderPaths === undefined) {
        return;
      }

      const backupLocation = `${folderPaths}/debug.log`;
      try {
        fs.copySync(getDebugUri(), backupLocation);
      } catch (e) {
        console.log(e);
      }
    });
  }

  handleCancel() {
    this.props.setDaemonErrorPopup(false);
  }


  render() {
      return (
        <div style={{
          height: '100%',
          display: 'block',
          overflow: 'auto',
          margin: 'auto 0',
          padding: '10px',
          minHeight: '400px'
        }}>
          <Row style={{textAlign: 'center'}}>
            <Col>
              <h3>Oops!</h3>
              {/*<img height="75px" width="75px" src={discordIcon} />*/}
              <p className="backupSuccessful">It looks like Sapphire is unable to load ECC's blockchain:</p>
              <p className="backupSuccessful">{this.props.daemonError}</p>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button size="sm" outline color="warning" onClick={this.exportDebugLogFile} className="buttonPrimary caps">Export Debug file</Button>
            </Col>
            <Col>
              <p className="backupSuccessful">Please join our discord below, report your issue in #support and attach the
                above debug file</p>
              <a href="https://discord.gg/wAV3n2q" target="_blank">https://discord.gg/wAV3n2q</a>
            </Col>
          </Row>
        </div>
      );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    daemonError: state.application.daemonError,
    daemonErrorPopup: state.application.daemonErrorPopup
  };
};


export default connect(mapStateToProps, actions)(DaemonErrorComponent);
