import React, { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";
import { useSpeechRecognition } from "react-speech-recognition";

const ProductForm = ({ categories, onSubmit, editProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [image, setImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isListening, setIsListening] = useState(false); // State to manage listening status
  const [recognition, setRecognition] = useState(null); // State to store recognition instance
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const { resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (editProduct) {
      setSelectedCategory(editProduct.category);
      setProductName(editProduct.name);
      setExpiryDate(editProduct.expiryDate);
    }
  }, [editProduct]);

  useEffect(() => {
    // Cleanup on unmount or when listening state changes
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  useEffect(() => {
    removeExpiredProducts(); // Remove expired products on mount
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      processImage(file, "name");
    }
  };

  const processImage = (image, target) => {
    Tesseract.recognize(image, "eng", { logger: (m) => console.log(m) }).then(
      ({ data: { text } }) => {
        if (target === "name") {
          setProductName(text.trim());
        } else if (target === "date") {
          setExpiryDate(text.trim());
        }
        setIsCameraOpen(false);
      }
    );
  };

  const handleCaptureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      processImage(blob, "name");
    });
  };

  const openCamera = (target) => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.play();
      }
    });
    setIsCameraOpen(true);
  };

  const handleStartListening = () => {
    if (browserSupportsSpeechRecognition) {
      resetTranscript();
      window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new window.SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setProductName(transcript.trim());
      };

      recognitionInstance.onend = () => {
        if (isListening) {
          recognitionInstance.start();
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error detected: ' + event.error);
        recognitionInstance.stop();
      };

      recognitionInstance.start();
      setRecognition(recognitionInstance);
      setIsListening(true);
    } else {
      alert("Browser does not support speech recognition.");
    }
  };

  const handleStopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    resetTranscript();
    setIsListening(false);
  };

  const handleToggleListening = () => {
    if (isListening) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form fields
    if (!selectedCategory) {
      alert("Category is required");
      return;
    }
    if (!productName) {
      alert("Product Name is required");
      return;
    }
    if (!expiryDate) {
      alert("Expiry Date is required");
      return;
    }

    const product = {
      id: editProduct ? editProduct.id : Date.now(),
      category: selectedCategory,
      name: productName,
      expiryDate,
      image,
    };
    saveProductToLocalStorage(product); // Save to local storage
    removeExpiredProducts(); // Remove expired products after saving
    onSubmit(product);
  };

  const saveProductToLocalStorage = (product) => {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products = products.filter((p) => p.id !== product.id); // Remove any existing entry with the same ID
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));
  };

  const removeExpiredProducts = () => {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
    products = products.filter((product) => product.expiryDate >= currentDate);
    localStorage.setItem("products", JSON.stringify(products));
  };

  const filteredCategories = categories.filter(category => category.toLowerCase() !== 'expired');

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-column">
        <label>
          Category:
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">Select Category</option>
            {filteredCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Product Name:
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </label>
        <button type="button" onClick={openCamera}>
          Open Camera for Product Name
        </button>
        <label>
          Expiry Date:
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </label>
        <button type="button" onClick={() => openCamera("date")}>
          Open Camera for Expiry Date
        </button>
        {isCameraOpen && (
          <div className="camera-container">
            <video ref={videoRef} width="320" height="240" />
            <button type="button" onClick={handleCaptureImage}>
              Capture Image
            </button>
            <canvas
              ref={canvasRef}
              width="320"
              height="240"
              style={{ display: "none" }}
            />
          </div>
        )}
        <label>
          Upload Image:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
        <button type="button" onClick={handleToggleListening}>
          {isListening ? "Stop Listening" : "Start Listening"}
        </button>
        <button type="submit">Save Product</button>
      </div>
    </form>
  );
};

export default ProductForm;
