import { useEffect, useRef } from "react";

interface IProps {
  myVideo: boolean;
}
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
  return <video ref={videoRefs} autoPlay playsInline></video>;
}
