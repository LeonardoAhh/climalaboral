// Script de Importación de Empleados a Firebase
// EJECUTAR SOLO UNA VEZ

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { readFileSync, writeFileSync } from 'fs';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCM1r2Rg4ObfReMgOHKLePuJVfD-xPa2Eg",
  authDomain: "climalaboral-81365.firebaseapp.com",
  projectId: "climalaboral-81365",
  storageBucket: "climalaboral-81365.firebasestorage.app",
  messagingSenderId: "666665814040",
  appId: "1:666665814040:web:d75899c619289516c6db6d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Función para validar CURP
function validarCURP(curp) {
  if (!curp || typeof curp !== 'string') return false;
  return curp.length === 18;
}

// Función para importar empleados en lotes
async function importarEmpleados() {
  try {
    // Leer archivo JSON
    console.log('📖 Leyendo archivo empleados.json...');
    const data = readFileSync('./empleados.json', 'utf8');
    const empleados = JSON.parse(data);
    
    console.log(`✅ Encontrados ${empleados.length} empleados`);
    
    const log = {
      fecha: new Date().toISOString(),
      total: empleados.length,
      exitosos: 0,
      fallidos: 0,
      errores: []
    };

    // Procesar en lotes de 50
    const BATCH_SIZE = 50;
    
    for (let i = 0; i < empleados.length; i += BATCH_SIZE) {
      const lote = empleados.slice(i, i + BATCH_SIZE);
      console.log(`\n📦 Procesando lote ${Math.floor(i/BATCH_SIZE) + 1} (${i + 1} - ${Math.min(i + BATCH_SIZE, empleados.length)} de ${empleados.length})`);
      
      const batch = writeBatch(db);
      
      for (const empleado of lote) {
        try {
          // Validar datos
          if (!empleado.ID || !empleado.Nombre || !empleado.CURP) {
            throw new Error(`Datos incompletos: ${JSON.stringify(empleado)}`);
          }
          
          if (!validarCURP(empleado.CURP)) {
            throw new Error(`CURP inválida: ${empleado.CURP}`);
          }

          // Crear email único basado en ID
          const email = `employee${empleado.ID}@climalaboral.local`;
          
          // Preparar documento de empleado
          const empleadoDoc = {
            employeeId: empleado.ID.toString(),
            name: empleado.Nombre.trim(),
            curp: empleado.CURP.toUpperCase().trim(),
            department: empleado.Departamento ? empleado.Departamento.trim() : 'SIN DEPARTAMENTO',
            area: empleado.Área ? empleado.Área.trim() : 'SIN ÁREA',
            email: email,
            surveyCompleted: false,
            completedAt: null,
            createdAt: new Date(),
            createdBy: 'importScript'
          };

          // Usar employeeId como ID del documento para búsqueda rápida
          const docRef = doc(db, 'employees', `emp_${empleado.ID}`);
          batch.set(docRef, empleadoDoc);
          
          log.exitosos++;
          console.log(`  ✓ ${empleado.ID} - ${empleado.Nombre}`);
          
        } catch (error) {
          log.fallidos++;
          log.errores.push({
            empleado: empleado,
            error: error.message
          });
          console.error(`  ✗ Error en ${empleado.ID}: ${error.message}`);
        }
      }
      
      // Commit del lote
      try {
        await batch.commit();
        console.log(`✅ Lote guardado en Firestore`);
        
        // Esperar 1 segundo entre lotes para no saturar
        if (i + BATCH_SIZE < empleados.length) {
          console.log('⏳ Esperando 1 segundo...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Error al guardar lote: ${error.message}`);
        log.errores.push({
          lote: `${i}-${i + BATCH_SIZE}`,
          error: error.message
        });
      }
    }

    // Guardar log
    console.log('\n📝 Guardando log de importación...');
    writeFileSync('./import-log.txt', JSON.stringify(log, null, 2));
    
    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE IMPORTACIÓN');
    console.log('='.repeat(50));
    console.log(`Total empleados: ${log.total}`);
    console.log(`✅ Exitosos: ${log.exitosos}`);
    console.log(`❌ Fallidos: ${log.fallidos}`);
    console.log(`📄 Log guardado en: import-log.txt`);
    console.log('='.repeat(50));
    
    if (log.fallidos > 0) {
      console.log('\n⚠️  Revisa import-log.txt para ver los errores');
    }
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
  }
}

// Ejecutar importación
console.log('🚀 Iniciando importación de empleados...\n');
importarEmpleados()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
