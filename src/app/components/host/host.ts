export class Host {
  private readonly CHANNEL = 'SendDataChannel';
  private peerConnection: RTCPeerConnection;
  private offer!: RTCSessionDescriptionInit;
  private channel!: RTCDataChannel;

  constructor() {
    this.peerConnection = new RTCPeerConnection();
  }

  createConnection({ onReceiveMessageCallback }: { onReceiveMessageCallback: (event: MessageEvent) => void }) {
    return new Promise<{ offer: RTCSessionDescriptionInit, candidate: RTCIceCandidateInit }>(async (resolve) => {
      this.createChannel();
      this.receiveChannel({ onReceiveMessageCallback });
      this.peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
          resolve({
            candidate,
            offer: this.offer,
          });
        }
      };
      await this.createOffer();
    });
  }

  private receiveChannel({ onReceiveMessageCallback }: { onReceiveMessageCallback: (event: MessageEvent) => void }) {
    this.channel.onmessage = event => { onReceiveMessageCallback(event) };
  }

  private async createOffer() {
    this.offer = await this.peerConnection.createOffer();
    this.peerConnection.setLocalDescription(this.offer);
  }

  private createChannel() {
    this.channel = this.peerConnection.createDataChannel(this.CHANNEL);
  }

  syncWithRemote({ offer, candidate }: { offer: RTCSessionDescriptionInit; candidate: RTCIceCandidateInit }) {
    this.peerConnection.setRemoteDescription(offer);
    this.peerConnection.addIceCandidate(candidate);
  }

  sendDataToRemote(data: string) {
    this.channel.send(data);
  }
}
