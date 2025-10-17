import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, password } = body;
    const profileData = {
      nombres: body.nombres,
      apellidos: body.apellidos,
      correo_institucional: body.correo_institucional,
      id_rol: body.id_rol,
      id_facultad: body.id_facultad,
      id_carrera: body.id_carrera,
      avatar_url: body.avatar_url,
    };

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      throw authError;
    }

    const userId = authData.user.id;
    console.log(`Auth user created. Now updating profile for ID: ${userId}`);

    // The trigger creates a blank profile. We just need to update it.
    const { error: profileError } = await supabaseAdmin
      .from('perfiles')
      .update(profileData)
      .eq('id', userId);

    if (profileError) {
      // If profile update fails, delete the auth user to keep things clean
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.error('Error updating profile after creation:', profileError);
      throw new Error(`Error updating profile: ${profileError.message}`);
    }

    return new Response(JSON.stringify({ message: 'User created successfully', userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // 201 Created is more appropriate
    });
  } catch (error) {
    console.error('Error in create-user function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.cause || null, // Provides more context if available
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});