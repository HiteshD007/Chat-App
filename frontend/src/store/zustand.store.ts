import { create } from 'zustand';
import { channelInterface, friendInterface, messageInterface, requestInterface, serverInterface, userInterface } from '@/lib/types';

export type chatType = {
  id: string,
  name: string,
  profilePic?: string,
  isDM?: boolean,
  participants: friendInterface[] | [],
}

interface loadingProps{
  isLoading: boolean,
  setIsLoading: (value:boolean) => void,
};

interface sessionProps{
  user : userInterface | null,
  isAuthenticated: boolean,
  accessToken: string,
  roomId: string,
  setRoomId: (id:string) => void,
  setUser:(user: userInterface | null) => void,
  setIsAuthenticated:(value:boolean) => void,
  setAccessToken:(value:string) => void,
}

interface serverProps{
  servers: serverInterface[] | [],
  selectedServer: serverInterface | null,
  setSelectedServer: (server: serverInterface | null) => void,
  setServers:(servers:serverInterface[]) => void,
  addServer:(server:serverInterface) => void,
  removeServer:(serverId:string) => void,
  addChannel:(channel:channelInterface) => void
}

interface friendProps{
  friends: friendInterface[] | [],
  setFriends:(friends:friendInterface[]) => void,
  addFriend:(friend:friendInterface) => void,
  removeFriend:(friendId:string) => void,
}

interface chatProps{
  chat: chatType | null,
  setChat: (chat:chatType|null) => void,
}

interface MessagesProp{
  messages: messageInterface[],
  setMessages: (messages:messageInterface[]) => void,
  addNewMessage: (message:messageInterface) => void,
}

interface RequestProps{
  requests: requestInterface[],
  setRequests: (requests:requestInterface[]) => void,
  addRequest: (request:requestInterface) => void,
  removeRequest: (id:string) => void 
}

interface onlineUsersProps{
  onlineUsers: string[],
  setOnlineUsers: (value:string[]) => void,
}




const useChatStore = create<chatProps>((set) => ({
  chat: null,
  setChat: (chat:chatType |null) => set(({chat}))
}))


const useAuthStore = create<sessionProps>((set) => ({
  user: null,
  isAuthenticated: false,
  accessToken: "",
  roomId: "",
  setRoomId: (id:string) => set({roomId: id}),
  setAccessToken : (value:string) => set({accessToken: value}),
  setUser: (user:userInterface | null) => set({user}),
  setIsAuthenticated: (value:boolean) => set({isAuthenticated:value}),
}));

const useServerStore = create<serverProps>((set) => ({
  servers: [],
  selectedServer: null,
  setSelectedServer: (server:serverInterface|null) => set({selectedServer:server}),
  setServers: (servers:serverInterface[]) => set({servers}),
  addServer: (server:serverInterface) => set((state) => ({
    servers: [...state.servers, server]
  })),
  removeServer: (serverId:string) => set((state) => ({
    servers: state.servers.filter((s) => s._id !== serverId)
  })),
  addChannel: (channel:channelInterface) => set((state) => ({
    selectedServer: { ...state.selectedServer as serverInterface , channels: [ ...(state.selectedServer?.channels || []) , channel]},
    servers: state.servers.map((s) => s._id === state.selectedServer?._id ? {...s, channels: [...s.channels, channel]}: s) 
  }))
}));

const useFriendStore = create<friendProps>((set) => ({
  friends: [],
  setFriends: (friends:friendInterface[]) => set({friends}),
  addFriend: (friend:friendInterface) => set((state) => ({
    friends: [...state.friends, friend]
  })),
  removeFriend: (friendId:string) => set((state) => ({
    friends: state.friends.filter((f) => f._id !== friendId)
  }))
}));

const useLoadingStore = create<loadingProps>((set) => ({
  isLoading: false,
  setIsLoading: (value: boolean) => set({isLoading:value})
}))

const useMessageStore = create<MessagesProp>((set) => ({
  messages: [],
  setMessages: (messages:messageInterface[]) => set({messages}),
  addNewMessage: (message:messageInterface) => set((state) => ({
    messages: [...state.messages, message]
  }))
}));


const useRequestStore = create<RequestProps>((set) => ({
  requests: [],
  setRequests: (requests:requestInterface[]) => set({requests}),
  addRequest: (request:requestInterface) => set((state) => ({
    requests: [...(state.requests || []), request]
  })),
  removeRequest: (id:string) => set((state) => ({
    requests: state.requests?.filter((f) => f._id !== id)
  }))
}));


const useOnlineUserStore = create<onlineUsersProps>((set) => ({
  onlineUsers: [],
  setOnlineUsers: (value:string[]) => set(() => ({
    onlineUsers: value
  }))
}))


export { 
  useAuthStore,
  useServerStore,
  useFriendStore,
  useLoadingStore,
  useChatStore,
  useMessageStore,
  useRequestStore,
  useOnlineUserStore
}
