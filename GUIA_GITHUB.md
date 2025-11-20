# 🚀 Guía para Subir el Proyecto a GitHub

Esta guía te ayudará a crear un repositorio en GitHub y subir tu proyecto Sistema EPP.

## Paso 1: Crear un Repositorio en GitHub

1. Ve a [GitHub.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** en la esquina superior derecha
3. Selecciona **"New repository"**
4. Completa el formulario:
   - **Repository name**: `sistema-epp` (o el nombre que prefieras)
   - **Description**: "Sistema de gestión de inventario de Equipos de Protección Personal (EPP)"
   - **Visibility**: Elige **Public** o **Private** según prefieras
   - **NO marques** "Add a README file" (ya tenemos uno)
   - **NO marques** "Add .gitignore" (ya tenemos uno)
   - **NO marques** "Choose a license" (puedes agregarlo después)
5. Haz clic en **"Create repository"**

## Paso 2: Inicializar Git en tu Proyecto Local

Abre la terminal en la carpeta de tu proyecto (`E:\Clover\Clover`) y ejecuta:

```bash
# Inicializar el repositorio Git
git init

# Agregar todos los archivos al staging area
git add .

# Hacer el primer commit
git commit -m "Initial commit: Sistema EPP - Gestión de Inventario"
```

## Paso 3: Conectar con el Repositorio de GitHub

Después de crear el repositorio en GitHub, verás una página con instrucciones. Copia la URL de tu repositorio (algo como: `https://github.com/tu-usuario/sistema-epp.git`)

Luego ejecuta en la terminal:

```bash
# Agregar el repositorio remoto (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/sistema-epp.git

# Verificar que se agregó correctamente
git remote -v
```

## Paso 4: Subir el Código a GitHub

```bash
# Cambiar a la rama main (si es necesario)
git branch -M main

# Subir el código a GitHub
git push -u origin main
```

Si te pide credenciales, usa tu usuario y contraseña de GitHub (o un Personal Access Token si tienes autenticación de dos factores habilitada).

## Paso 5: Verificar

Ve a tu repositorio en GitHub y deberías ver todos tus archivos subidos.

## Comandos Útiles para el Futuro

### Hacer cambios y subirlos

```bash
# Ver el estado de los archivos
git status

# Agregar archivos modificados
git add .

# O agregar archivos específicos
git add src/App.tsx

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir cambios a GitHub
git push
```

### Ver el historial de commits

```bash
git log
```

### Actualizar desde GitHub (si trabajas en varias máquinas)

```bash
git pull
```

## Configuración Adicional (Opcional)

### Agregar una Licencia

1. Ve a tu repositorio en GitHub
2. Clic en "Add file" > "Create new file"
3. Nombra el archivo: `LICENSE`
4. GitHub te permitirá elegir un tipo de licencia (recomiendo MIT License)
5. Haz commit del archivo

### Personalizar el README

Puedes editar el `README.md` directamente en GitHub o localmente y luego hacer push.

### Agregar Topics/Tags

En tu repositorio de GitHub, puedes agregar topics como:
- `react`
- `typescript`
- `inventory-management`
- `epp`
- `tailwindcss`

Esto ayuda a que otras personas encuentren tu proyecto.

## Solución de Problemas

### Si olvidaste agregar archivos al .gitignore

Si accidentalmente agregaste `node_modules` o archivos que no deberían estar:

```bash
# Eliminar del staging (pero mantener los archivos locales)
git rm -r --cached node_modules

# Actualizar el .gitignore si es necesario
# Luego hacer commit
git commit -m "Remove node_modules from repository"
git push
```

### Si hay conflictos al hacer pull

```bash
# Obtener los últimos cambios
git pull

# Si hay conflictos, resuélvelos manualmente
# Luego:
git add .
git commit -m "Resolve merge conflicts"
git push
```

### Cambiar la URL del repositorio remoto

```bash
# Ver la URL actual
git remote -v

# Cambiar la URL
git remote set-url origin NUEVA-URL-AQUI

# Verificar el cambio
git remote -v
```

## ¡Listo! 🎉

Tu proyecto ahora está en GitHub y puedes compartirlo con otros o continuar desarrollándolo con control de versiones.

