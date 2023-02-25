import { useEffect, useRef } from "react";
import styled from "styled-components";

interface IProps {
  myVideo: boolean;
}
const Video = styled.video`
  object-fit: cover;
  border-radius: 5px;
  width: 45%;
`;
export default function VideoComponent({ myVideo }: IProps) {
  const videoRefs = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    try {
      if (!videoRefs.current) return;
      if (myVideo) {
        const myStream = navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: true,
          })
          .then((e) => {
            videoRefs.current!.srcObject = e;
          });
      }
    } catch (e) {
      console.log(e);
    }
  }, [videoRefs]);
  return <Video ref={videoRefs} autoPlay playsInline />;
}
