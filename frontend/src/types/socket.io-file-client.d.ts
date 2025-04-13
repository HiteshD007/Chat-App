declare module 'socket.io-file-client' {
  export default class SocketIOFileClient {
    constructor(socket: any);
    upload(files: File[], options: {
      uploadTo: string;
      data?: any;
    }): void;
    on(event: string, callback: (data: any) => void): void;
  }
}
