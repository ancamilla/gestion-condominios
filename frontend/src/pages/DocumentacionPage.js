import React, { useEffect, useState } from "react";
import axios from "axios";
import TopBar from "./TopBar";
import "./DocumentacionPage.css";

const DocumentacionPage = () => {
  const [documentos, setDocumentos] = useState([]); // Lista de documentos
  const [archivo, setArchivo] = useState(null); // Archivo a subir
  const [nombre, setNombre] = useState(""); // Nombre del archivo
  const [user, setUser] = useState(null); // Usuario autenticado

  // Obtener datos del usuario autenticado
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
      }
    };

    fetchUser();
  }, []);

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

  if (!user) return null; // No renderizar hasta que se cargue el usuario

  return (
    <div className="documentacion-container">
      <TopBar userName={user.name} role={user.role} />

      <h2>Documentación del Reglamento</h2>
      {user.role === "administrador" && (
        <div className="subir-documento">
          <input
            type="text"
            placeholder="Nombre del documento"
            onChange={(e) => setNombre(e.target.value)}
          />
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
            {user.role === "administrador" && (
              <button onClick={() => handleEliminarDocumento(doc._id)}>Eliminar</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentacionPage;
