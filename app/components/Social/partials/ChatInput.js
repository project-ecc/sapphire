import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import JSEMOJI from 'emoji-js';
import {Button} from 'reactstrap';
import {PlusIcon, StickerEmojiIcon} from 'mdi-react';
import connect from "react-redux/es/connect/connect";
import * as actions from "../../../actions";

const dialog = require('electron').remote.require('electron').dialog;

class ChatInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chatInput: '',
      displayEmojiPicker: false
    };

    // React ES6 does not bind 'this' to event handlers by default
    this.submitHandler = this.submitHandler.bind(this);
    this.textChangeHandler = this.textChangeHandler.bind(this);
    this.showEmojiPicker = this.showEmojiPicker.bind(this);
    this.submitEmojiContent = this.submitEmojiContent.bind(this);
    this.selectFiles = this.selectFiles.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
  }

  async selectFiles() {
    dialog.showOpenDialog({ title: this.props.lang.selectAFileName,
      filters: [

        { extensions: ['png', 'jpg', 'jpeg', 'mp4'] }

      ] }, async (fileNames) => {
      if (fileNames === undefined) {
        return;
      }
      await this.uploadFiles(fileNames);

    });
  }

  async uploadFiles(files){
    // iterate over files.

    //upload to users local db

    //broadcast them to other chat peers


  }

  submitHandler(event) {
    // Stop the form from refreshing the page on submit
    event.preventDefault();

    // Clear the input box
    this.setState({ chatInput: '', displayEmojiPicker: false });

    // new instance
    let jsemoji = new JSEMOJI();
    // set the style to emojione (default - apple)
    jsemoji.img_set = 'emojione';
    // set the storage location for all emojis
    jsemoji.img_sets.emojione.path = 'https://cdn.jsdelivr.net/emojione/assets/3.0/png/32/';

    // some more settings...
    jsemoji.supports_css = false;
    jsemoji.allow_native = false;
    jsemoji.replace_mode = 'unified';
    let withEmojis = jsemoji.replace_colons(this.state.chatInput);

    // Call the onSend callback with the chatInput message
    this.props.onSend(withEmojis);
  }

  submitEmojiContent(emojiCode, emojiObject, event) {


    this.setState({
      chatInput: this.state.chatInput +  `:${emojiObject.name}:`
    })
  }

  textChangeHandler(event)  {
    this.setState({ chatInput: event.target.value });
  }

  showEmojiPicker(){
    this.setState({ displayEmojiPicker: !this.state.displayEmojiPicker });
  }

  render() {

    return (
      <div>
        <div>

            <div className="row col-12 no-padding" style={{padding:'0'}}>
              <div className="col-12 col-md-1 no-padding" style={{padding:'0'}}>
                <Button style={{height: '100%', width: '100%'}} size="sm"  onClick={() => this.selectFiles()}>
                  <PlusIcon size={20}></PlusIcon>
                </Button>
              </div>
              <div className="col-12 col-md-10 no-padding" style={{padding:'0'}}>
                <form className="chat-input" onSubmit={this.submitHandler}>
                <input type="text"
                       className="command_input"
                       onChange={this.textChangeHandler}
                       value={this.state.chatInput}
                       placeholder="Write a message..."
                       required />
                </form>
              </div>
              <div className="col-12 col-md-1 no-padding" style={{padding:'0'}}>
                <Button onClick={this.showEmojiPicker} className="position-relative" style={{height: '100%', width: '100%'}}>
                  <StickerEmojiIcon className="ml-2" />
                  { this.state.displayEmojiPicker ? <EmojiPicker className="emoji-picker" onEmojiClick={this.submitEmojiContent}/> : null }
                </Button>
              </div>
            </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    activeAccount: state.messaging.activeAccount
  };
};

export default connect(mapStateToProps, actions)(ChatInput);

