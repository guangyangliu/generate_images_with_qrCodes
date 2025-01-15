import React, { use, useEffect, useRef, useState} from "react";
import { QRCodeCanvas } from "qrcode.react";
import './App.css';


//upload image and show it.
function ImageUpload({handleImage}) {
  return <input id='imageInput' type="file" accept="image/*" onChange={handleImage} />
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

//take an imageSrc show an image with qrcode on it.
function Canvas({imageSrc, mainCanvas}) {
  
  
  useEffect(()=> {
    if (mainCanvas.current && imageSrc) {
      let img = new Image();
      img.src = imageSrc;
      img.onload = ()=> {
      const canvasContext = mainCanvas.current.getContext('2d');
      mainCanvas.current.width = img.width;
      mainCanvas.current.height = img.height;
      canvasContext.drawImage(img, 0, 0, img.width, img.height);
    }
    }
  },[imageSrc]);
  return <canvas ref={mainCanvas} id="mainCanvas" width = '300' height= '300'> </canvas>
}

function DemoQr({urls, mainCanvas}) {
  const qrCodeCanvas = useRef(null);
  useEffect(() => {
    if(mainCanvas.current && urls) {
      const qrCodeImage = new Image();
      qrCodeImage.src = qrCodeCanvas.current.toDataURL('image/png');
      qrCodeImage.onload = () => {
        const mainContext = mainCanvas.current.getContext('2d');
        mainContext.drawImage(qrCodeImage, 50, 50, qrCodeImage.width, qrCodeImage.height);
      }
      
    }
  }, [urls, mainCanvas]);
  const urlsArray = urls.split('\n');
  return <QRCodeCanvas ref={qrCodeCanvas} value={urlsArray[0]} style={{display: 'none'}} />
}


function QrCodes({urls}) {
  if(!urls) return;
  const urlsArray = urls.split('\n');
  return (
    <ul style={{display: "none"}}>
      {urlsArray.map((url, index) => (
        <li key={index} className="qrCanvas">
          <QRCodeCanvas value={url}/>
        </li>)
)}
    </ul>
  )
}



const App = () => {
  const[imageSrc, setImageSrc] = useState('');
  const[urls, setUrls] = useState('');
  const mainCanvas = useRef(null);
  //const [qrCodePosition, setQrCodePosition] = useState({x:0, y:0, width:100, height:100});

  function handleImage() {
    let imageInput = document.getElementById('imageInput');
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
    const allQrCodeCanvas = document.querySelectorAll('.qrCanvas canvas');
    for (let i = 0; i < allQrCodeCanvas.length; i++) {
      const mainCanvas = document.createElement('canvas');
      mainCanvas.width = image.width;
      mainCanvas.height = image.height;
      const mainContext = mainCanvas.getContext('2d');
      mainContext.drawImage(image, 0, 0, image.width, image.height);

      const qrCode = new Image();
      qrCode.src = allQrCodeCanvas[0].toDataURL('image/png');
      mainContext.drawImage(qrCode, 50, 50, qrCode.width, qrCode.height);

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
      <Canvas imageSrc={imageSrc} mainCanvas={mainCanvas}/>
      <br />
      <DemoQr urls={urls}  mainCanvas={mainCanvas}/>
      <QrCodes urls={urls} />
      <br />
      <button onClick={handleDownload}>
        Download Image with QR Code
      </button>
    </div>
  );
};

export default App;