import React from "react";
import { useCart } from "../contexts/CartContext";
import { PRODUCTS } from "../data";
import "./ProductList.css";

const ProductList = () => {
  const { addToCart } = useCart();

  const getDiscountedPrice = (price, discount) => {
    return price - (price * discount) / 100;
  };

  return (
    <section id="products" className="container">
      <h2>Products</h2>
      <ul className="product-list">
        {PRODUCTS.map((product) => (
          <li key={product.id} className="product-item">
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
            <h3>{product.name}</h3>
            <p>
              <span className="original-price">
                ${product.price.toFixed(2)}
              </span>{" "}
              <span className="discounted-price">
                $
                {getDiscountedPrice(product.price, product.discount).toFixed(2)}
              </span>
              <span className="discount-percentage">
                {" "}
                ({product.discount}% off)
              </span>
            </p>
            <button
              onClick={() =>
                addToCart({
                  ...product,
                  price: getDiscountedPrice(product.price, product.discount),
                })
              }
            >
              Add to Cart
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProductList;
