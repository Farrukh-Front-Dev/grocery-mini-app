import { cn } from "../../utils/cn";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface BottomNavProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  badge?: number;
}

export function BottomNav({ tabs, active, onChange, badge }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(active === tab.id && "active")}
          onClick={() => onChange(tab.id)}
        >
          <div className="text-lg mb-0.5 relative inline-block">
            {tab.icon}
            {tab.id === "cart" && badge && badge > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </div>
          <div>{tab.label}</div>
        </button>
      ))}
    </nav>
  );
}
