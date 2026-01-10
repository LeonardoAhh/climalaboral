@echo off
REM Script para iniciar el servidor de desarrollo
REM Agrega Node.js al PATH temporalmente

SET PATH=%~dp0nodejs;%PATH%

echo Iniciando servidor de desarrollo...
echo.

npm run dev
