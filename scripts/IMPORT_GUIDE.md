# Guía de Importación de Empleados

## ⚠️ IMPORTANTE - LEER ANTES DE EJECUTAR

Este script importará todos los empleados del archivo `empleados.json` a Firebase Firestore.

**EJECUTAR SOLO UNA VEZ** - Los empleados duplicados causarán errores.

## 📋 Requisitos Previos

1. **Node.js instalado** (versión 18+)
2. **Archivo `empleados.json`** en la raíz del proyecto
3. **Firebase configurado** con las credenciales correctas
4. **Conexión a Internet** estable

## 🚀 Pasos para Importar

### 1. Verificar el archivo empleados.json

Asegúrate de que el archivo esté en la raíz del proyecto:
```
clima-laboral-pwa/
├── empleados.json  ← Aquí
├── scripts/
│   └── importEmployees.js
└── ...
```

### 2. Instalar dependencias del script

El script necesita los módulos de ES6. Actualiza `package.json`:

```bash
# Asegúrate de que package.json tenga "type": "module"
```

O renombra el script a `.mjs`:
```bash
node scripts/importEmployees.mjs
```

### 3. Ejecutar el script

```bash
node scripts/importEmployees.js
```

### 4. Monitorear el proceso

El script mostrará:
- ✅ Empleados procesados correctamente
- ❌ Empleados con errores
- 📊 Resumen final
- 📝 Log guardado en `import-log.txt`

## 📊 Qué hace el script

1. **Lee empleados.json**
2. **Valida cada empleado**:
   - ID existe
   - Nombre existe
   - CURP tiene 18 caracteres
3. **Crea documentos en Firestore** en lotes de 50:
   - ID del documento: `emp_{ID}`
   - Datos: ID, Nombre, CURP, Departamento, Área
4. **Genera log** de éxitos y errores

## 📁 Estructura de Datos en Firestore

Cada empleado se guardará así:

```javascript
{
  employeeId: "123",
  name: "JUAN PÉREZ",
  curp: "PEPJ900101HDFRNN01",
  department: "PRODUCCIÓN",
  area: "PRODUCCIÓN 1ER TURNO",
  email: "employee123@climalaboral.local",
  surveyCompleted: false,
  completedAt: null,
  createdAt: Timestamp,
  createdBy: "importScript"
}
```

## 🔍 Verificar Importación

Después de ejecutar:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `climalaboral-81365`
3. Ve a Firestore Database
4. Busca la colección `employees`
5. Deberías ver documentos como `emp_3`, `emp_4`, etc.

## ⚠️ Solución de Problemas

### Error: "Firebase quota exceeded"

**Causa**: Muchas escrituras simultáneas  
**Solución**: El script ya usa lotes de 50 con pausas de 1 segundo

### Error: "CURP inválida"

**Causa**: CURP no tiene 18 caracteres  
**Solución**: Revisa `import-log.txt` para ver cuáles fallaron

### Error: "Permission denied"

**Causa**: Reglas de Firestore muy restrictivas  
**Solución**: Temporalmente permite escrituras (solo para importación):

```javascript
// Firestore Rules - TEMPORAL
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /employees/{employeeId} {
      allow write: if true; // SOLO PARA IMPORTACIÓN
    }
  }
}
```

**¡IMPORTANTE!** Restaura las reglas de seguridad después de importar.

## 📝 Después de la Importación

1. **Revisa import-log.txt** para errores
2. **Verifica en Firebase Console** que los datos estén correctos
3. **Restaura reglas de Firestore** si las modificaste
4. **Elimina empleados.json** del directorio (ya está en .gitignore)
5. **Opcional**: Elimina el script si no lo necesitas más

## 🔐 Seguridad

- ✅ `empleados.json` está en `.gitignore`
- ✅ No se subirá a GitHub
- ✅ CURPs solo en Firestore
- ⚠️ Considera hashear CURPs en producción

## 📞 Soporte

Si tienes problemas:
1. Revisa `import-log.txt`
2. Verifica la consola de Firebase
3. Revisa los logs del script en la terminal
