import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/GlobalNotification.css';

const GlobalNotification = () => {
  const { notification, hideNotification } = useContext(AuthContext);

  if (!notification.visible) {
    return null;
  }

  return (
    <div className="notification-overlay">
      <div className="notification-container">
        <button className="notification-close" onClick={hideNotification}>
          &times;
        </button>
        <p>{notification.msg}</p>
      </div>
    </div>
  );
};

export default GlobalNotification;
