import React, { useState} from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import './App.css';

function ImageUpload({handleImage}) {
  return <input type="file" accept="image/*" onChange={handleImage} />
}

function UrlUpload({handleUrl, url}) {
  return <input
  type="text"
  placeholder="Enter URL"
  value={url}
  onChange={(e) => handleUrl(e)}
/>
}

function Canvas({imageSrc}) {
  const mainCanvas = document.getElementById('mainCanvas');
  if(mainCanvas) {
    const canvasContext = mainCanvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      canvasContext.drawImage(img, 0, 0, 300, 400);
      canvasContext.strokeStyle = 'red'; // Square border color
      canvasContext.lineWidth = 2; // Border width
      canvasContext.strokeRect(200, 300, 50, 50);
    }
    
  }
  return <canvas id="mainCanvas" width='300px' height='400px'></canvas>
}


const App = () => {
  const[imageSrc, setImageSrc] = useState(null);
  const[url, setUrl] = useState(null);

  console.log(imageSrc);

  function handleImage() {
    let imageInput = document.querySelector('input');
    let file = imageInput.files[0];
    if(file) {
      setImageSrc(URL.createObjectURL(file));
    }
  }

  function handleUrl(e) {
    setUrl(e.target.value);
  }

  function handleDownload() {
    const canvas = document.getElementById('mainCanvas');
    const link = document.createElement("a");
    link.download = "image-with-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div>
      <h1>Image with QR Code Generator</h1>
      <ImageUpload handleImage={handleImage} />
      <br />
      
      <UrlUpload handleUrl={handleUrl} url={url}/>
      <br />

      <Canvas imageSrc={imageSrc}/>
      <br />
      <button onClick={handleDownload}>
        Download Image with QR Code
      </button>
    </div>
  );
};

export default App;