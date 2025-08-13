
export async function getRoleFromIdToken(user: any): Promise<'developer'|'voter'|null> {
  if (!user) return null;
  const res = await user.getIdTokenResult();
  return (res.claims?.role as any) || null;
}
