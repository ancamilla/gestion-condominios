# gestion-condominios
## Instalación y uso
### Backend
Primero hay que tener Node.js instalado en la maquina, se puede descargar desde su sitio oficial:
```
https://nodejs.org/en/
```
Después es necesario descargar los archivos del respositorio (descomprimir si es necesario) y ubicar donde se desee.
Es probable que se necesiten ejecutar estos comando en terminal:
```
Set-ExecutionPolicy Unrestricted -Force  
Set-ExecutionPolicy Unrestricted -Scope Process
```
Posteriormente, tambien mediante terminal, y en la carpeta "backend":
```
cd backend
```
```
npm init -y
```
```
npm install express mongoose cors dotenv
```
```
npm install --save-dev nodemon
```
#### Para verificar instalación 
en la misma terminal (aun dentro de la carpeta backend)
```
npm run dev
```
Detenemos el servidor con ctrl + c.

Si el servidor de desarrollo corre sin problemas entonces podemos seguir con el frontend.

### Frontend
Cambiamos a la carpeta "frontend"
```
cd ..
cd frontend
```

```
npm install axios react-router-dom
```
#### Para verificar instalación 
```
npm start
```
Detenemos el servidor con ctrl + c

Si los dos servidores corren sin problemas se debería ver la aplicacion en http://localhost:3000

---
### Conectar base de datos
Para este proyecto se utilizará una base de datos no relacional como lo es MongoDB, para esto es necesario tener instalado el servidor MongoDB Community junto con MongoDB Compass
```
https://www.mongodb.com/try/download/community
```
```
https://www.mongodb.com/try/download/compass
```
Luego en el archivo .env ubicado en ..gestion-condominios/backend/.env
modifican la unica linea de codigo con el nombre de la base de datos, en este caso mi base de datos se llama "gestion-condominios"
```
MONGO_URI=mongodb://localhost:27017/gestion-condominios
```
Si el nombre de la base de datos en .env no coincide con ninguna en su servidor de MongoDB entonces la aplicación creará una base de datos con el nombre que ustedes coloquen al final de MONGO_URI.
Lo mismo ocurre con las colecciones.

### Testeo API
Ahora insertaremos registros desde la aplicación a la base de datos, para esto iniciamos ambos servidores: vamos las respectivas carpetas y en la terminal ejecutamos
(dentro de la carpeta backend)
```
npm run dev
```
sin cerrar el servidor de backend abrimos otra terminal, vamos a la carpeta de frontend y ejecutamos
```
npm start
```

ahora con ambos servidores corriendo abrimos una herramienta como POSTMAN, creamos una solicitud HTTP POST con la dirección 
```
http://localhost:5000/api/users/register
```
luego en "Body" seleccionan "raw" y en el menu desplegable de a junto seleccionan "JSON" y pegan:
```
{
  "name": "Usuario de Prueba",
  "email": "prueba@correo.com",
  "password": "123456"
}
```
Deberían recibir un mensaje de respuesta, si es exitosos debería ser:
```
{
    "message": "Usuario registrado exitosamente"
}
```

Luego revisan la colección "Users" en su base de datos y verifican si el documento se subió o no.

---

## GitHub Branches, Pull, Push, etc...

Una rama o branch es una línea independiente de desarrollo en el repositorio. Al crear una rama, se está clonando el estado actual del código (en la rama principal o main/master) para trabajar en modificaciones sin afectar directamente el código principal.
Si trabajan en una funcionalidad (Barra de navegación, módulo de pagos, módulo de reclamos, autentificación de usuarios, módulo de arriendo de espacios, módulo de reglamento/documentación, módulos administrador, módulo inteligencia artificial)
por ejemplo, si queremos implementar una barra de navegación (lo podemos hacer en la aplicación de github de escritorio o en terminal, yo lo haré por terminal)
Primero, cambiamos a la rama principal:
```
git checkout main
```
Actualizamos el proyecto:
```
git pull origin main
```
Despues de tener autenticarse y actualizar procedemos a crear la rama o branch en la que trabajaremos (en este caso trabajaremos en la barra de navegacion):
```
git checkout -b barra-navegacion
```
deben recibir el mensaje "Switched to a new branch 'barra-navegacion'"
#### Trabajamos en el codigo
Despues para guardar y subir los cambios al proyecto ejecutamos:
```
git add .
```
El comando git add . prepara todos los cambios realizados dentro del directorio actual para el posterior commit

Despues hacemos el commit y le añadimos una descripción, es importante que esta sea detallada para que llevar un registro ordenado y saber que se ha hecho.
```
git commit -m "Implementación inicial barra de navegación, falta enlazar a funciononen aun no implementadas. [Alejandro]"
```
Finalmente hacemos el push para enviar los datos al proyecto en github:
```
git push origin barra-navegación
```
(Después de "origin" va el nombre de la rama o branch sobre la cual estamos trabajando)

#### Solo suban contenido al repositorio cuando tengan el modulo/funcionalidad o codigo revisado, sin errores y bien implementado.
