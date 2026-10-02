import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const rolePermissions: Record<string, string[]> = {
  blog_manager: ['blog'],
  branch_manager: ['branches', 'communication'],
  content_manager: ['site', 'blog', 'branches'],
  administrator: ['site', 'blog', 'shop', 'communication', 'branches', 'team'],
};

const json = (body: unknown, status = 200, cors: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (request) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const authorization = request.headers.get('Authorization') || '';
    const adminClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const token = authorization.replace('Bearer ', '');
    const { data: { user: caller }, error: callerError } = await adminClient.auth.getUser(token);
    if (callerError || !caller || caller.app_metadata?.admin !== true) {
      return json({ error: 'Accès réservé à l’administrateur principal.' }, 403, cors);
    }
    const body = await request.json();
    if (body.action === 'create') {
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const permissions = rolePermissions[body.role];
      if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !permissions) {
        return json({ error: 'Nom, e-mail, rôle ou mot de passe invalide (8 caractères minimum).' }, 422, cors);
      }
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name: name },
        app_metadata: { role: body.role, permissions, dashboard_user: true },
      });
      if (error) throw error;
      const { error: profileError } = await adminClient.from('dashboard_members').insert({ user_id: data.user.id, name, email, role: body.role, permissions, is_active: true, created_by: caller.id });
      if (profileError) { await adminClient.auth.admin.deleteUser(data.user.id); throw profileError; }
      return json({ success: true }, 200, cors);
    }
    if (body.action === 'toggle') {
      if (!body.userId || body.userId === caller.id) return json({ error: 'Vous ne pouvez pas désactiver votre propre compte.' }, 422, cors);
      const { error } = await adminClient.auth.admin.updateUserById(body.userId, { ban_duration: body.isActive ? 'none' : '876000h' }); if (error) throw error;
      const { error: updateError } = await adminClient.from('dashboard_members').update({ is_active: Boolean(body.isActive), updated_at: new Date().toISOString() }).eq('user_id', body.userId);
      if (updateError) throw updateError;
      return json({ success: true }, 200, cors);
    }
    return json({ error: 'Action inconnue.' }, 400, cors);
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Erreur interne.' }, 400, cors); }
});
