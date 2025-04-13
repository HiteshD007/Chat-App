export interface userInterface{
  _id: string,
  username: string,
  email: string,
  profilePic: string,
}

export interface friendInterface{
  _id: string,
  username: string,
  profilePic: string,
}

export interface serverInterface{
  _id: string,
  displayImg: string,
  bannerImg: string,
  name: string,
  owner: string,
  members: friendInterface[] | [],
  channels: channelInterface[] | [],
}

export interface channelInterface{
  _id: string,
  name: string,
  type: 'text' | 'voice',
  isPrivate: boolean,
  permittedUsers: friendInterface[]
}

export interface messageInterface{
  _id: string,
  sender: friendInterface,
  chatId: string,
  content: string,
  messageType: "text" | "image" | "pdf" | "video" | "audio" | "application" | "txt" | "gif",
  createdAt: string
}

export interface requestInterface{
  _id: string,
  sender: friendInterface,
}