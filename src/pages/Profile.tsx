import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { Profile } from '../types';

import BadgeCard from '../components/BadgeCard';
import UserForm from '../components/UserForm';

export default function Profile() {
  const { user, profile, roles, faculties, careers, loading, refetchProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.avatar_url) {
      // Add a timestamp to the URL to bypass browser cache
      const { data } = supabase.storage.from('avatars').getPublicUrl(`${profile.avatar_url}?t=${new Date().getTime()}`);
      setAvatarUrl(data.publicUrl);
    } else {
      setAvatarUrl(null);
    }
  }, [profile]);

  const handleSave = async (updatedData: Partial<Profile>, avatarFile?: File) => {
    if (!profile || !user) return;
    setFormLoading(true);

    try {
        let avatar_url = profile.avatar_url;

        if (avatarFile) {
            // The new, simplified file path is just the user's ID.
            const filePath = `${user.id}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true });

            if (uploadError) throw uploadError;
            
            avatar_url = filePath; // Store the path, which is just the user ID
        }

        const dataToUpdate = {
            ...updatedData,
            avatar_url,
            actualizado_en: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
            .from('perfiles')
            .update(dataToUpdate)
            .eq('id', profile.id);

        if (updateError) throw updateError;

        toast.success('Perfil actualizado exitosamente.');
        refetchProfile();
        setIsEditing(false);

    } catch (error: any) {
        toast.error('Error al actualizar el perfil: ' + error.message);
    } finally {
        setFormLoading(false);
    }
  };

  if (loading && !profile) {
    return <div>Cargando perfil...</div>;
  }

  if (!profile) {
    return <div>No se pudo cargar el perfil.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Mi Perfil</h2>
            {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn-secondary">
                    Editar Perfil
                </button>
            )}
        </div>

        {isEditing ? (
          <UserForm 
            profile={profile}
            roles={roles}
            faculties={faculties}
            careers={careers}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            loading={formLoading}
          />
        ) : (
            <div className="flex items-start space-x-6">
                <img src={avatarUrl || '/placeholder.svg'} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                <div className="space-y-3">
                    <p><strong>Nombres:</strong> {profile.nombres}</p>
                    <p><strong>Apellidos:</strong> {profile.apellidos}</p>
                    <p><strong>Correo:</strong> {user?.email}</p>
                    <p><strong>Rol:</strong> <span className="capitalize bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">{profile.roles_usuarios?.nombre || 'No asignado'}</span></p>
                    <p><strong>Facultad:</strong> {profile.facultades?.nombre || 'No asignada'}</p>
                    <p><strong>Carrera:</strong> {profile.carreras?.nombre || 'No asignada'}</p>
                </div>
            </div>
        )}
      </div>
      <div className="md:col-span-1">
        <BadgeCard />
      </div>
    </div>
  );
}