import React from 'react';

import Message from './Message';
import connect from "react-redux/es/connect/connect";
import * as actions from "../../../actions";
import List from "@material-ui/core/List/List";
import ListItemAvatar from "@material-ui/core/ListItemAvatar/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar/Avatar";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import moment from "moment";
import Typography from "@material-ui/core/Typography/Typography";
import ListItem from "@material-ui/core/ListItem/ListItem";

class PeerList extends React.Component {
  componentDidUpdate() {
    // There is a new message in the state, scroll to bottom of list
    const objDiv = document.getElementById('messageList');
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  render() {
    // Loop through all the messages in the state and create a Packet component
    const peers = this.state.peers.map((peer, i) => {

      if (peer.id !== this.props.activeAccount.id) {
        return (
          <ListItem key={i} >
            <ListItemAvatar>
              <Avatar alt="Peer display image" src={peer.display_image != null ? peer.display_image : "https://statrader.com/wp-content/uploads/2018/06/ecc-logo.jpg"} />
            </ListItemAvatar>
            <ListItemText
              primary={peer.owner.display_name }
              secondary={
                <React.Fragment>
                  <Typography
                    dangerouslySetInnerHTML={{ __html: withEmojis }}
                    component="span"
                    variant="body2"
                    style={{display: 'inline', color: 'white'}}
                  >
                    Last Seen - {moment(peer.last_seen).fromNow()}
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItem>
        );
      }

    });

    return (
      <List className='messages' id='messageList'>
        { messages }
      </List>
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

export default connect(mapStateToProps, actions)(PeerList);
