import { useModal } from "contexts/ModalContext";
import React, { useEffect, useRef } from "react";

const OpenCam = (props) => {
  const player = useRef(null);
  const { onClose } = useModal();

  useEffect(() => {
    const initializeMedia = () => {
      if (!("mediaDevices" in navigator)) navigator.mediaDevices = {};

      if (!("getUserMedia" in navigator.mediaDevices)) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
          var getUserMedia =
            navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

          if (!getUserMedia)
            return Promise.reject(new Error("getUserMedia Not Implemented"));

          return new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      }

      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: "user" },
        })
        .then((stream) => {
          player.current.srcObject = stream;
        })
        .catch((error) => {
          console.error(error);
        });
    };
    initializeMedia();
  }, []);

  const capturePicture = async () => {
    if (player?.current && player?.current?.srcObject) {
      var canvas = document.createElement("canvas");
      canvas.width = player.current?.videoWidth;
      canvas.height = player.current?.videoHeight;
      var contex = canvas.getContext("2d");
      contex.drawImage(player.current, 0, 0, canvas.width, canvas.height);
      player.current.srcObject
        .getVideoTracks()
        .forEach((track) => track.stop());
      await props.imageDataURL?.set(canvas?.toDataURL());
      onClose();
    }
  };

  return (
    <>
      <div className="open-cam-container item-centery">
        <video ref={player} autoPlay></video>
        <button
          onClick={async () => await capturePicture()}
          className="btn btn-outline-light"
        >
          ⚪
        </button>
      </div>
    </>
  );
};

export default OpenCam;
