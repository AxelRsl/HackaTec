# Guía para contribuir al proyecto HackaTec

Esta guía explica cómo trabajar con el repositorio del proyecto usando Git desde la terminal.

## Configuración inicial (solo la primera vez)

Si es la primera vez que vas a trabajar con el repositorio, sigue estos pasos:

1. Clona el repositorio:

```bash
git clone https://github.com/AxelRsl/HackaTec.git
cd HackaTec
```

2. Configura tu información de usuario:

```bash
git config user.name "Tu Nombre"
git config user.email "tu.email@example.com"
```

## Flujo de trabajo diario

### 1. Actualizar tu repositorio local

Siempre que comiences a trabajar, lo primero es asegurarte de tener la última versión del código:

```bash
# Asegúrate de estar en la rama principal
git checkout master

# Descarga los últimos cambios
git pull origin master
```

### 2. Crear una rama para tus cambios (recomendado)

Es una buena práctica trabajar en una rama separada para cada nueva funcionalidad o corrección:

```bash
# Crea una nueva rama
git checkout -b nombre-de-tu-rama

# Ejemplo:
git checkout -b mejora-deteccion-señas
```

### 3. Realizar cambios y guardarlos

Después de modificar archivos:

```bash
# Ver qué archivos has modificado
git status

# Añadir los archivos modificados 
git add nombre-del-archivo

# Para añadir todos los archivos modificados
git add .

# Crear un commit con un mensaje descriptivo
git commit -m "Descripción clara de los cambios realizados"
```

### 4. Subir tus cambios al repositorio remoto

```bash
# Si estás trabajando en la rama master
git push origin master

# Si estás trabajando en otra rama
git push origin nombre-de-tu-rama
```

### 5. Integrar cambios de otros compañeros

Si tus compañeros han realizado cambios mientras trabajabas:

```bash
# Guardar tus cambios actuales primero
git add .
git commit -m "Guardar mis cambios actuales"

# Actualizar desde el repositorio remoto
git pull origin master

# Resolver conflictos si aparecen
# Abre los archivos con conflictos y edítalos manualmente
```

## Resolución de conflictos

Cuando Git muestra un conflicto, los archivos afectados contendrán marcadores que muestran las diferencias:

```
<<<<<<< HEAD
Tus cambios locales
=======
Cambios del repositorio remoto
>>>>>>> branch-name
```

1. Edita el archivo para mantener el código correcto
2. Elimina los marcadores de conflicto (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Guarda el archivo
4. Añade el archivo resuelto: `git add archivo-con-conflicto`
5. Completa el merge: `git commit -m "Resuelto conflicto en archivo-x"`

## Comandos útiles

### Ver historial de cambios
```bash
git log
git log --oneline --graph  # Versión simplificada con gráfico
```

### Deshacer cambios
```bash
# Deshacer cambios en un archivo no añadido (git add) todavía
git checkout -- nombre-del-archivo

# Deshacer el último commit pero mantener los cambios
git reset --soft HEAD~1

# Deshacer el último commit y eliminar los cambios (¡cuidado!)
git reset --hard HEAD~1
```

### Etiquetar versiones
```bash
# Crear una etiqueta para una versión
git tag v1.0.0

# Subir las etiquetas al repositorio remoto
git push origin --tags
```

## Recomendaciones

1. **Haz commits frecuentes** con mensajes descriptivos
2. **Actualiza tu repositorio local** con frecuencia usando `git pull`
3. **No incluyas archivos generados** como `node_modules`, usa el `.gitignore`
4. **Describe bien tus commits** para que otros entiendan tus cambios
5. **Comunica cambios importantes** al resto del equipo

Si tienes cualquier duda sobre Git, no dudes en consultar la [documentación oficial](https://git-scm.com/doc) o preguntar a tus compañeros de equipo.
