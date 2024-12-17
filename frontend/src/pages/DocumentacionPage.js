import React, { useEffect, useState } from "react";
import axios from "axios";
import TopBar from "./TopBar";
import "./DocumentacionPage.css";

const DocumentacionPage = ({ role }) => {
  const [documentos, setDocumentos] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [nombre, setNombre] = useState("");

  // Obtener documentos
  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/documentos");
        setDocumentos(response.data);
      } catch (error) {
        console.error("Error al obtener documentos", error);
      }
    };

    fetchDocumentos();
  }, []);

  // Subir documento
  const handleSubirDocumento = async () => {
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("archivo", archivo);

    try {
      await axios.post("http://localhost:5000/api/documentos", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      window.location.reload();
    } catch (error) {
      console.error("Error al subir el documento", error);
    }
  };

  // Eliminar documento
  const handleEliminarDocumento = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/documentos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar documento", error);
    }
  };

  return (
    <div className="documentacion-container">
      <TopBar role={role} />

      <h2>Documentación del Reglamento</h2>
      {role === "administrador" && (
        <div className="subir-documento">
          <input type="text" placeholder="Nombre del documento" onChange={(e) => setNombre(e.target.value)} />
          <input type="file" onChange={(e) => setArchivo(e.target.files[0])} />
          <button onClick={handleSubirDocumento}>Subir Documento</button>
        </div>
      )}

      <ul className="lista-documentos">
        {documentos.map((doc) => (
          <li key={doc._id}>
            <a href={`http://localhost:5000${doc.archivoUrl}`} target="_blank" rel="noopener noreferrer">
              {doc.nombre}
            </a>
            {role === "administrador" && (
              <button onClick={() => handleEliminarDocumento(doc._id)}>Eliminar</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentacionPage;
