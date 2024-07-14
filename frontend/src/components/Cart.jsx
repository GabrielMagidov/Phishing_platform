import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import axios from "axios";
import { PRODUCTS } from "../data";
import "./Cart.css";

const Cart = () => {
  const { cart, removeFromCart, clearCart, checkout } = useCart();

  const totalWithoutDiscount = cart.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    const originalPrice = item.price / ((100 - product.discount) / 100);
    return sum + originalPrice * item.quantity;
  }, 0);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalSavings = totalWithoutDiscount - total;

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    id: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    address: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    id: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const { name, email, address, cardNumber, expirationDate, cvv, id } =
      formData;
    const errors = {};

    if (!name.trim()) errors.name = "Name is required.";
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid.";
    }
    if (!address.trim()) errors.address = "Address is required.";
    if (!cardNumber.trim()) {
      errors.cardNumber = "Card number is required.";
    } else if (!/^\d{16}$/.test(cardNumber)) {
      errors.cardNumber = "Card number must be 16 digits.";
    }
    if (!expirationDate.trim()) {
      errors.expirationDate = "Expiration date is required.";
    } else if (!/^\d{2}\/\d{2}$/.test(expirationDate)) {
      errors.expirationDate = "Expiration date must be in MM/YY format.";
    }
    if (!cvv.trim()) {
      errors.cvv = "CVV is required.";
    } else if (!/^\d{3}$/.test(cvv)) {
      errors.cvv = "CVV must be 3 digits.";
    }
    if (!id.trim()) {
      errors.id = "ID is required.";
    } else if (!/^\d+$/.test(id)) {
      errors.id = "ID must be only digits.";
    }

    setFormErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [formData]);

  const handleCheckoutClick = () => {
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePay = async () => {
    if (!isFormValid) {
      return;
    }

    checkout(formData);

    try {
      const response = await axios.post("http://localhost:5000/api/checkout", {
        ...formData,
        cart,
        total,
        totalSavings,
        totalWithoutDiscount,
      });

      if (response.status === 200) {
        alert(
          `Thank you for your purchase, ${
            formData.name
          }! You saved $${totalSavings.toFixed(
            2
          )}!\nAn email with your purchase details has been sent to ${
            formData.email
          }. It might go to your spam folder.`
        );
        setShowForm(false);
        clearCart();
        setFormData({
          name: "",
          email: "",
          address: "",
          cardNumber: "",
          expirationDate: "",
          cvv: "",
          id: "",
        });
        setFormErrors({
          name: "",
          email: "",
          address: "",
          cardNumber: "",
          expirationDate: "",
          cvv: "",
          id: "",
        });
      }
    } catch (error) {
      console.error("There was an error processing your purchase:", error);
      alert(
        "Sorry, there was an error processing your purchase. Please try again."
      );
    }
  };

  const handleRemoveFromCart = (id) => {
    removeFromCart(id);
    if (cart.length === 1) {
      setShowForm(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setShowForm(false);
  };

  return (
    <section id="cart" className="container">
      <h2>Shopping Cart</h2>
      <ul className="cart-items">
        {cart.map((item) => (
          <li key={item.id}>
            {item.name} - ${item.price.toFixed(2)} x {item.quantity}
            <button onClick={() => handleRemoveFromCart(item.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p>Total without discount: ${totalWithoutDiscount.toFixed(2)}</p>
      <p>Total Savings: ${totalSavings.toFixed(2)}</p>
      <p>Total: ${total.toFixed(2)}</p>
      <div className="button-row">
        <button onClick={handleClearCart}>Clear Cart</button>
        <button onClick={handleCheckoutClick} disabled={cart.length === 0}>
          Checkout
        </button>
      </div>

      {showForm && (
        <div className="checkout-form">
          <h3>Enter Your Information</h3>
          <div className="input-group">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
            />
            {formErrors.name && (
              <p className="validation-message">{formErrors.name}</p>
            )}
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            {formErrors.email && (
              <p className="validation-message">{formErrors.email}</p>
            )}
          </div>
          <div className="input-group">
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />
            {formErrors.address && (
              <p className="validation-message">{formErrors.address}</p>
            )}
          </div>
          <div className="input-group">
            <input
              type="text"
              name="id"
              placeholder="ID"
              value={formData.id}
              onChange={handleChange}
            />
            {formErrors.id && (
              <p className="validation-message">{formErrors.id}</p>
            )}
          </div>
          <h3>Card Information</h3>
          <div className="input-group">
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={formData.cardNumber}
              onChange={handleChange}
            />
            {formErrors.cardNumber && (
              <p className="validation-message">{formErrors.cardNumber}</p>
            )}
          </div>
          <div className="input-group">
            <input
              type="text"
              name="expirationDate"
              placeholder="Expiration Date (MM/YY)"
              value={formData.expirationDate}
              onChange={handleChange}
            />
            {formErrors.expirationDate && (
              <p className="validation-message">{formErrors.expirationDate}</p>
            )}
          </div>
          <div className="input-group">
            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              value={formData.cvv}
              onChange={handleChange}
            />
            {formErrors.cvv && (
              <p className="validation-message">{formErrors.cvv}</p>
            )}
          </div>
          <button onClick={handlePay} disabled={!isFormValid}>
            Pay
          </button>
        </div>
      )}
    </section>
  );
};

export default Cart;
