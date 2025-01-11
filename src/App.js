import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const App = () => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [qrPosition, setQrPosition] = useState({ x: 100, y: 100 });
  const [qrSize, setQrSize] = useState(150); // Default QR code size
  const canvasRef = useRef(null);
  const qrCanvasRef = useRef(null);

  const visibleWidth = 500; // External visible size of the canvas
  const visibleHeight = 500;
  const scale = 2; // Scaling factor for high resolution

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Redraw the canvas (image + QR code) with scaling
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const qrCanvas = qrCanvasRef.current;
    const img = new Image();
    img.src = image;

    // Set internal resolution of the canvas (scaled dimensions)
    canvas.width = visibleWidth * scale;
    canvas.height = visibleHeight * scale;

    // Set visible size (remains 500x500)
    canvas.style.width = `${visibleWidth}px`;
    canvas.style.height = `${visibleHeight}px`;

    // Apply scaling to all drawings
    ctx.scale(scale, scale);

    img.onload = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, visibleWidth, visibleHeight);

      // Draw the uploaded image
      ctx.drawImage(img, 0, 0, visibleWidth, visibleHeight);

      // Draw the QR code at the selected position and size
      ctx.drawImage(
        qrCanvas,
        qrPosition.x, // X-coordinate for QR code
        qrPosition.y, // Y-coordinate for QR code
        qrSize, // Width of QR code
        qrSize // Height of QR code
      );
    };
  };

  // Redraw the canvas whenever image, URL, QR position, or size changes
  useEffect(() => {
    if (image && url) {
      redrawCanvas();
    }
  }, [image, url, qrPosition, qrSize]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "image-with-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Image with QR Code Generator</h1>

      {/* Image upload input */}
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <br />

      {/* URL input */}
      <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <br />

      {/* QR code size slider */}
      <label htmlFor="qrSize">QR Code Size: {qrSize}px</label>
      <input
        id="qrSize"
        type="range"
        min="50"
        max="300"
        value={qrSize}
        onChange={(e) => setQrSize(Number(e.target.value))}
        style={{ marginLeft: "10px" }}
      />
      <br />

      {/* Hidden canvas for generating the QR code */}
      <QRCodeCanvas
        value={url}
        size={qrSize * scale} // High-quality QR code
        style={{ display: "none" }}
        ref={qrCanvasRef}
      />

      {/* Main canvas for displaying the final image */}
      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid black",
          marginTop: "20px",
          width: `${visibleWidth}px`, // Ensure visible size stays 500x500
          height: `${visibleHeight}px`,
          cursor: "move",
        }}
        onMouseDown={(e) => {
          const rect = canvasRef.current.getBoundingClientRect();
          const startX = e.clientX - rect.left - qrPosition.x;
          const startY = e.clientY - rect.top - qrPosition.y;

          const handleMouseMove = (event) => {
            setQrPosition({
              x: event.clientX - rect.left - startX,
              y: event.clientY - rect.top - startY,
            });
          };

          const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
          };

          window.addEventListener("mousemove", handleMouseMove);
          window.addEventListener("mouseup", handleMouseUp);
        }}
      ></canvas>
      <br />

      {/* Button to download the final image */}
      <button onClick={handleDownload} style={{ marginTop: "10px" }}>
        Download Image with QR Code
      </button>
    </div>
  );
};

export default App;
