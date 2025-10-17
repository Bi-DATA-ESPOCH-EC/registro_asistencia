import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import type { Profile } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Users() {
  const { roles, faculties, careers } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('perfiles').select('*, roles_usuarios(nombre)');
    if (error) {
      toast.error('Error al cargar usuarios.');
      console.error(error);
    } else {
      setUsers(data as Profile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user: Profile | null = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
    setFormLoading(false); // Reset loading state on close
  };

    const handleSaveUser = async (formData: any, avatarFile?: File) => {
    setFormLoading(true);
    const { id, ...profileData } = formData;

    try {
      let userId = id;
      console.log('--- Iniciando guardado de usuario ---', { userId, profileData, hasAvatar: !!avatarFile });

      // --- PASO 1: Crear o Actualizar el perfil ---
      if (userId) {
        console.log(`Modo Edición para usuario: ${userId}`);
        const { error: updateError } = await supabase.from('perfiles').update(profileData).eq('id', userId);
        
        if (updateError) {
          console.error('ERROR al actualizar el perfil:', updateError);
          throw updateError;
        }
        console.log('Perfil actualizado con éxito.');

      } else {
        console.log('Modo Creación de nuevo usuario.');
        const password = Math.random().toString(36).slice(-8);
        const body = { email: profileData.correo_institucional, password, ...profileData };
        
        console.log('Invocando función "create-user" con el siguiente cuerpo:', body);
        const { data: newUser, error: functionError } = await supabase.functions.invoke('create-user', { body });

        if (functionError) {
          console.error('ERROR devuelto por la función "create-user":', functionError);
          throw functionError;
        }
        
        userId = newUser.userId;
        console.log(`Usuario creado en backend con ID: ${userId}`);
      }

      // --- PASO 2: Subir el avatar si existe ---
      if (avatarFile && userId) {
        console.log(`Intentando subir avatar para el usuario: ${userId}`);
        const fileExt = avatarFile.name.split('.').pop();
        const newPath = `${userId}.${fileExt}`;
        console.log(`Ruta de almacenamiento del avatar: ${newPath}`);
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(newPath, avatarFile, { upsert: true });

        if (uploadError) {
          console.error('ERROR al subir el avatar a Supabase Storage:', uploadError);
          throw uploadError;
        }
        
        console.log('Avatar subido con éxito. Actualizando perfil con la URL...');
        // --- PASO 3: Actualizar el perfil con la URL del avatar ---
        const { error: avatarUpdateError } = await supabase
          .from('perfiles')
          .update({ avatar_url: newPath })
          .eq('id', userId);
        
        if (avatarUpdateError) {
          console.error('ERROR al actualizar el perfil con la URL del avatar:', avatarUpdateError);
          throw avatarUpdateError;
        }
        console.log('Perfil actualizado con la URL del avatar.');
      }

      toast.success(`Usuario ${id ? 'actualizado' : 'creado'} con éxito.`);
      console.log('--- Proceso de guardado finalizado con éxito ---');
      fetchUsers();
      handleCloseModal();

    } catch (error: any) {
      console.error('### ERROR FINAL EN EL PROCESO DE GUARDADO ###', error);
      // Si es un error de la función, intentamos ver el cuerpo del error
      if (error.context) {
        const errorBody = await error.context.json();
        console.error('CUERPO DEL ERROR DE LA FUNCIÓN:', errorBody);
        toast.error(`Error: ${errorBody.error || error.message}`);
      } else {
        toast.error(`Error al guardar el usuario: ${error.message}`);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });

      if (error) {
        toast.error(`Error al eliminar: ${error.message}`);
      } else {
        toast.success('Usuario eliminado.');
        fetchUsers();
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Crear Usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Head */}
          <thead className="bg-gray-50"><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">Cargando...</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.nombres} {user.apellidos}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.correo_institucional || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.roles_usuarios?.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900"><Edit size={18} /></button>
                    <button onClick={() => handleDeleteUser(user.id!)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                    {/* Download badge functionality can be added here */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={selectedUser ? 'Editar Usuario' : 'Crear Usuario'}
      >
        <UserForm
          profile={selectedUser}
          roles={roles}
          faculties={faculties}
          careers={careers}
          onSave={handleSaveUser}
          onCancel={handleCloseModal}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
}