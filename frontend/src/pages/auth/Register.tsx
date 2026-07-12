import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { login } from "../../services/auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface RegisterProps {
  onSwitch: () => void;
}

export function Register({ onSwitch }: RegisterProps) {
  const { register, loading, error } = useAuthStore();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [registered, setRegistered] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(username, password, name, phone);
      setRegistered(true);
    } catch {}
  };

  const handleLoginAfterRegister = async () => {
    setLoginLoading(true);
    try {
      await login(username, password);
      window.location.reload();
    } catch {}
  };

  if (registered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "color-mix(in srgb, var(--tg-success) 12%, transparent)" }}>
          <UserPlus size={28} style={{ color: "var(--tg-success)" }} />
        </div>
        <h1 className="text-xl font-bold mb-1">Ro'yxatdan o'tdingiz!</h1>
        <p className="text-sm mb-8 text-center" style={{ color: "var(--tg-hint)" }}>
          Endi hisobingizga kirishingiz mumkin
        </p>
        <Button className="w-full max-w-sm" loading={loginLoading} onClick={handleLoginAfterRegister}>
          Kirish
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "color-mix(in srgb, var(--tg-button) 12%, transparent)" }}>
        <UserPlus size={28} style={{ color: "var(--tg-button)" }} />
      </div>

      <h1 className="text-xl font-bold mb-1">Ro'yxatdan o'tish</h1>
      <p className="text-sm mb-8" style={{ color: "var(--tg-hint)" }}>Yangi hisob yarating</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <Input
          placeholder="Ismingiz"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoCapitalize="none"
          autoComplete="username"
        />

        <Input
          type="tel"
          placeholder="Telefon raqam (ixtiyoriy)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        {error && (
          <div className="p-3 rounded-xl text-sm" style={{ background: "color-mix(in srgb, var(--tg-destructive) 10%, transparent)", color: "var(--tg-destructive)" }}>
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading} disabled={!name || !username || !password}>
          <UserPlus size={16} />
          Ro'yxatdan o'tish
        </Button>
      </form>

      <p className="mt-6 text-sm" style={{ color: "var(--tg-hint)" }}>
        Hisobingiz bormi?{" "}
        <button className="border-none bg-transparent cursor-pointer font-medium" style={{ color: "var(--tg-button)" }} onClick={onSwitch}>
          Kirish
        </button>
      </p>
    </div>
  );
}
