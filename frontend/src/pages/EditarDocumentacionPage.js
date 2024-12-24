import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditarDocumentacionPage.css";
import TopBar from "./TopBar"; // Importa TopBar

const EditarDocumentacionPage = () => {
  const [documentos, setDocumentos] = useState([]); // Lista de documentos
  const [nombre, setNombre] = useState(""); // Nombre del documento
  const [archivo, setArchivo] = useState(null); // Archivo a subir
  const [user, setUser] = useState(null); // Usuario autenticado

  // Obtener datos del usuario autenticado
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error al cargar los datos del usuario autenticado:", error);
      }
    };

    fetchUserData();
  }, []);

  // Obtener documentos existentes
  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/documentos");
        setDocumentos(response.data);
      } catch (error) {
        console.error("Error al obtener documentos:", error);
      }
    };
    fetchDocumentos();
  }, []);

  // Subir un nuevo documento
  const handleSubirDocumento = async () => {
    if (!nombre || !archivo) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("archivo", archivo);

    try {
      await axios.post("http://localhost:5000/api/documentos", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Documento subido exitosamente.");
      window.location.reload(); // Recargar la página
    } catch (error) {
      console.error("Error al subir documento:", error);
      alert("Error al subir el documento.");
    }
  };

  // Eliminar un documento
  const handleEliminarDocumento = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/documentos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Documento eliminado exitosamente.");
      setDocumentos(documentos.filter((doc) => doc._id !== id));
    } catch (error) {
      console.error("Error al eliminar documento:", error);
      alert("Error al eliminar el documento.");
    }
  };

  if (!user) return null; // Si no hay usuario autenticado, no renderizar nada

  return (
    <div className="editar-documentacion-container">
      <TopBar userName={user.name} role={user.role} />
      <h2>Gestión de Documentación</h2>

      {/* Formulario para subir un nuevo documento */}
      <div className="subir-documento">
        <h3>Subir Nuevo Documento</h3>
        <input
          type="text"
          placeholder="Nombre del documento"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input type="file" onChange={(e) => setArchivo(e.target.files[0])} />
        <button onClick={handleSubirDocumento}>Subir Documento</button>
      </div>

      {/* Lista de documentos existentes */}
      <div className="lista-documentos">
        <h3>Documentos Existentes</h3>
        <ul>
          {documentos.map((doc) => (
            <li key={doc._id}>
              <a
                href={`http://localhost:5000${doc.archivoUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {doc.nombre}
              </a>
              <button onClick={() => handleEliminarDocumento(doc._id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EditarDocumentacionPage;
