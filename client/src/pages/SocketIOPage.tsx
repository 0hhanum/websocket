import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRecoilState } from "recoil";
import { io } from "socket.io-client";
import styled from "styled-components";
import {
  ioCurrentRoom,
  ioIsHookAdded,
  ioMessages,
  ioNickName,
  ioRooms,
} from "../atom";
import VideoComponent from "../components/VideoComponent";

interface IRoomForm {
  roomName: string;
}
interface IChatForm {
  message: string;
  nickname: string;
}
const Room = styled.li<{ isActive: boolean }>`
  cursor: pointer;
  color: ${(props) => (props.isActive ? "yellow" : "var(--color)")};
`;
const Section = styled.section`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1.5fr;
  gap: 20px;
  section {
    border: 0.5px solid var(--form-element-border-color);
    border-radius: 5px;
    height: 50vh;
    margin: 0;
    padding: 20px;
    :first-child,
    :last-child {
      overflow-y: scroll;
    }
  }
  margin: 20px 0;
`;
const socket = io("http://localhost:3001", {
  withCredentials: true,
});
function SocketIOPage() {
  const [messages, setMessages] = useRecoilState(ioMessages);
  const [currentRoom, setCurrentRoom] = useRecoilState(ioCurrentRoom);
  const [nicknameState, setNicknameState] = useRecoilState(ioNickName);
  const [rooms, setRooms] = useRecoilState(ioRooms);
  const [isHookAdded, setIsHookAdded] = useRecoilState(ioIsHookAdded);
  const { register: roomRegister, handleSubmit: handleRoomSubmit } =
    useForm<IRoomForm>();
  const { register, handleSubmit, resetField, setValue } = useForm<IChatForm>();
  useEffect(() => {
    if (!isHookAdded) {
      socket.on("joinRoom", (roomMemberCount: number) => {
        addMessage(`someone joined - current participants: ${roomMemberCount}`);
      });
      socket.on("leaveRoom", (roomMemberCount: number) => {
        addMessage(`someone left - current participants: ${roomMemberCount}`);
      });
      socket.on("message", addMessage);
      socket.on("roomChanged", (rooms: string[]) => {
        setRooms(rooms);
      });
      setIsHookAdded(true);
    } else {
      if (rooms.length === 0) {
        socket.emit("getRooms", setRooms);
      }
      setValue("nickname", nicknameState);
    }
  }, [socket]);
  const onRoomValid: SubmitHandler<IRoomForm> = ({ roomName }) => {
    socket.emit("enterRoom", { roomName }, (roomMemberCount: number) => {
      addMessage(
        `enter to room ${roomName} - current participants: ${roomMemberCount}`
      );
      setCurrentRoom(roomName);
    }); // can send object & eventName!
  };
  const onChatValid: SubmitHandler<IChatForm> = ({ message, nickname }) => {
    if (nickname !== nicknameState) {
      setNicknameState(nickname);
    }
    socket.emit("message", { message, nickname, roomName: currentRoom }, () =>
      addMessage(`Me: ${message}`)
    );
    resetField("message");
  };
  const moveRoom = (targetRoomName: string) => {
    socket.emit("moveRoom", targetRoomName, currentRoom, () => {
      setCurrentRoom(targetRoomName);
      setMessages([]);
      addMessage(`enter to room ${targetRoomName}`);
    });
  };
  function addMessage(message: string) {
    setMessages((current) => current.concat(message));
  }
  return (
    <>
      {socket.connected ? (
        <div>
          {currentRoom ? (
            <form onSubmit={handleSubmit(onChatValid)}>
              <Section>
                <section>
                  <ul>
                    {rooms.map((room) => (
                      <Room
                        key={room}
                        isActive={room === currentRoom}
                        onClick={() => moveRoom(room)}
                      >
                        {room}
                      </Room>
                    ))}
                  </ul>
                </section>
                <section>
                  <VideoComponent myVideo={true} />
                  <VideoComponent myVideo={false} />
                </section>
                <section>
                  <ul>
                    {messages.map((message, i) => (
                      <li key={i}>{message}</li>
                    ))}
                  </ul>
                </section>
              </Section>
              <div style={{ display: "flex" }}>
                <input
                  {...register("nickname", { required: true })}
                  type="text"
                  placeholder="choose a nickname"
                  style={{ width: "20%", marginRight: "20px" }}
                />
                <input
                  {...register("message", {
                    required: true,
                  })}
                  type="text"
                  autoComplete="off"
                  placeholder="write a message"
                />
              </div>
              <button>Send</button>
            </form>
          ) : (
            <form onSubmit={handleRoomSubmit(onRoomValid)}>
              <input
                {...roomRegister("roomName", { required: true })}
                type="text"
                placeholder="Enter the roomname"
              />
              <button>Enter</button>
            </form>
          )}
        </div>
      ) : (
        <h2>Something went wrong. Refresh the browser -_-</h2>
      )}
    </>
  );
}
export default SocketIOPage;
