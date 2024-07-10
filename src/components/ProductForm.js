import React, { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import useClipboard from "react-use-clipboard";
import "./ProductForm.css"; // Import the CSS file

const ProductForm = ({ categories, onSubmit, editProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [ocrTarget, setOcrTarget] = useState(""); // State to track the target of OCR (name or date)
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [textToCopy, setTextToCopy] = useState("");
  const [isCopied, setCopied] = useClipboard(textToCopy, {
    successDuration: 1000,
  });

  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
  const { transcript, browserSupportsSpeechRecognition, resetTranscript } =
    useSpeechRecognition();

  useEffect(() => {
    if (editProduct) {
      setSelectedCategory(editProduct.category);
      setProductName(editProduct.name);
      setExpiryDate(editProduct.expiryDate);
      setText(editProduct.text);
    }
  }, [editProduct]);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      processImage(file, ocrTarget);
    }
  };

  const processImage = (image, target) => {
    setIsOcrProcessing(true);
    Tesseract.recognize(image, "eng", { logger: (m) => console.log(m) }).then(
      ({ data: { text } }) => {
        if (target === "name") {
          setProductName(text);
        } else if (target === "date") {
          setExpiryDate(text);
        }
        setIsOcrProcessing(false);
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
      processImage(blob, ocrTarget);
    });
  };

  const openCamera = (target) => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const video = videoRef.current;
      video.srcObject = stream;
      video.play();
    });
    setIsCameraOpen(true);
    setOcrTarget(target);
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
    if (ocrTarget === "name") {
      setProductName(transcript);
    } else if (ocrTarget === "date") {
      setExpiryDate(transcript);
    }
    resetTranscript();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const product = {
      id: editProduct ? editProduct.id : Date.now(),
      category: selectedCategory,
      name: productName,
      expiryDate,
      image,
      text,
    };
    saveProductToLocalStorage(product); // Save to local storage
    onSubmit(product);
  };

  const saveProductToLocalStorage = (product) => {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products = products.filter((p) => p.id !== product.id); // Remove any existing entry with the same ID
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));
  };

  const checkExpiryDates = () => {
    console.log("Checking expiry dates...");
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const today = new Date().toISOString().split("T")[0];
    console.log(`Today's date: ${today}`);
    products.forEach((product) => {
      console.log(
        `Checking product: ${product.name}, expiryDate: ${product.expiryDate}`
      );
      if (product.expiryDate === today) {
        console.log(`Product ${product.name} expires today.`);
        scheduleNotification(product.name);
      }
    });
  };

  const scheduleNotification = (productName) => {
    const now = new Date();
    const notificationTime = new Date(now.getTime() + 10000); // Schedule notification for 10 seconds from now for testing

    const delay = notificationTime - now;
    console.log(`Current time: ${now}`);
    console.log(`Notification time: ${notificationTime}`);
    console.log(
      `Scheduling notification for ${productName} in ${delay / 1000} seconds.`
    );

    setTimeout(() => {
      showNotification(productName);
    }, delay);
  };

  const showNotification = (productName) => {
    if (Notification.permission === "granted") {
      console.log(`Showing notification for ${productName}`);
      new Notification(`${productName} will expire today`);
    } else {
      console.log("Notification permission not granted");
    }
  };

  const requestNotificationPermission = () => {
    if (Notification.permission !== "granted") {
      alert("Please allow notifications to get expiry alerts.");
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.log("Notification permission denied.");
        }
      });
    } else {
      console.log("Notification permission already granted.");
    }
  };

  // Request notification permission on component mount
  useEffect(() => {
    requestNotificationPermission();
    console.log("Performing initial expiry date check");
    checkExpiryDates(); // Initial check on mount

    console.log("Setting interval for checking expiry dates");
    const interval = setInterval(checkExpiryDates, 60000); // Check every minute for testing
    return () => clearInterval(interval);
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser does not support speech recognition.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-column">
        <label>
          Category:
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">Select Category</option>
            {categories.map((category) => (
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
        <button type="button" onClick={() => openCamera("name")}>
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
        <button type="button" onClick={startListening}>
          Start Listening
        </button>
        <button type="button" onClick={handleStopListening}>
          Stop Listening
        </button>
        <button type="button" onClick={() => setTextToCopy(transcript)}>
          Copy Text
        </button>
        <button type="button" onClick={setCopied}>
          {isCopied ? "Copied!" : "Copy"}
        </button>
        <label>
          Text from image:
          <textarea value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <button type="submit">Save Product</button>
      </div>
    </form>
  );
};

export default ProductForm;
