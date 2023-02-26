import { atom } from "recoil";

export const wsMessages = atom<string[]>({
  key: "wsMessages",
  default: [],
});
export const wsNickName = atom<string>({
  key: "wsNickName",
  default: "",
});
export const ioMessages = atom<string[]>({
  key: "ioMessages",
  default: [],
});
export const ioNickName = atom<string>({
  key: "ioNickName",
  default: "",
});
export const ioCurrentRoom = atom<string>({
  key: "ioCurrentRoom",
  default: "",
});
export const ioRooms = atom<string[]>({
  key: "ioRooms",
  default: [],
});
export const ioIsHookAdded = atom<boolean>({
  key: "ioIsHookAdded",
  default: false,
});
export const ioIsMuted = atom<boolean>({
  key: "ioIsMuted",
  default: false,
});
export const ioIsCameraOff = atom<boolean>({
  key: "isCameraOff",
  default: false,
});
export const ioPeerConnection = atom<RTCPeerConnection | null>({
  key: "ioPeerConnection",
  default: null,
});
export const ioStream = atom<MediaStream | null>({
  key: "ioStream",
  default: null,
});
