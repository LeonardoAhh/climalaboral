# INSTRUCCIONES PARA PUSH A GITHUB

## ⚠️ Ejecuta estos comandos en orden:

### 1. Configurar Git (solo una vez)
```powershell
git config --global user.name "Leonardo"
git config --global user.email "tu-email@ejemplo.com"
```

### 2. Navegar a la carpeta del proyecto
```powershell
cd "C:\Users\Capacitacion - QRO\.gemini\antigravity\scratch\clima-laboral-pwa"
```

### 3. Conectar con GitHub
```powershell
git remote add origin https://github.com/LeonardoAhh/climalaboral.git
```

### 4. Subir a GitHub
```powershell
git push -u origin master
```

**Nota:** El branch se llama `master`, no `main` en este proyecto.

---

## Si da error "remote origin already exists"

```powershell
git remote remove origin
git remote add origin https://github.com/LeonardoAhh/climalaboral.git
git push -u origin master
```

---

## Después del push exitoso

Tu código estará en GitHub y podrás continuar con el deployment en Vercel.

**Siguiente paso:** Ir a https://vercel.com y hacer import del repositorio.
