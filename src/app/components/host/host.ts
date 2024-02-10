export class Host {
  private readonly CHANNEL = 'SendDataChannel';
  private peerConnection: RTCPeerConnection;
  private offer!: RTCSessionDescriptionInit;
  private sendChannel!: RTCDataChannel;

  constructor() {
    this.peerConnection = new RTCPeerConnection();
  }

  createConnection() {
    return new Promise<{ offer: RTCSessionDescriptionInit, candidate: RTCIceCandidateInit }>(async (resolve) => {
      this.createChannel();
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

  private async createOffer() {
    this.offer = await this.peerConnection.createOffer();
    this.peerConnection.setLocalDescription(this.offer);
  }

  private createChannel() {
    this.sendChannel = this.peerConnection.createDataChannel(this.CHANNEL);
  }

  syncWithRemote({ offer, candidate }: { offer: RTCSessionDescriptionInit; candidate: RTCIceCandidateInit }) {
    this.peerConnection.setRemoteDescription(offer);
    this.peerConnection.addIceCandidate(candidate);
  }

  sendDataToRemote(data: string) {
    this.sendChannel.send(data);
  }
}
