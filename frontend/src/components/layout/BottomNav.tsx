import { cn } from "../../lib/utils";
import { Package, ShoppingCart, History, ClipboardList, DollarSign, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  products: Package,
  cart: ShoppingCart,
  history: History,
  "admin-products": Package,
  "admin-orders": ClipboardList,
  "admin-finance": DollarSign,
  "admin-history": History,
};

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
      {tabs.map((tab) => {
        const Icon = iconMap[tab.id];
        return (
          <button
            key={tab.id}
            className={cn(active === tab.id && "active")}
            onClick={() => onChange(tab.id)}
          >
            <div className="relative inline-block mb-0.5">
              {Icon && <Icon size={20} />}
              {tab.id === "cart" && badge && badge > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </div>
            <div>{tab.label}</div>
          </button>
        );
      })}
    </nav>
  );
}
