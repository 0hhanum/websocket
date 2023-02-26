import { useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRecoilState } from "recoil";
import { io } from "socket.io-client";
import styled from "styled-components";
import {
  ioCurrentRoom,
  ioIsCameraOff,
  ioIsHookAdded,
  ioIsMuted,
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
const VideoSection = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  div {
    display: flex;
    width: 100%;
    justify-content: space-around;
    height: 40px;
  }
  div:first-child {
    height: 85%;
  }
`;
const VideoCtrlBtn = styled.button<{ isOff: boolean }>`
  background-color: ${(props) => (props.isOff ? "red" : "transparent")};
  border-color: ${(props) => (props.isOff ? "red" : "var(--border-color)")};
  width: 45%;
  height: 100%;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  padding: 0;
  align-items: center;
  img {
    height: 25px;
  }
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
  const [isMuted, setIsMuted] = useRecoilState(ioIsMuted);
  const [isCameraOff, setIsCameraOff] = useRecoilState(ioIsCameraOff);
  const { register: roomRegister, handleSubmit: handleRoomSubmit } =
    useForm<IRoomForm>();
  const { register, handleSubmit, resetField, setValue } = useForm<IChatForm>();
  const messageSection = useRef<HTMLElement>(null);
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
    messageSection.current!.scrollTop =
      messageSection.current?.scrollHeight || 0;
  }
  return (
    <>
      {socket.connected ? (
        <div>
          {currentRoom ? (
            <>
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
                <VideoSection>
                  <div>
                    <VideoComponent myVideo={true} />
                    <VideoComponent myVideo={false} />
                  </div>
                  <div>
                    <VideoCtrlBtn
                      isOff={isMuted}
                      className="audio"
                      onClick={() => setIsMuted((current) => !current)}
                    >
                      {isMuted ? (
                        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABVUlEQVR4nL3WsUoDMRzH8UxODkUw0ofwHdTFQZwUXHyB9hUERVzq8/gI1qHQQXRwVlAHQR3cKnzl7/0LIU160UvyW9oc13zuf9f/JcYYY4ABYE3NAEOa3FfFAatoEg6sAJfAC/AMjORYcZwG8jP6FywB1oE7negB6JtAtFI/r6ZLSMCJpBOcgheD2/Ci8DK8OBzDq8CRVqsDByqvVvFWoPIoDNwA4xzwN3DcVrlzfp47QJOZMw5WXgrGO7ZQeXEYOIpUbnPDXzrXqo6fIs9c+nxTv3/kgG91sm1nWZxFKn/Tz2kO+EInu3I2AoI/AvsBXHKWA94APnXCk1w7maQAh9rPv5UDO/LMgR6wC+yVxA+Ad79/530uF1cSt8C5/HkcdAKcAmveeXnxedr6NXUP9+ekvCiy4DSrTlsWVqXOtx0YJ8DXkd/aYs884cJdfFgNdvCBDH4Ai2FbYGf3JOEAAAAASUVORK5CYII=" />
                      ) : (
                        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADVklEQVR4nO2ay0tVURTGLyR5Ba3IigwdZFBZWlDRIKp/IGpYUVnT3jTL/oFKa2aPQTRJiSArmvTAamAPkiKMrLCXYdADJIJelNgvFn0XNgfr3uPZ53QsP9gga9/1rbXOXnuvfdYxk/EMYBqwA7gMvAK+adjflzRXkUkrgAnAQeAr+fEFOGA6mTQBmAs8dRxtBzYDdcBkjTrJrji/e2K6mTQAqAU+yLFuYEkBOkuBh9Ix3dpkvP0NgEnASzl0ESgLoVumPWPoBcozfwvAETlyDygdhn4p0CWOQ/F4md+JGcAAMAgsiMCzCPghrmq/XhbmwB49yXMeuM6La7cf78IZvyXj6zxwbRDXDT/ehTP+TsZneuCaLa43frwr3HCR9oZhvAe+8eIaBMb48bIww9k8lduq+4oh9NYA3/PoZkdCIKt170plINm08WX+90CGwugeIc4VAZqBo0mnFr/eWZqi8ruG7Hbam89wDIH0unbjDiS2PUKKAwlVR0g4kH8mtbIjKZBuoD/pSyPQDzyIyu8auqq3OPdpvZXxWR74a8T12pGVSNYeld81dFKk0x3ZTcnWe+CvF9f1wKu0oTUqv2tol0jrk3rVBTZJtjMqf7ABZ2hzZNVO82FhBO7FSlurL+6Kn5XNGh8xuAafAx/dzQ0clrGuYbaDrLd1XxzNgfbrJ+te+owhR75NBvc6snIdkajZFqZBN06NbsMLYKIz1yj5ljgCKdFJ9RmoDKRdrmX6CFhWANdy4LF0Prj9X6BKTe43sd2EgbUy3gGMdeRz1JDO4RqwFZgHTNGYL5nN5dBjug5PsbWENLc6liAcY60ydGyIotakp5kPtqr7g8UUOK75lliDcHK7MxeMuzKar9B+ugD0OR96+iSzVZka0Cl2grhtNmIPxDlV7jhpVhmBq8pJp04fV57hrEyLHLB02hfmC5QeRqOTiifCnHreYVcUuyPJGTv724CNVtwCd7OsiqhV7DP6LdKN3D/2Ajm5XUUziH6NIJ5pLyXX/gkD1ZWGwBFrI4cG98hNNQi8KP21BlxUjAaSNoyuSNowYlYEWAXcLaBrGAZW4TsK+c8JX0GsJF4M2Lf3JAKxlUCd8iKPvJZ+p8R92hfvnwzm6936QE8SgbxPYHSFdewnE1TvQAP96fIAAAAASUVORK5CYII=" />
                      )}
                    </VideoCtrlBtn>
                    <VideoCtrlBtn
                      isOff={isCameraOff}
                      className="camera"
                      onClick={() => setIsCameraOff((current) => !current)}
                    >
                      {isCameraOff ? (
                        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAACDUlEQVR4nO3ZMa9MQRjG8b2JRnQSsldCQqMQH4ACJSWlSquRawsSfACND6CT6JSiIxEaNHKJBLVWSBAiIT+ZNZs91l1nd2fO2Vk5T7V79n3nzP88uzPzvtvDc7xEv7fKwgu/9XqlYbAbryLMW+zprap0MIVK50yh0jlTgHASD/AZV+K1ftxfmtRXPMM5rKVCXNviBhdahBnp9sIw0Ymgb9jYanefgMl6AsA6Lsb7B51fdKDwdQraqIlrDCaOP4hjv5kzb9sQHp/iALUTa8GZkXbMEL+GM6P5hAtDlXA2M9Y/HxCO4HElfn6QJp1RA4LDuFeJe5cE0pQzpoBgL27iR/z8Ay5jezJIEzAmQLAT1ysr2vcItGsyJwkkN4yxDsQn/jG+/4k72D8tJxkk52/GWO8rr+/iUF1OFpBczvhTT3F81pxsIDmcMdbZeXOygqQ6Y6z+0kFSYJQGsiiMEkEWgVEqyLwwSgaZB0bpILMuzUpaflOc8feGeKJIkDpnlHBEyeGMZR8ac8FY5jE+89dsWmG1D7eiM6PC6lK2wqoBmPZL3YZhDtbEH8OTSvwQJLRIg9bbm3p6CWCLdtCjmDxob9r56hmVBl2gEleGQdvOxMbc1bDc9lKLM9xQho7mgDmNh/jS8uRDy/Y+TrXZa25Vun/OCpXOmUKlc6ZQ+c+c6Vf2mc1lzydJEWYz1Pe/AHHCO8jpaavTAAAAAElFTkSuQmCC"></img>
                      ) : (
                        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABZ0lEQVR4nO2ZMU4CQRSGh8SQUNqYQGzsPYCtNTSEU1jZgLQmWngFr2Cr7ZJQwgU4wPYWYAwkkI8MeRtJFNllXDIzvq/aZffN/P++2dmZhzGKoiiKonwBtIAE+OC4zKTfpnEFeMQPHlwzYZkDXaDu/GSK9V8HetI/B2cGGGzCofvnKovpuBMdScG4E+DGHkylgaNm4gdBDdExzXl/BWgDExtkf9hgPICcWoArYJjdH5wR4BJ43dKfBmUEOAeegWU2/IB7oBaEEeAUeAI+5dJCDJ19i/HRCFAFboF3OV8BL8DFrhhfjaRbx2/23dgX46sRywi4zhvjq5GO/U4UifHSiDkkRo2UAJoRdGiVArENLWKZfoVxDB/ENJYlSjWKRaOJZRlv9m+sZkFtrKLb6uYtPkRTDkqkgV75cn8V1nct0DWlgblU+xrlyd2Zib7MSDgVs23xmNCL2BmSmUSmtjD/VlAURVGU/84aBH4Iye2/kp8AAAAASUVORK5CYII="></img>
                      )}
                    </VideoCtrlBtn>
                  </div>
                </VideoSection>
                <section ref={messageSection}>
                  <ul>
                    {messages.map((message, i) => (
                      <li key={i}>{message}</li>
                    ))}
                  </ul>
                </section>
              </Section>
              <form onSubmit={handleSubmit(onChatValid)}>
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
            </>
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
