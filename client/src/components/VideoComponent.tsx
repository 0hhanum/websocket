import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import {
  ioIsCameraOff,
  ioIsMuted,
  ioPeerConnection,
  ioPeerStream,
  ioStream,
} from "../atom";
import ProgressComponent from "./ProgressComponent";

interface IProps {
  myVideo: boolean;
}
const Video = styled.video`
  object-fit: cover;
  border-radius: 5px;
  width: 45%;
`;
const Container = styled.div`
  border-radius: 5px;
  width: 45% !important;
  height: auto !important;
`;
export default function VideoComponent({ myVideo }: IProps) {
  const videoRefs = useRef<HTMLVideoElement>(null);
  const isMuted = useRecoilValue(ioIsMuted);
  const isCameraOff = useRecoilValue(ioIsCameraOff);
  const stream = useRecoilValue(ioStream);
  const peerStream = useRecoilValue(ioPeerStream);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (stream === null) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !isMuted;
    });
  }, [isMuted]);
  useEffect(() => {
    if (stream === null) return;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !isCameraOff;
    });
  }, [isCameraOff]);
  useEffect(() => {
    try {
      if (!videoRefs.current) return;
      if (myVideo) {
        videoRefs.current!.srcObject = stream;
        setReady(true);
      }
    } catch (e) {
      console.log(e);
    }
  }, [videoRefs]);
  useEffect(() => {
    try {
      if (!videoRefs.current) return;
      if (!myVideo && peerStream) {
        videoRefs.current!.srcObject = peerStream;
        setReady(true);
      }
    } catch (e) {
      console.log(e);
    }
  }, [peerStream]);
  return (
    <>
      <Video
        ref={videoRefs}
        autoPlay
        playsInline
        style={{ display: ready ? "" : "none" }}
      />
      {ready ? null : (
        <Container>
          <ProgressComponent />
        </Container>
      )}
    </>
  );
}
