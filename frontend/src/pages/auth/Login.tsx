import { useState } from "react";
import { LogIn, User, Lock } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface LoginProps {
  onSwitch: () => void;
}

export function Login({ onSwitch }: LoginProps) {
  const { login, loading, error } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch {}
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "color-mix(in srgb, var(--tg-button) 12%, transparent)" }}>
        <LogIn size={28} style={{ color: "var(--tg-button)" }} />
      </div>

      <h1 className="text-xl font-bold mb-1">Kirish</h1>
      <p className="text-sm mb-8" style={{ color: "var(--tg-hint)" }}>Hisobingizga kiring</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoCapitalize="none"
          autoComplete="username"
        />

        <Input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && (
          <div className="p-3 rounded-xl text-sm" style={{ background: "color-mix(in srgb, var(--tg-destructive) 10%, transparent)", color: "var(--tg-destructive)" }}>
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading} disabled={!username || !password}>
          <LogIn size={16} />
          Kirish
        </Button>
      </form>

      <p className="mt-6 text-sm" style={{ color: "var(--tg-hint)" }}>
        Hisobingiz yo'qmi?{" "}
        <button className="border-none bg-transparent cursor-pointer font-medium" style={{ color: "var(--tg-button)" }} onClick={onSwitch}>
          Ro'yxatdan o'tish
        </button>
      </p>

      <div className="mt-6 p-4 rounded-2xl w-full max-w-sm" style={{ background: "var(--tg-secondary-bg)" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--tg-hint)" }}>Test ma'lumotlari:</p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <User size={14} /> <span className="font-medium">Admin:</span> <code>admin / admin</code>
          </div>
          <div className="flex items-center gap-2">
            <User size={14} /> <span className="font-medium">User:</span> <code>user / user</code>
          </div>
        </div>
      </div>
    </div>
  );
}
