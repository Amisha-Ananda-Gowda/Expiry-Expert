import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ProductForm from "./components/ProductForm";
import logo from './logo.png';

import toast, { Toaster } from 'react-hot-toast';
import { generateToken , messaging} from "./firebase";
import { onMessage } from "firebase/messaging";

import "./App.css";

const App = () => {
  const [categories, setCategories] = useState([
    "Expiring Soon",
    "Food",
    "Medicine",
    "Cosmetics",
    "Others",
    "Expired" // Added "Expired" category
  ]);
  const [selectedCategory, setSelectedCategory] = useState("Expiring Soon");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // State to manage form submission

  useEffect(() => {
    generateToken();
    onMessage(messaging, (payload)=> {
      console.log(payload);
      toast(payload.notification.body);

    });
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(storedProducts);
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsFormVisible(false);
    setIsSubmitted(false); // Reset isSubmitted when changing category
  };

  const handleFormSubmit = (product) => {
    let updatedProducts;
    if (editProduct) {
      updatedProducts = products.map((p) =>
        p.id === editProduct.id ? product : p
      );
      alert("Product edited successfully!"); // Alert message for successful edit
    } else {
      product.id = Date.now();
      updatedProducts = [...products, product];
      alert("Product added successfully!"); // Alert message for successful addition
    }
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setIsFormVisible(false);
    setEditProduct(null);
    setIsSubmitted(true); // Set isSubmitted to true after form submission
  };

  const handleEditClick = (product) => {
    setSelectedCategory("");
    setIsFormVisible(true);
    setEditProduct(product);
  };

  const handleDeleteClick = (id) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const filteredProducts =
    selectedCategory === "Expiring Soon"
      ? products
          .filter((product) => {
            const productExpiryDate = new Date(product.expiryDate);
            return (
              productExpiryDate.getMonth() === currentMonth &&
              productExpiryDate.getFullYear() === currentYear
            );
          })
          .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      : selectedCategory === "Expired"
          ? products
              .filter((product) => {
                const productExpiryDate = new Date(product.expiryDate);
                return productExpiryDate < new Date(); // Filter out expired products
              })
              .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
          : products
              .filter((product) => product.category === selectedCategory)
              .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  const getProductStatus = (expiryDate) => {
    const today = new Date();
    return new Date(expiryDate) < today ? "Expired" : "Not Expired";
  };

  const filteredProductsWithStatus = filteredProducts.map((product) => ({
    ...product,
    status: getProductStatus(product.expiryDate),
  }));

  return (
    <div className="App">
        <Toaster position="top-right" />
      <header>
        <h1 className="gradient-text">Expiry Expert</h1>
      </header>
      <Navbar
        categories={categories}
        onCategoryClick={handleCategoryClick}
      />

      <button className="floating-button" onClick={() => handleEditClick(null)}>
        +
      </button>
      <div className="forms">
        {isFormVisible && (
          <ProductForm
            categories={categories.filter((cat) => cat !== "Expiring Soon")}
            onSubmit={handleFormSubmit}
            editProduct={editProduct}
          />
        )}
      </div>

      {isSubmitted && (
        <img src={logo} alt="Submitted successfully" className="submitted-image" />
      )}

      {selectedCategory && (
        <div>
          <h2>{selectedCategory}</h2>
          {filteredProductsWithStatus.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Expiry Date</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductsWithStatus.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.expiryDate}</td>
                    <td>{product.category}</td>
                    <td>{product.status}</td>
                    <td>
                      <button
                        className="edit"
                        onClick={() => handleEditClick(product)}
                      ></button>
                      <button
                        className="delete"
                        onClick={() => handleDeleteClick(product.id)}
                      ></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No products available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
