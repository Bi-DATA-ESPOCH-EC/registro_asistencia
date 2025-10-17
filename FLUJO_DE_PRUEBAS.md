
# Flujo de Pruebas para la Aplicación de Asistencia

Este documento describe los pasos para probar todas las funcionalidades clave de la aplicación.

## 1. Configuración Inicial

1.  Asegúrate de tener un archivo `.env` en la raíz del proyecto con las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
2.  Abre una terminal en la raíz del proyecto.
3.  Ejecuta `npm install` para instalar todas las dependencias.
4.  Ejecuta `npm run dev` para iniciar la aplicación.
5.  Abre tu navegador en `http://localhost:5173`.

---

## 2. Flujo de Autenticación (Magic Link)

1.  **Ir a la página de Login:** La aplicación debería iniciar en la página de autenticación (`/auth`).
2.  **Ingresar Email:** Escribe una dirección de correo electrónico válida en el campo de texto.
3.  **Recibir Email:** Revisa la bandeja de entrada del correo que ingresaste. Deberías recibir un "Magic Link" de Supabase.
4.  **Hacer Clic en el Link:** Abre el enlace en tu navegador.
5.  **Verificar Redirección:**
    *   Si el usuario tiene el rol `admin` en la tabla `profiles` de Supabase, deberías ser redirigido al panel de administración (`/dashboard`).
    *   Si el usuario tiene el rol `user`, deberías ser redirigido a tu perfil personal (`/me`).

---

## 3. Flujo de Usuario Estándar

*Accede con un usuario que tenga el rol `user`.*

1.  **Página de Perfil (`/me`):**
    *   Verifica que se muestre correctamente tu información: Nombre, correo, rol, facultad y carrera.
    *   **Prueba de Gafete:** Haz clic en "Descargar Gafete". Se debería generar y descargar un archivo PDF con tu información y un código QR.
2.  **Historial de Asistencia (`/me/attendance`):
    *   Navega a esta página (debería haber un enlace en tu perfil).
    *   Verifica que se muestre una tabla con tus asistencias registradas.
    *   Prueba los filtros por rango de fechas y por sesión (A o B) para asegurarte de que la tabla se actualiza correctamente.

---

## 4. Flujo de Administrador

*Accede con un usuario que tenga el rol `admin`.*

1.  **Panel Principal (`/dashboard`):
    *   Verifica que se muestren las tarjetas con estadísticas (KPIs).
    *   Asegúrate de que los enlaces a "Gestionar Usuarios" (`/users`) y "Ver Asistencias" (`/attendance`) funcionen.

2.  **Gestión de Usuarios (`/users`):
    *   **Crear Usuario:**
        1.  Haz clic en "Crear Usuario". Debería abrirse un formulario modal.
        2.  Llena todos los campos y haz clic en "Guardar".
        3.  Verifica que aparezca una notificación de éxito y que el nuevo usuario se muestre en la tabla.
    *   **Editar Usuario:**
        1.  Haz clic en el icono de editar (lápiz) de un usuario existente.
        2.  El formulario modal debería abrirse con la información de ese usuario.
        3.  Modifica algún campo y haz clic en "Guardar".
        4.  Verifica que la información del usuario se actualice en la tabla.
    *   **Eliminar Usuario:**
        1.  Haz clic en el icono de eliminar (basura) de un usuario.
        2.  Debería aparecer una ventana de confirmación.
        3.  Acepta la confirmación. El usuario debería desaparecer de la tabla.

3.  **Registros de Asistencia (`/attendance`):
    *   Verifica que se muestre una tabla con todas las asistencias de todos los usuarios.
    *   Prueba los diferentes filtros: por fecha, sesión, rol, facultad, etc. La tabla debería actualizarse con cada filtro.
    *   **Exportar CSV:** Haz clic en "Exportar CSV". Se debería descargar un archivo `.csv` con los datos de la tabla filtrada.

4.  **Escáner QR (`/scanner`):
    *   **Preparación:**
        1.  Ve a la tabla `profiles` en tu panel de Supabase y copia el `id` (UUID) de un usuario de prueba.
        2.  Usa una herramienta online para generar un código QR. El contenido del QR debe ser `USER:{uuid}`, reemplazando `{uuid}` con el ID que copiaste. (Ej: `USER:123e4567-e89b-12d3-a456-426614174000`).
    *   **Prueba de Escaneo:**
        1.  Navega a `/scanner`. La cámara de tu dispositivo debería activarse.
        2.  Escanea el código QR que generaste.
        3.  Debería aparecer una notificación de éxito indicando que la asistencia fue registrada.
        4.  Ve a la tabla `asistencias` en Supabase y confirma que se ha creado un nuevo registro.
    *   **Prueba de Duplicados:**
        1.  Dentro de la misma franja horaria (ej. Sesión A: 08:00-13:00), intenta escanear el mismo código QR de nuevo.
        2.  Debería aparecer una notificación de error o advertencia indicando que la asistencia ya fue registrada.

---

## 5. Cierre de Sesión

1.  Busca y haz clic en el botón de "Cerrar Sesión" (Logout).
2.  Verifica que eres redirigido a la página de autenticación (`/auth`).

