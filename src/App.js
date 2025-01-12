import React, { use, useEffect, useRef, useState} from "react";
import { QRCodeCanvas } from "qrcode.react";
import './App.css';


//upload image and show it.
function ImageUpload({handleImage}) {
  return <input type="file" accept="image/*" onChange={handleImage} />
}

//upload urls and show it.
function UrlUpload({handleUrl, urls}) {
  return <textarea
  type="text"
  placeholder="Enter URLs"
  value={urls}
  onChange={(e) => handleUrl(e)}
  rows = "10"
/>
}

function QrPostion() {
  return (
    <form>
      <label id="x">
      X:
      <input type="number" id="x"/>
      </label>
      <label id="y">Y:
      <input type="number" id="y"/>
      </label>
      <label id="width">
        Width:
      <input type="number" id="width"/>
      </label>
      <label id="height">
        Height:
      <input type="number" id="height"/>
      </label>
    </form>
  )
}

//take an imageSrc and url, show an image with qrcode on it.
function Canvas({imageSrc}) {
  const mainCanvas = document.getElementById('mainCanvas');
  if(mainCanvas) {
    const canvasContext = mainCanvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      canvasContext.drawImage(img, 0, 0, 300, 400);
      const qrCanvas = document.querySelector('.qrCanvas canvas');
    if(qrCanvas) {
      const qrCode = new Image();
      qrCode.src = qrCanvas.toDataURL('image/png');
      canvasContext.drawImage(qrCode, 0, 0, 50, 50);
    }
    }
  }
  return <canvas id="mainCanvas" width='300px' height='400px'></canvas>
}

function QrCodes({urls}) {
  if(!urls) return;
  const urlsArray = urls.split('\n'); 
  return (
    <ul>
      {urlsArray.map((url, index) => (
        <li key={index} className="qrCanvas">
          <QRCodeCanvas value={url} />
        </li>
      ))}
    </ul>
  )
}



const App = () => {
  const[imageSrc, setImageSrc] = useState(null);
  const[urls, setUrls] = useState(null);
  
  //const [qrCodePosition, setQrCodePosition] = useState({x:0, y:0, width:100, height:100});

  function handleImage() {
    let imageInput = document.querySelector('input');
    let file = imageInput.files[0];
    if(file) {
      setImageSrc(URL.createObjectURL(file));
    }
  }

  function handleUrl(e) {
    setUrls(e.target.value);
  }

  function handleDownload() {
    const results = [];
    const image = new Image();
    image.src = imageSrc;
    let urlsArray = urls.split('\n');
    const allQrCodeCanvas = document.querySelectorAll('.qrCanvas canvas');
    for (let i = 0; i < allQrCodeCanvas.length; i++) {
      const mainCanvas = document.createElement('canvas');
      const mainContext = mainCanvas.getContext('2d');
      mainContext.drawImage(image, 0, 0, 300, 400);

      const qrCode = new Image();
      qrCode.src = allQrCodeCanvas[0].toDataURL('image/png');
      mainContext.drawImage(qrCode, 50, 50, 50, 50);

      results.push(mainCanvas.toDataURL('image/png'));
    }

    downloadImages(results);
  };


  async function downloadImages(urls) {
    for (const url of urls) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
  
        const urlObject = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlObject;
        link.download = url.split('/').pop(); // Extract filename from URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); 
      } catch (error) {
        console.error(`Error downloading ${url}:`, error);
      }
    }
  }


  

  return (
    <div>
      <h1>Image with QR Code Generator</h1>
      <ImageUpload handleImage={handleImage} />
      <br />
      
      <UrlUpload handleUrl={handleUrl} url={urls}/>
      <br />


      <Canvas imageSrc={imageSrc}/>
      <br />

      <QrCodes urls={urls}/>
      <br />

      <button onClick={handleDownload}>
        Download Image with QR Code
      </button>
    </div>
  );
};

export default App;