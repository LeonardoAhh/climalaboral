# 🚀 Quick Start: GitHub + Vercel

## Paso 1: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Repository name: `clima-laboral-pwa`
3. Description: "Plataforma PWA para encuestas de clima laboral"
4. Public o Private (tu elección)
5. **NO marques** "Add a README file"
6. Click **"Create repository"**

## Paso 2: Conectar y Subir

Copia el **UID de tu repositorio** (aparecerá después de crearlo) y ejecuta:

```bash
# Cambiar "TU_USUARIO" por tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/clima-laboral-pwa.git
git branch -M main
git push -u origin main
```

**Ejemplo:**
```bash
git remote add origin https://github.com/vinoplastic/clima-laboral-pwa.git
git branch -M main
git push -u origin main
```

## Paso 3: Deploy en Vercel

### Opción A: Desde la Web (Recomendado)

1. Ve a https://vercel.com
2. Click **"Sign Up"** o **"Login"**
3. Selecciona **"Continue with GitHub"**
4. En el dashboard, click **"Add New..."** → **"Project"**
5. Busca **"clima-laboral-pwa"**
6. Click **"Import"**
7. Click **"Deploy"** (no necesitas cambiar nada)
8. Espera 2-3 minutos ⏳
9. ✅ ¡Listo! Tu app estará en: `https://clima-laboral-pwa.vercel.app`

### Opción B: Desde la Terminal

```bash
npm install -g vercel
vercel login
vercel
```

## Paso 4: Configurar Firebase

1. Ve a https://console.firebase.google.com/
2. Selecciona tu proyecto **"climalaboral-81365"**
3. Ve a **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Agrega: `clima-laboral-pwa.vercel.app` (o tu dominio de Vercel)
6. Click **"Add"**

## Paso 5: Probar

Visita tu URL de Vercel y prueba:
- ✅ Login de empleado
- ✅ Login de administrador
- ✅ Instalación como PWA

## 🎉 ¡Listo!

Tu aplicación está en producción. Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Vercel automáticamente desplegará la nueva versión.

---

**Documentación completa:** Ver [DEPLOYMENT.md](DEPLOYMENT.md)
