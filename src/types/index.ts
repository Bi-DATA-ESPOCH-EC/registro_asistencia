export type Profile = {
  id: string; // Corresponds to auth.users.id
  nombres: string;
  apellidos: string;
  correo_institucional: string;
  id_rol: string | null;
  id_facultad: string | null;
  id_carrera: string | null;
  codigo_qr: string | null;
  avatar_url: string | null;
  creado_en: string;
  actualizado_en: string;
  // Joined data from other tables
  roles_usuarios?: Role;
  facultades?: Faculty;
  carreras?: Career;
};

export type Role = {
  id: string;
  nombre: string;
  creado_en: string;
};

export type Faculty = {
  id: string;
  nombre: string;
};

export type Career = {
  id: string;
  id_facultad: string;
  nombre: string;
};