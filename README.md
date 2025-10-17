# Aplicación de Registro de Asistencia con QR

Esta es una aplicación web construida con React (Vite), TypeScript, TailwindCSS y Supabase para gestionar el registro de asistencias de usuarios mediante códigos QR.

## ✨ Características

- **Autenticación Segura**: Inicio de sesión sin contraseña usando Magic Links de Supabase.
- **Roles de Usuario**: Perfiles de `admin` y `user` con distintas vistas y permisos.
- **Panel de Administración**: Gestión de usuarios, visualización de todas las asistencias y KPIs.
- **Portal de Usuario**: Perfil personal, historial de asistencias y descarga de gafete digital.
- **Escáner QR**: Los administradores pueden registrar la asistencia escaneando el QR del gafete del usuario.
- **Gafete en PDF**: Generación de un gafete digital con código QR único para cada usuario.

## 🚀 Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### 1. Configuración del Entorno

Primero, clona el repositorio y navega al directorio del proyecto. Luego, crea un archivo `.env` en la raíz del proyecto. Puedes copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

Ahora, edita el archivo `.env` con tus credenciales de Supabase:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TZ=America/Guayaquil
```

### 2. Instalación de Dependencias

Usa `npm` para instalar todas las dependencias del proyecto:

```bash
npm install
```

### 3. Ejecución del Proyecto

Una vez instaladas las dependencias, puedes iniciar el servidor de desarrollo de Vite:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## 🔧 Configuración de Supabase

Para que la aplicación funcione correctamente, necesitas realizar dos configuraciones importantes en tu panel de Supabase.

### 1. URL de Redirección para Magic Link

La autenticación por Magic Link requiere que especifiques a qué URL pueden ser redirigidos los usuarios después de hacer clic en el enlace.

1.  Ve a **Authentication -> URL Configuration** en tu panel de Supabase.
2.  En la sección **Redirect URLs**, añade las siguientes URLs:
    -   `http://localhost:5173` (para desarrollo local)
    -   La URL de tu dominio de producción (ej. `https://tu-app.com`)

### 2. Función RPC para Registrar Asistencia

El escáner QR utiliza una función de base de datos (RPC) para registrar la asistencia de forma segura y validar duplicados.

1.  Ve a **SQL Editor** en tu panel de Supabase.
2.  Haz clic en **New query**.
3.  Copia y pega el siguiente código SQL y ejecútalo.

```sql
create or replace function public.register_attendance(p_user_id uuid)
returns table (status text, message text)
language plpgsql
as $$
declare
    v_current_hour int;
    v_session char(1);
    v_local_now timestamp;          -- hora local GYE sin zona
    v_today_start timestamptz;      -- límites del día (convertidos a UTC)
    v_today_end   timestamptz;
    v_user_exists boolean;
    v_already_registered boolean;
    v_user_name text;
begin
    -- 1) Obtener la hora local de Guayaquil sin usar SET TIME ZONE
    v_local_now := (now() at time zone 'America/Guayaquil');
    v_current_hour := extract(hour from v_local_now);

    -- 2) Determinar sesión (ajusta rangos si quieres)
    if v_current_hour >= 8 and v_current_hour < 13 then
        v_session := 'A';
    elsif v_current_hour >= 15 and v_current_hour < 18 then
        v_session := 'B';
    else
        return query select 'error', 'Fuera del horario de registro de asistencia.';
        return;
    end if;

    -- 3) Verificar que el usuario exista en perfiles
    select exists(select 1 from public.perfiles where id = p_user_id)
    into v_user_exists;

    if not v_user_exists then
        return query select 'error', 'El usuario no existe en perfiles.';
        return;
    end if;

    -- 4) Calcular límites del día local (GYE) como timestamptz equivalentes
    v_today_start := (date_trunc('day', v_local_now) at time zone 'America/Guayaquil');
    v_today_end   := ((date_trunc('day', v_local_now) + interval '1 day') at time zone 'America/Guayaquil');

    -- 5) Validar duplicado por usuario + sesión + día
    select exists(
        select 1
        from public.asistencias a
        where a.id_usuario   = p_user_id
          and a.sesion_codigo = v_session
          and a.escaneado_en >= v_today_start
          and a.escaneado_en <  v_today_end
    ) into v_already_registered;

    if v_already_registered then
        select coalesce(nombres,'') || case when apellidos is not null then ' '||apellidos else '' end
        into v_user_name
        from public.perfiles
        where id = p_user_id;

        return query select 'error', 'Asistencia ya registrada para ' || v_user_name || ' en la sesión '|| v_session || '.';
        return;
    end if;

    -- 6) Insertar asistencia
    insert into public.asistencias (
        id_usuario, sesion_codigo, tipo, escaneado_en, dispositivo, creado_por, creado_en
    ) values (
        p_user_id, v_session, 'qr'::tipo_asistencias, now(), null, p_user_id, now()
    );

    -- 7) Mensaje de éxito
    select coalesce(nombres,'') || case when apellidos is not null then ' '||apellidos else '' end
    into v_user_name
    from public.perfiles
    where id = p_user_id;

    return query select 'success', 'Asistencia registrada para ' || v_user_name || ' en la sesión '|| v_session || '.';
end;
$$;

```