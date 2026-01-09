# Deployment en Vercel

Esta guía te ayudará a desplegar la aplicación en Vercel desde GitHub.

## 📋 Requisitos Previos

- Cuenta de GitHub
- Cuenta de Vercel (gratis)
- Proyecto Firebase configurado

## 🚀 Paso 1: Subir a GitHub

### 1.1 Inicializar Git (si no está inicializado)

```bash
cd C:\Users\Capacitacion - QRO\.gemini\antigravity\scratch\clima-laboral-pwa
git init
git add .
git commit -m "Initial commit: Climate Survey PWA"
```

### 1.2 Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Click en "New repository"
3. Nombre: `clima-laboral-pwa`
4. Descripción: "Plataforma PWA para encuestas de clima laboral"
5. Privado o Público (según preferencia)
6. **NO** marques "Initialize with README"
7. Click en "Create repository"

### 1.3 Conectar y Subir

```bash
git remote add origin https://github.com/TU_USUARIO/clima-laboral-pwa.git
git branch -M main
git push -u origin main
```

## 🎯 Paso 2: Configurar Vercel

### 2.1 Conectar GitHub con Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click en "Sign Up" o "Login"
3. Selecciona "Continue with GitHub"
4. Autoriza Vercel

### 2.2 Importar Proyecto

1. En el dashboard de Vercel, click en "Add New..." → "Project"
2. Busca `clima-laboral-pwa` en la lista
3. Click en "Import"

### 2.3 Configurar Build Settings

Vercel detectará automáticamente Vite. Verifica que:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.4 Configurar Variables de Entorno

**IMPORTANTE**: No incluyas las credenciales de Firebase directamente en el código en producción.

En la sección "Environment Variables", NO necesitas agregar nada porque las credenciales de Firebase ya están en el código. Sin embargo, para mayor seguridad en producción, deberías:

1. Crear un archivo `.env` (no incluido en Git)
2. Mover las credenciales a variables de entorno
3. Configurarlas en Vercel

**Para este proyecto, las credenciales ya están en el código, así que puedes continuar directamente.**

### 2.5 Deploy

1. Click en "Deploy"
2. Espera a que termine el build (1-3 minutos)
3. Una vez completado, obtendrás una URL como: `https://clima-laboral-pwa.vercel.app`

## 🔧 Paso 3: Configurar Firebase para Vercel

### 3.1 Agregar Dominio a Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `climalaboral-81365`
3. Ve a Authentication → Settings → Authorized domains
4. Agrega tu dominio de Vercel: `clima-laboral-pwa.vercel.app`

### 3.2 Actualizar Reglas de CORS (si es necesario)

Si tienes problemas de CORS, actualiza las reglas en Firebase Console.

## ✅ Paso 4: Verificar Deployment

1. Visita tu URL de Vercel
2. Prueba el login de empleado
3. Prueba el login de administrador
4. Verifica que la PWA sea instalable

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Vercel automáticamente detectará el push y desplegará la nueva versión.

## 🌐 Dominios Personalizados

Si quieres usar un dominio personalizado:

1. Ve a tu proyecto en Vercel
2. Click en "Settings" → "Domains"
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar DNS

## 📱 PWA en Production

La aplicación será instalable automáticamente desde el dominio de Vercel:

- **Android**: Chrome mostrará el banner "Add to Home Screen"
- **iOS**: Safari → Compartir → "Agregar a pantalla de inicio"
- **Desktop**: Chrome mostrará el ícono de instalación en la barra de direcciones

## 🔒 Seguridad en Producción

### Recomendaciones:

1. **Variables de Entorno**: Mover credenciales de Firebase a variables de entorno
2. **Dominio Autorizado**: Solo permitir tu dominio en Firebase
3. **Reglas de Firestore**: Revisar que las reglas sean restrictivas
4. **HTTPS**: Vercel usa HTTPS por defecto ✓
5. **API Keys**: Las API keys de Firebase son seguras para uso público en frontend

## 🐛 Troubleshooting

### Error: "Build Failed"
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Vercel

### Error: "Firebase Auth not working"
- Agrega el dominio de Vercel a authorized domains en Firebase

### Error: "PWA not installing"
- Verifica que el manifest.json sea accesible
- Revisa que los íconos estén en la carpeta correcta

### Error: "Firestore permission denied"
- Verifica que las reglas de Firestore estén publicadas
- Confirma que el usuario admin esté en la colección `admins`

## 📊 Monitoreo

Vercel proporciona:
- **Analytics**: Tráfico y rendimiento
- **Logs**: Errores y debugging
- **Deployments**: Historial de todas las versiones

## 🎉 ¡Listo!

Tu aplicación ahora está en producción y accesible desde cualquier lugar. Los empleados pueden responder la encuesta desde sus móviles, y los administradores pueden ver los resultados en tiempo real.

**URL de producción**: `https://clima-laboral-pwa.vercel.app` (o tu dominio personalizado)

## 📞 Soporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **GitHub Docs**: [docs.github.com](https://docs.github.com)
