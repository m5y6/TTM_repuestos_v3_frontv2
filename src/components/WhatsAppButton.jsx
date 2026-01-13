import React from 'react';
import './WhatsAppButton.css';
import whatsappIcon from '/img/WhatsApp.png';

const WhatsAppButton = () => {
  const phoneNumber = '56930587091'; // Reemplaza con tu número de teléfono
  const message = 'Hola, Vengo de su pagina web y tengo algunas dudas con el producto, negocio, cotización, etc.';

  const handleClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="whatsapp-button" onClick={handleClick}>
      <img src={whatsappIcon} alt="WhatsApp" />
    </div>
  );
};

export default WhatsAppButton;
