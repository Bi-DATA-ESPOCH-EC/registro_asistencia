import { useState, useEffect, useMemo } from 'react';
import type { Profile, Role, Faculty, Career } from '../types';
import { supabase } from '../lib/supabaseClient';

interface UserFormProps {
  profile: Profile | null;
  roles: Role[];
  faculties: Faculty[];
  careers: Career[];
  onSave: (data: Partial<Profile>, avatarFile?: File) => void;
  onCancel: () => void;
  loading: boolean;
}

const UserForm = ({ profile, roles, faculties, careers, onSave, onCancel, loading }: UserFormProps) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo_institucional: '',
    id_rol: '',
    id_facultad: '',
    id_carrera: '',
  });
  const [avatarFile, setAvatarFile] = useState<File>();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        nombres: profile.nombres || '',
        apellidos: profile.apellidos || '',
        correo_institucional: profile.correo_institucional || '',
        id_rol: profile.id_rol || '',
        id_facultad: profile.id_facultad || '',
        id_carrera: profile.id_carrera || '',
      });

      if (profile.avatar_url) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(`${profile.avatar_url}?t=${new Date().getTime()}`);
        setAvatarPreview(data.publicUrl);
      } else {
        setAvatarPreview(null);
      }
    }
  }, [profile]);

  const filteredCareers = useMemo(() => {
    if (!formData.id_facultad) return [];
    return careers.filter(c => c.id_facultad === formData.id_facultad);
  }, [formData.id_facultad, careers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      id_carrera: '' // Reset career when faculty changes
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setAvatarFile(file);
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: profile?.id }, avatarFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-4">
            <img src={avatarPreview || '/placeholder.svg'} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
            <div>
                <label className="label">Foto de Perfil</label>
                <input type="file" onChange={handleAvatarChange} accept="image/png, image/jpeg" className="text-sm" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="label">Nombres</label>
                <input name="nombres" value={formData.nombres} onChange={handleChange} className="input" required />
            </div>
            <div>
                <label className="label">Apellidos</label>
                <input name="apellidos" value={formData.apellidos} onChange={handleChange} className="input" required />
            </div>
        </div>
        <div>
            <label className="label">Correo Institucional</label>
            <input type="email" name="correo_institucional" value={formData.correo_institucional} onChange={handleChange} className="input" required />
        </div>
        <div>
            <label className="label">Rol</label>
            <select name="id_rol" value={formData.id_rol || ''} onChange={handleChange} className="input" required>
                <option value="" disabled>Selecciona un rol</option>
                {roles.map(rol => <option key={rol.id} value={rol.id}>{rol.nombre}</option>)}
            </select>
        </div>
        <div>
            <label className="label">Facultad</label>
            <select name="id_facultad" value={formData.id_facultad || ''} onChange={handleFacultyChange} className="input" required>
                <option value="" disabled>Selecciona una facultad</option>
                {faculties.map(fac => <option key={fac.id} value={fac.id}>{fac.nombre}</option>)}
            </select>
        </div>
        <div>
            <label className="label">Carrera</label>
            <select name="id_carrera" value={formData.id_carrera || ''} onChange={handleChange} className="input" required disabled={!formData.id_facultad}>
                <option value="" disabled>Selecciona una carrera</option>
                {filteredCareers.map(car => <option key={car.id} value={car.id}>{car.nombre}</option>)}
            </select>
        </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;