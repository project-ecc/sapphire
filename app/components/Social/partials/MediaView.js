import React from "react";

class VideoChat extends React.Component {

  state = {
    source: ""
  }

  componentDidMount(){
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then(this.handleVideo)
      .catch(this.videoError)
  }

  handleVideo = (stream) => {
    this.setState({
      source: window.URL.createObjectURL(stream)
    })
  }

  videoError = (err) => {
    alert(err.name)
  }



  render() {
    return (
      <div style={{maxHeight:'500px', maxWidth: '889px'}}>
        <div>
          <video style={{ position: 'absolute', maxHeight: '500px', width: '889px'}} id="video-chat" src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4" autoPlay={true}>
          </video>
            <video style={{position: 'absolute', bottom: '0', right: '-15', maxHeight: '150px', maxWidth:'100%'}} id="video-chat" src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4" autoPlay={true}>
            </video>

        </div>

      </div>

    )
  }
}
export default VideoChat
