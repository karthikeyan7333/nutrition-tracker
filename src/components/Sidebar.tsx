import { LayoutDashboard, PlusCircle, CalendarRange, BarChart3, User, LogOut, Leaf, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail?: string;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  userEmail = "user@example.com",
  onLogout,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "add-food", label: "Add Food", icon: PlusCircle },
    { id: "weekly", label: "Weekly Progress", icon: CalendarRange },
    { id: "monthly", label: "Monthly Progress", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar (Pinned Left) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#141414] border-r border-[#2A2A2A] h-screen sticky top-0 p-6 justify-between">
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20 green-glow">
              <Leaf className="w-5 h-5 text-[#22C55E]" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              NUTRITION<span className="text-[#22C55E]">.</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 group relative ${
                    isActive
                      ? "bg-[#1B1B1B] text-white border-l-2 border-[#22C55E]"
                      : "text-[#B3B3B3] hover:text-white hover:bg-[#1B1B1B]/50"
                  }`}
                >
                  <Icon
                    className={`w-4.5 h-4.5 transition-colors ${
                      isActive ? "text-[#22C55E]" : "text-[#B3B3B3] group-hover:text-white"
                    }`}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="space-y-4 pt-6 border-t border-[#2A2A2A]">
          <div className="px-3 py-2 rounded-xl bg-[#1B1B1B]/40 border border-[#2A2A2A]/40">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-[#B3B3B3]">Logged In As</p>
            <p className="text-xs font-mono text-white truncate mt-1" title={userEmail}>
              {userEmail}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition duration-200"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Slide-In Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-40"
            />

            {/* Slide-In panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 bg-[#141414] border-r border-[#2A2A2A] z-50 p-6 flex flex-col justify-between"
            >
              <div className="space-y-8">
                {/* Brand and close */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20 green-glow">
                      <Leaf className="w-5 h-5 text-[#22C55E]" />
                    </div>
                    <span className="font-display font-bold text-lg tracking-tight text-white">
                      NUTRITION<span className="text-[#22C55E]">.</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 text-[#B3B3B3] hover:text-white bg-[#1B1B1B] rounded-lg border border-[#2A2A2A]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-1.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                          isActive
                            ? "bg-[#1B1B1B] text-white border-l-2 border-[#22C55E]"
                            : "text-[#B3B3B3] hover:text-white hover:bg-[#1B1B1B]"
                        }`}
                      >
                        <Icon
                          className={`w-4.5 h-4.5 ${
                            isActive ? "text-[#22C55E]" : "text-[#B3B3B3]"
                          }`}
                        />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* User profile & logout */}
              <div className="space-y-4 pt-6 border-t border-[#2A2A2A]">
                <div className="px-3 py-2 rounded-xl bg-[#1B1B1B]/40 border border-[#2A2A2A]/40">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[#B3B3B3]">Logged In As</p>
                  <p className="text-xs font-mono text-white truncate mt-0.5" title={userEmail}>
                    {userEmail}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition duration-200"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
