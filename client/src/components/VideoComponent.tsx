import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { ioIsCameraOff, ioIsMuted } from "../atom";

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
  const isMuted = useRecoilValue(ioIsMuted);
  const isCameraOff = useRecoilValue(ioIsCameraOff);
  const [stream, setStream] = useState<MediaStream | null>(null);
  useEffect(() => {
    if (stream === null) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !isMuted;
    });
  }, [isMuted]);
  useEffect(() => {
    console.log("cameraOff", isCameraOff);
  }, [isCameraOff]);
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
            setStream(e);
          });
      }
    } catch (e) {
      console.log(e);
    }
  }, [videoRefs]);
  return <Video ref={videoRefs} autoPlay playsInline />;
}
