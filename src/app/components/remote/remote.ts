export class Remote {
  private peerConnection: RTCPeerConnection;
  private offer!: RTCSessionDescriptionInit;

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
      channel.onmessage = event => { onReceiveMessageCallback(event) };
    };
  }

  syncWithHost({ candidate }: { candidate: RTCIceCandidateInit }) {
    this.peerConnection.addIceCandidate(candidate);
  }
}
