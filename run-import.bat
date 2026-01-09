@echo off
REM Script para ejecutar la importación de empleados

REM Agregar Node.js al PATH temporalmente
SET PATH=%CD%\nodejs;%PATH%

echo Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: No se pudo encontrar Node.js
    pause
    exit /b 1
)

echo.
echo Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion de dependencias
    pause
    exit /b 1
)

echo.
echo Ejecutando script de importacion...
node scripts/importEmployees.js

echo.
echo Proceso completado. Revisa el archivo import-log.txt para mas detalles.
pause
