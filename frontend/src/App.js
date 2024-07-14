import React from "react";
import Header from "./components/Header";
import Home from "./components/Home";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import { CartProvider } from "./contexts/CartContext";
import Contact from "./components/Contact";
import "./App.css";

const App = () => {
  return (
    <CartProvider>
      <Header />
      <Home />
      <ProductList />
      <Cart />
      <Contact />
    </CartProvider>
  );
};

export default App;
