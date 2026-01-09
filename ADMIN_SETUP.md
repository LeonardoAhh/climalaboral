# Script de Inicialización del Administrador

Este script te ayudará a configurar el usuario administrador en Firebase.

## Pasos para Crear el Administrador

### Opción 1: Usando Firebase Console (Recomendado)

1. **Ir a Firebase Console**
   - Abre https://console.firebase.google.com/
   - Selecciona el proyecto `climalaboral-81365`

2. **Crear el Usuario en Authentication**
   - Click en "Authentication" en el menú lateral
   - Click en la pestaña "Users"
   - Click en "Add user"
   - Ingresa:
     - Email: `rechumanosqro@vinoplastic.com`
     - Password: `rec2026*`
   - Click en "Add user"
   - **IMPORTANTE:** Copia el UID que aparece (ejemplo: `abc123xyz456`)

3. **Agregar el Usuario a la Colección de Admins**
   - Click en "Firestore Database" en el menú lateral
   - Click en "Start collection"
   - Collection ID: `admins`
   - Document ID: Pega el UID que copiaste
   - Click en "Add field":
     - Field: `role`
     - Type: `string`
     - Value: `admin`
   - Click en "Add field" nuevamente:
     - Field: `email`
     - Type: `string`
     - Value: `rechumanosqro@vinoplastic.com`
   - Click en "Save"

4. **Verificar la Configuración**
   - Deberías ver el documento en la colección `admins`
   - El documento debe tener el UID como ID
   - Debe tener los campos `role: "admin"` y `email: "rechumanosqro@vinoplastic.com"`

### Opción 2: Usando Firebase CLI (Avanzado)

Si prefieres usar la línea de comandos, puedes usar este script:

```javascript
// scripts/createAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Descarga esto de Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function createAdmin() {
  try {
    // Crear usuario
    const userRecord = await auth.createUser({
      email: 'rechumanosqro@vinoplastic.com',
      password: 'rec2026*',
    });

    console.log('Usuario creado:', userRecord.uid);

    // Agregar a colección de admins
    await db.collection('admins').doc(userRecord.uid).set({
      role: 'admin',
      email: 'rechumanosqro@vinoplastic.com',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Administrador configurado correctamente');
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin();
```

Para ejecutar:
```bash
npm install firebase-admin
node scripts/createAdmin.js
```

## Verificación

Para verificar que el administrador fue creado correctamente:

1. Ve a la aplicación: http://localhost:5173
2. Click en "Soy Administrador"
3. Ingresa:
   - Email: `rechumanosqro@vinoplastic.com`
   - Password: `rec2026*`
4. Si todo está correcto, deberías ver el dashboard de administrador

## Troubleshooting

### Error: "No tienes permisos de administrador"
- Verifica que el documento en `admins` tenga el UID correcto
- Asegúrate de que el campo `role` sea exactamente `"admin"`

### Error: "Email o contraseña incorrectos"
- Verifica que el usuario exista en Authentication
- Prueba resetear la contraseña desde Firebase Console

### Error: "auth/user-not-found"
- El usuario no existe en Authentication
- Crea el usuario siguiendo los pasos de "Opción 1"

## Agregar Más Administradores

Para agregar más administradores en el futuro:

1. Crea el usuario en Authentication
2. Copia el UID
3. Agrega un documento en `admins` con ese UID
4. Agrega el campo `role: "admin"`
