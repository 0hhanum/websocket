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
