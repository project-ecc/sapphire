import React from 'react';
import moment from "moment";
import JSEMOJI from 'emoji-js';

class Message extends React.Component {

  render() {

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
    let withEmojis = jsemoji.replace_colons(this.props.message);

    // Was the message sent by the current user. If so, add a css class
    const fromMe = this.props.fromMe ? 'from-me' : '';

    return (
      <div className='message'>
        <div className={`username ${fromMe}`}>
          { this.props.username }
        </div>
        <div className={`message-body ${fromMe}`}>
          <div dangerouslySetInnerHTML={{ __html: withEmojis }} />
        </div>
      </div>
    );
  }
}

Message.defaultProps = {
  message: '',
  timeStamp: moment.now(),
  username: '',
  fromMe: false
};

export default Message;
