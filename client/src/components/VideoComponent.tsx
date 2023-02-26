import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { ioIsCameraOff, ioIsMuted } from "../atom";
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const getMedia = async () => {
    const myStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
      },
      audio: true,
    });
    videoRefs.current!.srcObject = myStream;
    setStream(myStream);
  };
  const createConnection = async () => {
    const peerConnection = new RTCPeerConnection();
    setPeerConnection(peerConnection);
    if (stream !== null) {
      stream.getTracks().forEach((track) => {
        // audio track, video track
        peerConnection.addTrack(track, stream);
      });
    }
  };
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
        getMedia();
      }
    } catch (e) {
      console.log(e);
    }
  }, [videoRefs]);
  useEffect(() => {
    try {
      if (!stream) return;
      if (stream) {
        createConnection();
      }
    } catch (e) {
      console.log(e);
    }
  }, [stream]);
  return (
    <>
      <Video
        ref={videoRefs}
        autoPlay
        playsInline
        style={{ display: stream === null ? "none" : "" }}
      />
      {stream === null ? (
        <Container>
          <ProgressComponent />
        </Container>
      ) : null}
    </>
  );
}
