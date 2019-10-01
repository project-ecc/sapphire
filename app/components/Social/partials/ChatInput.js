import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import JSEMOJI from 'emoji-js';
import {Button} from 'reactstrap';
import {StickerEmojiIcon} from 'mdi-react';

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
        { this.state.displayEmojiPicker ? <EmojiPicker className="emoji-picker" onEmojiClick={this.submitEmojiContent}/> : null }
        <div>
          <Button onClick={this.showEmojiPicker} className="mt-5">
            <StickerEmojiIcon className="ml-2" />
          </Button>
        </div>
        <div>
          <form className="chat-input" onSubmit={this.submitHandler}>
            <input type="text"
                   className="command_input"
                   onChange={this.textChangeHandler}
                   value={this.state.chatInput}
                   placeholder="Write a message..."
                   required />
          </form>
        </div>
      </div>
    );
  }
}

ChatInput.defaultProps = {
};

export default ChatInput;
