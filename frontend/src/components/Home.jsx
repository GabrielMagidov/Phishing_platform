import React, { useState, useEffect } from "react";
import "./Home.css";

const Home = () => {
  const getRandomTime = () => {
    const hours = Math.floor(Math.random() * (8 - 2 + 1)) + 2; // Random hours between 2 and 8
    const minutes = Math.floor(Math.random() * 60); // Random minutes between 0 and 59
    const seconds = Math.floor(Math.random() * 60); // Random seconds between 0 and 59
    return { hours, minutes, seconds };
  };

  const convertToMilliseconds = (time) => {
    return (
      time.hours * 60 * 60 * 1000 +
      time.minutes * 60 * 1000 +
      time.seconds * 1000
    );
  };

  const calculateTimeLeft = (endTime) => {
    const difference = endTime - new Date().getTime();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = {
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return timeLeft;
  };

  const initialTime = getRandomTime();
  const [endTime] = useState(
    new Date().getTime() + convertToMilliseconds(initialTime)
  );
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <div key={interval} className="timer-component">
        <span className="time">{timeLeft[interval]}</span>
        <span className="label">{interval}</span>
      </div>
    );
  });

  return (
    <section id="home">
      <div className="container">
        <h2>Welcome to CDKeeyss</h2>
        <p>Find the best deals on digital game codes.</p>
        <h3>Big Sales and Lots of Discounts on All Games!</h3>
        <p>Hurry up! Offer ends in:</p>
        <div className="countdown-timer">
          {timerComponents.length ? timerComponents : <span>Time's up!</span>}
        </div>
      </div>
    </section>
  );
};

export default Home;
