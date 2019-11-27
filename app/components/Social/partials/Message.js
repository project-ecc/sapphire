import React from 'react';
import moment from "moment";
import JSEMOJI from 'emoji-js';
import ListItemAvatar from "@material-ui/core/ListItemAvatar/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar/Avatar";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Typography from "@material-ui/core/Typography/Typography";
import ListItem from "@material-ui/core/ListItem/ListItem";
import Divider from "@material-ui/core/Divider/Divider";

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
    let withEmojis = jsemoji.replace_colons(this.props.message.content);

    // Was the message sent by the current user. If so, add a css class
    const fromMe = this.props.fromMe ? 'from-me' : '';

    return (
      <div>
        <ListItem className={`username ${fromMe}`}>
          <ListItemAvatar>
            <Avatar alt="Peer display image" src={this.props.message.owner.display_image != null ? this.props.message.owner.display_image : "https://statrader.com/wp-content/uploads/2018/06/ecc-logo.jpg"} />
          </ListItemAvatar>
          <ListItemText
            primary={this.props.message.owner.display_name+ '-' + moment(this.props.message.date).format('dddd, MMMM Do YYYY') }
            secondary={
              <React.Fragment>
                <Typography
                  dangerouslySetInnerHTML={{ __html: withEmojis }}
                  component="span"
                  variant="body2"
                  style={{display: 'inline', color: 'white'}}
                >
                </Typography>
              </React.Fragment>
            }
          />
        </ListItem>
        <Divider variant="inset" component="li" />
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
