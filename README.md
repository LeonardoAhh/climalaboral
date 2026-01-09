# Plataforma de Encuesta de Clima Laboral - PWA

Una aplicación web progresiva (PWA) moderna para realizar encuestas de clima laboral con autenticación de empleados, sistema de una sola respuesta, y dashboard administrativo con KPIs y métricas en tiempo real.

## 🌐 Deployment

### GitHub + Vercel (Recomendado)

**Repositorio listo para GitHub y deployment en Vercel.** El proyecto ya está inicializado con Git.

🚀 **Quick Start**: Ver [QUICKSTART.md](QUICKSTART.md) para instrucciones rápidas.

📖 **Guía Completa**: Ver [DEPLOYMENT.md](DEPLOYMENT.md) para deployment detallado.

**URL de producción**: Una vez desplegado, tu app estará en `https://clima-laboral-pwa.vercel.app`

### Firebase Hosting (Alternativa)

También puedes desplegar en Firebase Hosting:
```bash
npm run build
firebase deploy
```

## 🚀 Características

### Para Empleados
- ✅ Login simple con ID, Nombre y CURP
- ✅ Encuesta de 30 preguntas divididas en 6 categorías
- ✅ Una sola oportunidad de respuesta
- ✅ Interfaz responsiva y fácil de usar
- ✅ Funciona offline (PWA)

### Para Administradores
- 📊 Dashboard con KPIs en tiempo real
- 📈 Gráficas de resultados por categoría
- 📋 Tabla de respuestas individuales
- ✏️ Editor de preguntas de la encuesta
- 💾 Exportación de datos a CSV
- 🔍 Búsqueda y filtrado de respuestas

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Firebase (gratuita)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

## 🛠️ Instalación

### 1. Instalar Node.js

Si no tienes Node.js instalado, descárgalo desde [nodejs.org](https://nodejs.org/)

### 2. Instalar Dependencias

```bash
cd clima-laboral-pwa
npm install
```

### 3. Configurar Firebase

#### 3.1 Habilitar Servicios en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `climalaboral-81365`
3. Habilita **Authentication**:
   - Ve a Authentication → Sign-in method
   - Habilita "Email/Password"
4. Habilita **Firestore Database**:
   - Ve a Firestore Database
   - Crea una base de datos en modo producción
5. Habilita **Hosting** (opcional, para deployment):
   - Ve a Hosting
   - Completa la configuración

#### 3.2 Crear Usuario Administrador

Debes crear manualmente el usuario administrador en Firebase:

1. Ve a **Authentication** en Firebase Console
2. Click en "Add user"
3. Email: `rechumanosqro@vinoplastic.com`
4. Password: `rec2026*`
5. Copia el **UID** del usuario creado
6. Ve a **Firestore Database**
7. Crea una colección llamada `admins`
8. Crea un documento con el **UID** copiado como ID
9. Agrega un campo:
   - Campo: `role`
   - Tipo: `string`
   - Valor: `admin`

#### 3.3 Configurar Reglas de Firestore

1. Ve a Firestore Database → Rules
2. Copia el contenido del archivo `firestore.rules`
3. Pégalo en el editor de reglas
4. Publica las reglas

## 🚀 Desarrollo

### Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para producción

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `dist/`

## 📦 Deployment a Firebase Hosting

### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login a Firebase

```bash
firebase login
```

### 3. Inicializar Firebase (si es necesario)

```bash
firebase init
```

Selecciona:
- Hosting
- Firestore
- Usa el proyecto existente `climalaboral-81365`

### 4. Build y Deploy

```bash
npm run build
firebase deploy
```

Tu aplicación estará disponible en: `https://climalaboral-81365.web.app`

## 📱 Instalar como PWA

### En Móvil (Android/iOS)
1. Abre la aplicación en el navegador
2. Toca el menú del navegador (⋮)
3. Selecciona "Agregar a pantalla de inicio"
4. La app se instalará como una aplicación nativa

### En Desktop (Chrome/Edge)
1. Abre la aplicación en el navegador
2. Busca el ícono de instalación en la barra de direcciones
3. Click en "Instalar"

## 🔐 Credenciales de Acceso

### Administrador
- Email: `rechumanosqro@vinoplastic.com`
- Password: `rec2026*`

### Empleados
- ID: Cualquier número único
- Nombre: Nombre completo del empleado
- CURP: 18 caracteres (se usa como contraseña)

## 📊 Estructura de la Encuesta

La encuesta contiene 30 preguntas divididas en 6 categorías:

1. **Ambiente Laboral** (5 preguntas)
2. **Liderazgo y Supervisión** (5 preguntas)
3. **Comunicación** (5 preguntas)
4. **Desarrollo Profesional** (5 preguntas)
5. **Compensación y Beneficios** (5 preguntas)
6. **Balance Vida-Trabajo** (5 preguntas)

Escala de respuestas: 1 (Muy en desacuerdo) a 5 (Muy de acuerdo)

## ✏️ Editar Preguntas

Los administradores pueden editar las preguntas desde el panel de administración:

1. Inicia sesión como administrador
2. Ve a la pestaña "Editar Preguntas"
3. Modifica las preguntas según sea necesario
4. Guarda los cambios

**Nota:** Los cambios solo afectarán a nuevas encuestas. Las respuestas ya enviadas no se modificarán.

## 📈 Exportar Datos

Desde el dashboard de administrador:

1. Ve a la pestaña "Resumen"
2. Click en "Exportar CSV"
3. Se descargará un archivo con todas las respuestas

El archivo CSV incluye:
- ID y nombre del empleado
- Fecha de respuesta
- Promedio general
- Promedios por categoría

## 🛡️ Seguridad

- Las contraseñas se manejan mediante Firebase Authentication
- Las reglas de Firestore previenen acceso no autorizado
- Los empleados solo pueden responder una vez
- Solo los administradores pueden ver todas las respuestas
- Las respuestas son anónimas en el sentido de que solo se identifica por ID

## 🐛 Solución de Problemas

### Error: "No tienes permisos de administrador"
- Verifica que el usuario esté en la colección `admins` de Firestore
- Asegúrate de que el UID coincida con el del usuario en Authentication

### Error: "Ya completaste la encuesta"
- Cada empleado solo puede responder una vez
- Si necesitas resetear, elimina el documento del empleado en Firestore

### La aplicación no carga
- Verifica que las credenciales de Firebase sean correctas
- Asegúrate de haber habilitado Authentication y Firestore
- Revisa la consola del navegador para errores

## 📞 Soporte

Para problemas o preguntas, contacta al equipo de Recursos Humanos.

## 📄 Licencia

Uso interno de la empresa.
