import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <p>
        ¿Tienes sugerencias o comentarios? Envíanos un correo a{" "}
        <a href="mailto:sugerencias@condominios.com" className="footer-link">
          sugerencias@condominios.com
        </a>
      </p>
      <p>&copy; {new Date().getFullYear()} Gestión de Condominios. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer;
