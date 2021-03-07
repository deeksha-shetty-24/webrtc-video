import { Component, OnInit } from '@angular/core';
import { AppService } from '../services/app-service.service';
import { MeetingService } from '../services/meeting-service.service';
// import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})
export class MeetingComponent implements OnInit {

  desktopConstraints = {
    video: {
      mandatory: {
        maxWidth: 800,
        maxHeight: 600
      }
    },
    audio: true
  };

  mobileConstraints = {
    video: {
      mandatory: {
        maxWidth: 480,
        maxHeight: 320,
      }
    },

    audio: true
  }
  constraints: any;
  localStream: any;
  peerConn: any;
  sendChannel: any;
  remoteVideoEle: any;
  localVideoEle: any;
  isAudio = true;
  isVideo = true;
  constructor(private appService: AppService,
    private meetingService: MeetingService) {
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
      this.constraints = this.mobileConstraints;
    } else {
      this.constraints = this.desktopConstraints;
    }
    this.appService.webSocketEvent.subscribe(x => {
      if (x.data) {
        this.handleSignallingData(x);
      }
    });
  }

  ngOnInit(): void {
    if (this.meetingService.isHost) {
      this.startCall();
    }
    else {
      this.joinCall();
    }
  }

  handleSignallingData(event) {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "offer":
        this.peerConn.setRemoteDescription(data.offer)
        this.createAndSendAnswer()
        break
      case "answer":
        this.peerConn.setRemoteDescription(data.answer)
        break
      case "candidate":
        this.peerConn.addIceCandidate(data.candidate)
        break
      case "leave":
        this.handleLeave();
        break
    }
  }

  startCall() {
    document.getElementById("video-call-div")
      .style.display = "inline"

    navigator.getUserMedia(this.constraints, (stream) => {
      console.log("Local Stream:", stream);
      this.localStream = stream
      this.localVideoEle = document.getElementById("local-video") as any;
      this.localVideoEle.srcObject = this.localStream

      let configuration = {
        iceServers: [
          {
            "urls": ["stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302"]
          }
        ]
      }

      this.peerConn = new RTCPeerConnection(configuration)
      this.sendChannel = this.peerConn.createDataChannel("sendChannel", null);
      this.sendChannel.onopen = this.onSendChannelStateChange;
      this.sendChannel.onclose = this.onSendChannelStateChange;

      this.sendChannel.onmessage = this.onReceiveMessageCallback;

      this.peerConn.addStream(this.localStream)

      this.peerConn.onaddstream = (e) => {
        console.log("Remote Stream is ", e.stream);
        this.remoteVideoEle = document.getElementById("remote-video") as any;
        this.remoteVideoEle.srcObject = e.stream
      }

      this.peerConn.onicecandidate = ((e) => {
        if (e.candidate == null)
          return

        console.log("Local Candidate ");
        this.sendData({
          type: "store_candidate",
          candidate: e.candidate
        })
      })

      this.createAndSendOffer();
    }, (error) => {
      console.log(error)
    })
  }

  joinCall() {
    document.getElementById("video-call-div")
      .style.display = "inline"

    navigator.getUserMedia(this.constraints, (stream) => {
      console.log("Local Stream:", stream);
      this.localStream = stream
      this.localVideoEle = document.getElementById("local-video") as any;
      this.localVideoEle.srcObject = this.localStream

      let configuration = {
        iceServers: [
          {
            "urls": ["stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302"]
          }
        ]
      }

      this.peerConn = new RTCPeerConnection(configuration)
      this.peerConn.ondatachannel = this.receiveChannelCallback;

      this.peerConn.addStream(this.localStream)

      this.peerConn.onaddstream = (e) => {
        console.log("Remote Stream is ", e.stream);
        this.remoteVideoEle = document.getElementById("remote-video") as any;
        this.remoteVideoEle.srcObject = e.stream
      }

      this.peerConn.onicecandidate = ((e) => {
        if (e.candidate == null)
          return
        console.log("Local Candidate ");
        this.sendData({
          type: "send_candidate",
          candidate: e.candidate
        })
      })

      this.sendData({
        type: "join_call"
      })

    }, (error) => {
      console.log(error)
    })
  }

  receiveChannelCallback(event) {
    console.log('Receive Channel Callback');
    this.sendChannel = event.channel;
    this.sendChannel.onmessage = this.onReceiveMessageCallback;
    this.sendChannel.onopen = this.onReceiveChannelStateChange;
    this.sendChannel.onclose = this.onReceiveChannelStateChange;
  }

  onReceiveMessageCallback(event) {
    console.log('Received Message', event.data);
  }

  onSendChannelStateChange() {
    var dataChannel = this as any;
    var readyState = dataChannel.readyState;
    console.log('Send channel state is: ' + readyState);
  }

  onReceiveChannelStateChange() {
    var dataChannel = this as any;
    var readyState = dataChannel.readyState;
    console.log('Receive channel state is: ' + readyState);
  }

  leaveCall() {
    this.sendData({
      type: "end_call"
    })
    this.handleLeave();
  }

  handleLeave() {
    this.remoteVideoEle = document.getElementById("remote-video");
    this.remoteVideoEle.srcObject = null;
    this.localVideoEle = document.getElementById("local-video");
    this.localVideoEle.srcObject = null;

    this.peerConn.close();
    this.peerConn.onicecandidate = null;
    this.peerConn.onaddstream = null;
  }

  createAndSendOffer() {
    this.peerConn.createOffer((offer) => {
      this.sendData({
        type: "store_offer",
        offer: offer
      })

      this.peerConn.setLocalDescription(offer)
    }, (error) => {
      console.log(error)
    })
  }

  createAndSendAnswer() {
    this.peerConn.createAnswer((answer) => {
      this.peerConn.setLocalDescription(answer)
      this.sendData({
        type: "send_answer",
        answer: answer
      })
    }, error => {
      console.log(error)
    })
  }

  muteAudio() {
    this.isAudio = !this.isAudio
    this.localStream.getAudioTracks()[0].enabled = this.isAudio
  }

  muteVideo() {
    this.isVideo = !this.isVideo
    this.localStream.getVideoTracks()[0].enabled = this.isVideo
  }

  sendData(data) {
    this.appService.sendToActiveRecepient(data);
  }
}
