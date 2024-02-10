export class Remote {
  private peerConnection: RTCPeerConnection;
  private offer!: RTCSessionDescriptionInit;
  private channel!: RTCDataChannel;

  constructor() {
    this.peerConnection = new RTCPeerConnection();
  }

  async createConnection({ offer, onReceiveMessageCallback }: { offer: RTCSessionDescriptionInit, onReceiveMessageCallback: (event: MessageEvent) => void }) {
    return new Promise<{ offer: RTCSessionDescriptionInit, candidate: RTCIceCandidateInit }>(async (resolve) => {
      this.receiveChannel({ onReceiveMessageCallback });
      await this.createOffer({ offer });
      this.peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
          resolve({
            candidate,
            offer: this.offer,
          });
        }
      };
    });
  }

  private async createOffer({ offer }: { offer: RTCSessionDescriptionInit }) {
    this.peerConnection.setRemoteDescription(offer);
    this.offer = await this.peerConnection.createAnswer();
    this.peerConnection.setLocalDescription(this.offer);
  }

  private receiveChannel({ onReceiveMessageCallback }: { onReceiveMessageCallback: (event: MessageEvent) => void }) {
    this.peerConnection.ondatachannel = event => {
      const { channel } = event;
      this.channel = channel;
      channel.onmessage = event => { onReceiveMessageCallback(event) };
    };
  }

  sendDataToRemote(data: string) {
    this.channel.send(data);
  }

  syncWithHost({ candidate }: { candidate: RTCIceCandidateInit }) {
    this.peerConnection.addIceCandidate(candidate);
  }
}
