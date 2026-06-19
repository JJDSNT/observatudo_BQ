import { useAuth } from '@/hooks/useAuth';
import Loader from "./Loader";

export function LoginButton() {
  const { user, loading, logout, loginWithGoogle } = useAuth();

  if (loading) return <Loader />;
  if (user)
    return (
      <button onClick={logout} className="btn">
        Sair ({user.displayName})
      </button>
    );

  return (
    <button onClick={loginWithGoogle} className="btn">
      Entrar com Google
    </button>
  );
}
