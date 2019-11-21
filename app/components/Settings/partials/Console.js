import React, {Component} from 'react';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {connect} from 'react-redux';

import {traduction} from '../../../lang/lang';


import * as actions from '../../../actions/index';



const lang = traduction();

class Console extends Component {
  constructor(props) {
    super(props);
    this.state = {
      command_input: '',
      consoleOpen: true,
      commandList: [],
      responseList: [],
      navigation: 0,
      ctrlKeyDown: false,
      lKeyDown: false,
      open: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.onenter = this.onenter.bind(this);

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let n = this.state.navigation;
    if (value.length === 0) {
      n = this.state.commandList.length;
    }

    this.setState({
      [name]: value,
      navigation: n
    });
  }



  renderHelpMsg() {
    if (this.state.commandList.length === 0) {
      const time = (((new Date()).toTimeString()).split(' '))[0];
      return (
        <div>
          <div className="hours_list">
            <p>{time}</p>
          </div>
          <div className="commands_list">
            <p>{lang.console1}</p>
            <p>{lang.console2} <span className="text_green">{lang.console3}</span> {lang.console4}</p>
            <p>{lang.console5} <span className="text_green">{lang.console6}</span> {lang.console7}</p>
          </div>
        </div>
      );
    }
    return null;
  }

  onenter() {
    this.handleNewCommand();
  }

  handleKeyUp(event) {
    if (event.keyCode === 17) { // CTRL
      this.setState({
        ctrlKeyDown: false
      });
    } else if (event.keyCode === 76) { // L
      this.setState({
        lKeyDown: false
      });
    }
  }

  handleKeyDown(event) {
    if (event.keyCode === 38) { // arrow up
      if (this.state.commandList[this.state.navigation - 1] !== undefined) {
        this.setState({
          command_input: this.state.commandList[this.state.navigation - 1].desc,
          navigation: this.state.navigation - 1
        });
      }
    } else if (event.keyCode === 40) { // arrow down
      if (this.state.commandList[this.state.navigation + 1] !== undefined) {
        this.setState({
          command_input: this.state.commandList[this.state.navigation + 1].desc,
          navigation: this.state.navigation + 1
        });
      }
    } else if (event.keyCode === 13) { // enter
      this.handleNewCommand();
    } else if (event.keyCode === 17) { // CTRL
      if (this.state.lKeyDown) {
        this.setState({
          navigation: 0,
          commandList: []
        });
      } else {
        this.setState({
          ctrlKeyDown: true
        });
      }
    } else if (event.keyCode === 76) { // L
      if (this.state.ctrlKeyDown) {
        this.setState({
          navigation: 0,
          commandList: []
        });
      } else {
        this.setState({
          lKeyDown: true
        });
      }
    }
  }

  handleNewCommand() {
    if (this.state.command_input.length < 1) { return; }

    const currentList = this.state.commandList;
    const time = (((new Date()).toTimeString()).split(' '))[0];
    try {
      const input = this.state.command_input;
      this.setState({ command_input: '' });

      const commandParsed = input.split(' ');
      const method = commandParsed[0];
      const parameters = [];

      for (let i = 1; i < commandParsed.length; i++) {
        let p = commandParsed[i];
        if (!isNaN(p)) { // is number
          if (p % 1 === 0) { // integer
            p = parseInt(p);
          } else { // float
            p = parseFloat(p);
          }
        }
        parameters.push(p);
      }

      this.props.wallet.command([{ method, parameters }]).then((response) => {
        currentList.push({
          time,
          desc: input,
          res: response
        });

        this.setState({ commandList: currentList, navigation: currentList.length });
        this.scrolToDivBottom();
      }).catch((error) => {
        currentList.push({
          time,
          desc: 'An error occured processing command'
        });
        this.setState({ commandList: currentList });
        this.scrolToDivBottom();
      });
    } catch (err) {
      console.log(err);
      currentList.push({
        time,
        desc: 'Invalid command'
      });
      this.setState({ commandList: currentList });
      this.scrolToDivBottom();
    }
    console.log(this.state.commandList);
  }

  scrolToDivBottom() {
    const consoleDiv = document.getElementById('consoleBody');
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
  }

  renderBody() {
    return (
      <div className="console_body">
        <div id="console" style={{userSelect: "text", cursor: "text"}} className="console_wrapper text-white">
          {this.renderHelpMsg()}
          {this.state.commandList.map((cmd, index) => {
            let res = cmd.res;
            if (res instanceof Object && cmd.desc !== 'help') {
              if (res.length > 0 && res[0] !== undefined) {
                res = JSON.stringify(res[0], null, 2);
              } else {
                res = JSON.stringify(res, null, 2);
              }
              return (
                <div key={`command_key_${index}`}>
                  <div className="hours_list">
                    <p>{cmd.time}</p>
                  </div>
                  <div id="commands-list" className="commands_list">
                    <p><span style={{ fontWeight: '400' }}>{cmd.desc}</span>: <span style={{ fontWeight: '300', fontSize: '0.9em' }}>{res}</span></p>
                  </div>
                </div>
              );
            } else if (cmd.desc === 'help') {
              let res = cmd.res.toString();
              res = res.split('\n');

              return (
                <div key={`command_key_${index}`}>
                  <div className="hours_list ">
                    <p>{cmd.time}</p>
                  </div>
                  <div className="commands_list">
                    <p><span style={{ fontWeight: '400' }}>{cmd.desc}</span>:</p>
                    {res.map((el, index) => {
                      return (
                        <p key={`help_command_${index}`}>
                          <span style={{ fontWeight: '300', fontSize: '0.9em' }}>
                            {el}
                          </span>
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  }

  render() {
    return (
      <Modal isOpen={this.state.open} id="consoleModal">
        <ModalHeader toggle={this.toggle}>
          { this.props.lang.console }
        </ModalHeader>
        <ModalBody id="consoleBody">
          {this.renderBody()}
        </ModalBody>
        <ModalFooter>
          <div className="box w-100">
            <div className="container-1 w-100 d-flex align-content-center">
              <span className="icon mt-1" style={{ top: 0 }}>
                <i className="fa fa-terminal" />
              </span>
              <input type="text" id="search" placeholder="Enter Command... (press enter to run command)" className="command_input" name="command_input" value={this.state.command_input} onChange={this.handleInputChange.bind(this)} onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp} />
            </div>
          </div>
        </ModalFooter>
      </Modal>
    );
  }
}


const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet
  };
};


export default connect(mapStateToProps, actions, null, { withRef: true })(Console);
