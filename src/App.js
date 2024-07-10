import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ProductForm from "./components/ProductForm";

import "./App.css";

const App = () => {
  const [categories, setCategories] = useState([
    "Expiring Soon",
    "Food",
    "Medicine",
    "Cosmetics",
    "Others",
  ]);
  const [selectedCategory, setSelectedCategory] = useState("Expiring Soon");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(storedProducts);
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsFormVisible(false);
  };

  const handleAddClick = () => {
    setSelectedCategory("");
    setIsFormVisible(true);
    setEditProduct(null);
  };

  const handleFormSubmit = (product) => {
    let updatedProducts;
    if (editProduct) {
      updatedProducts = products.map((p) =>
        p.id === editProduct.id ? product : p
      );
    } else {
      product.id = Date.now();
      updatedProducts = [...products, product];
    }
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setIsFormVisible(false);
    setEditProduct(null);
  };

  const handleCategoryEdit = (oldCategory, newCategoryName) => {
    setCategories(
      categories.map((cat) => (cat === oldCategory ? newCategoryName : cat))
    );
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
      <header>
        <h1 className="gradient-text">Expiry Expert</h1>
      </header>
      <Navbar
        categories={categories}
        onCategoryClick={handleCategoryClick}
        onCategoryEdit={handleCategoryEdit}
      />

      <button className="floating-button" onClick={handleAddClick}>
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