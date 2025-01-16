import React, {useEffect, useRef, useState} from "react";
import { QRCodeCanvas } from "qrcode.react";
import './App.css';

//Component to upload an image(flyer, poster).
function ImageUpload({handleImage}) {
  return <label id="imageInput">Upload a image: 
    <input id='imageInput' type="file" accept="image/*" onChange={handleImage}/>
  </label>
}

//Component to upload multiple urls.
function UrlUpload({handleUrl, urls}) {
  return <textarea
  type="text"
  placeholder="Enter URLs，one per line."
  value={urls}
  onChange={handleUrl}
/>
}

// Component to edit QR code details like position and size
function QrDetail({qrDetail,handleQrDetail}) {
  return <div>
    <p>Edit Qr Code Position and Size:</p>
  <form id="qrDetail"> 
    <label>X: <input id="x" type="number" value={qrDetail.x} onChange={handleQrDetail}></input></label>
    <label>Y: <input id="y" type="number" value={qrDetail.y} onChange={handleQrDetail}></input></label>
    <label>Size: <input id="size" type="number" value={qrDetail.size} onChange={handleQrDetail}></input></label>
  </form>
  </div>
}

// Component to render canvas with the uploaded image and QR code overlay
function Canvas({imageSrc, urls, qrDetail, handleQrPosition}) {
  const mainCanvas = useRef(null);
  const qrCodeCanvas = useRef(null);
  const urlsArray = urls.split('\n');

  useEffect(()=> {
    if (mainCanvas.current && (imageSrc || urls)) {
      const canvasContext = mainCanvas.current.getContext('2d');
      canvasContext.clearRect(0, 0, mainCanvas.current.width, mainCanvas.current.height);

      const img = new Image();
      img.src = imageSrc;

      img.onload = ()=> {
      mainCanvas.current.width = img.width;
      mainCanvas.current.height = img.height;
      canvasContext.drawImage(img, 0, 0, img.width, img.height);

      const qrCodeImage = new Image();
      qrCodeImage.src = qrCodeCanvas.current.toDataURL('image/png');
      qrCodeImage.onload = () => {
        canvasContext.drawImage(qrCodeImage, qrDetail.x, qrDetail.y, qrDetail.size, qrDetail.size);
      }
    };
    }
  },[imageSrc, urls, qrDetail]);

  return <>
  <canvas ref={mainCanvas} id="mainCanvas" width = '300' height= '300' onClick={handleQrPosition}> </canvas>
  <QRCodeCanvas ref={qrCodeCanvas} value={urlsArray[0]} style={{display: 'none'}} />
  </>
}

// Component to render QR codes for each URL. Don't display. Used to generate qrCode dataUrls.
function QrCodes({urls}) {
  if(!urls) return;
  const urlsArray = urls.split('\n');
  return (
    <ul style={{display: "none"}}>
      {urlsArray.map((url, index) => (
        <li key={index} className="qrCanvas">
          <QRCodeCanvas value={url} urltext={url}/>
        </li>)
)}
    </ul>
  )
}


const App = () => {
  const[imageSrc, setImageSrc] = useState('');
  const[urls, setUrls] = useState('');
  const[qrDetail, setQrDetail] = useState({x:0, y:0, size: 100});

  function handleImage(e) {
    let file = e.target.files[0];
    if(file) {
      setImageSrc(URL.createObjectURL(file));
    }
  }

  function handleUrl(e) {
    setUrls(e.target.value);
  }

  function handleQrDetail(e) {
    const {id, value} = e.target;
    setQrDetail({...qrDetail, [id]: parseInt(value,10)})
  }


  //Click on canvs to move the position of qr code.
  function handleQrPosition(e) {
    const canvas = e.target;
    var rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const pos = {
      x: (e.clientX - rect.left)*scaleX,
      y: (e.clientY - rect.top)*scaleY
    };
    setQrDetail({...qrDetail, x: pos.x, y: pos.y});
  }

  function handleDownload() {
    const results = [];
    const image = new Image();
    image.src = imageSrc;
    const qrCanvases = document.querySelectorAll('.qrCanvas canvas');
    qrCanvases.forEach((qrCanvas) => {
      const mainCanvas = document.createElement('canvas');
      mainCanvas.width = image.width;
      mainCanvas.height = image.height;
      const mainContext = mainCanvas.getContext('2d');
      mainContext.drawImage(image, 0, 0, image.width, image.height);
      const qrCode = new Image();
      qrCode.src = qrCanvas.toDataURL('image/png');
      qrCode.onload = () => {
      const urlText = qrCanvas.getAttribute('urltext');
      mainContext.drawImage(qrCode, qrDetail.x, qrDetail.y, qrDetail.size, qrDetail.size);
      results.push({urlText: urlText, imageUrl: mainCanvas.toDataURL('image/png')});
      if (results.length === qrCanvases.length) {
        downloadImages(results);
      }
    }})


    /*
    for (let i = 0; i < allQrCodeCanvas.length; i++) {
      const mainCanvas = document.createElement('canvas');
      mainCanvas.width = image.width;
      mainCanvas.height = image.height;
      const mainContext = mainCanvas.getContext('2d');
      mainContext.drawImage(image, 0, 0, image.width, image.height);

      const qrCode = new Image();
      qrCode.src = allQrCodeCanvas[i].toDataURL('image/png');
      const urlText = allQrCodeCanvas[i].getAttribute('urltext');
      mainContext.drawImage(qrCode, qrDetail.x, qrDetail.y, qrDetail.size, qrDetail.size);
      results.push({urlText: urlText, imageUrl: mainCanvas.toDataURL('image/png')});

    }*/
    
  };

  async function downloadImages(results) {
    for (const result of results) {
      try {
        const response = await fetch(result.imageUrl);
        const blob = await response.blob();
  
        const urlObject = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlObject;
        let filename = result.urlText.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^_+|_+$/g, '');
        link.download = filename.slice(0,100); // Extract filename from URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); 
      } catch (error) {
        console.error(`Error downloading ${result.imageUrl}:`, error);
      }
    }
  };

  return (
    <>
      <div id="intro">
      <h1>Generate Images with QrCodes from URLs</h1>
      <p>Given an image and many URLs, generate same images with different qr codes.</p>
      </div>
      <ImageUpload handleImage={handleImage} />
      <UrlUpload handleUrl={handleUrl} url={urls}/>
      <QrDetail handleQrDetail={handleQrDetail} qrDetail={qrDetail}/>
      <Canvas imageSrc={imageSrc} urls={urls} qrDetail={qrDetail} handleQrPosition={handleQrPosition}/>
      <QrCodes urls={urls} />
      <button onClick={handleDownload}>
        Download Image with QR Code
      </button>
    </>
  );
};

export default App;