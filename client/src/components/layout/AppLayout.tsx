import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { Notification } from '../../types/index.js';
import {
  LayoutDashboard,
  Building2,
  Package,
  FileText,
  CheckSquare,
  ShoppingCart,
  Send,
  PackageCheck,
  Boxes,
  Receipt,
  CreditCard,
  PieChart,
  FileSignature,
  Sparkles,
  BarChart3,
  Zap,
  Bell,
  Settings,
  Menu,
  X,
  Search,
  ChevronDown,
  LogOut,
  User,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll / fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  const allNavItems = [
    { label: 'Admin Center', path: '/admin', icon: Shield, adminOnly: true, badge: 'Gov' },
    { label: 'Overview', path: '/app', icon: LayoutDashboard },
    { label: 'Vendors', path: '/app/vendors', icon: Building2, roles: ['Admin', 'Super Admin', 'Purchase Manager', 'Procurement Manager', 'Procurement Officer'] },
    { label: 'Products & Catalog', path: '/app/products', icon: Package, roles: ['Admin', 'Super Admin', 'Purchase Manager', 'Procurement Manager', 'Procurement Officer', 'Inventory Manager'] },
    { label: 'Requisitions', path: '/app/requisitions', icon: FileText, roles: ['Admin', 'Super Admin', 'Purchase Manager', 'Procurement Manager', 'Procurement Officer', 'Employee / Requester', 'Department Manager / Approver'] },
    { label: 'Approvals', path: '/app/approvals', icon: CheckSquare, badge: 'Queue', roles: ['Admin', 'Super Admin', 'Purchase Manager', 'Procurement Manager', 'Department Manager / Approver'] },
    { label: 'Purchase Orders', path: '/app/purchase-orders', icon: ShoppingCart, roles: ['Admin', 'Super Admin', 'Purchase Manager', 'Procurement Manager', 'Procurement Officer', 'Vendor', 'Finance Officer', 'Inventory Manager'] },
    { label: 'RFQs & Quotations', path: '/app/rfqs', icon: Send, roles: ['Admin', 'Super Admin', 'Purchase Manager', 'Procurement Manager', 'Procurement Officer', 'Vendor'] },
    { label: 'Goods Receipts', path: '/app/goods-receipts', icon: PackageCheck, roles: ['Admin', 'Super Admin', 'Purchase Manager', 'Procurement Manager', 'Inventory Manager'] },
    { label: 'Inventory', path: '/app/inventory', icon: Boxes, roles: ['Admin', 'Super Admin', 'Purchase Manager', 'Procurement Manager', 'Inventory Manager'] },
    { label: 'Invoices', path: '/app/invoices', icon: Receipt, roles: ['Admin', 'Super Admin', 'Finance Officer', 'Purchase Manager', 'Procurement Manager', 'Vendor'] },
    { label: 'Payments', path: '/app/payments', icon: CreditCard, roles: ['Admin', 'Super Admin', 'Finance Officer'] },
    { label: 'Budgets', path: '/app/budgets', icon: PieChart, roles: ['Admin', 'Super Admin', 'Finance Officer', 'Purchase Manager', 'Procurement Manager'] },
    { label: 'Contracts', path: '/app/contracts', icon: FileSignature, roles: ['Admin', 'Super Admin', 'Purchase Manager', 'Procurement Manager'] },
    { label: 'AI Intelligence', path: '/app/ai', icon: Sparkles, highlight: true }, // Available to EVERY authenticated role
    { label: 'Reports', path: '/app/reports', icon: BarChart3, roles: ['Admin', 'Super Admin', 'Purchase Manager', 'Procurement Manager', 'Finance Officer'] },
    { label: 'Automations', path: '/app/automations', icon: Zap, roles: ['Admin', 'Super Admin'] },
    { label: 'Notifications', path: '/app/notifications', icon: Bell },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const navItems = allNavItems.filter((item) => {
    if (user?.role === 'Admin' || user?.role === 'Super Admin') return true;
    if (item.adminOnly) return false;
    if (!item.roles) return true; // Universal (AI, Overview, Notifications, Settings)
    return item.roles.includes(user?.role || '');
  });

  return (
    <div className="min-h-screen bg-procure-bg flex">
      {/* Desktop Left Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-procure-border transition-all duration-300 z-30 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo and Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-procure-border">
          <Link to="/app" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              P
            </div>
            {!isSidebarCollapsed && (
              <div>
                <span className="font-extrabold text-xl tracking-tight text-procure-text">
                  Procure<span className="text-teal-500">X</span>
                </span>
                <span className="block text-[10px] font-semibold tracking-wider uppercase text-procure-muted -mt-1">
                  Enterprise Platform
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.path === '/app'
                ? location.pathname === '/app'
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : item.highlight
                    ? 'text-teal-600 hover:bg-teal-50/60 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? 'text-teal-600'
                      : item.highlight
                      ? 'text-teal-500'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!isSidebarCollapsed && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && (
                      <span className="text-[10px] uppercase font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-md">
                        AI
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Current User Quick Info */}
        {!isSidebarCollapsed && user && (
          <div className="p-4 border-t border-procure-border bg-slate-50/60 m-3 rounded-xl flex items-center justify-between">
            <div className="truncate">
              <div className="font-bold text-xs text-slate-800 truncate">{user.name}</div>
              <div className="text-[11px] text-teal-700 font-semibold truncate">{user.role}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <header className="h-16 bg-white border-b border-procure-border flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb or search */}
            <div className="relative hidden md:flex items-center w-64 lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search vendors, POs, catalog..."
                className="w-full bg-slate-50 border border-procure-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-procure-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Current User Role Badge */}
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold bg-teal-50 text-teal-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-teal-200 max-w-[130px] sm:max-w-none truncate">
              <Shield className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="hidden sm:inline">Role:</span> <span className="truncate">{user?.role || 'Guest'}</span>
            </div>

            {/* Notification Bell with unread badge */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-procure-border p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800">Notifications ({unreadCount} new)</h4>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-teal-600 hover:underline font-semibold"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="space-y-2 mt-3 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No notifications.</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 rounded-xl border text-xs ${
                            n.isRead
                              ? 'bg-white border-slate-100 text-slate-600'
                              : 'bg-teal-50/50 border-teal-100 text-slate-900 font-medium'
                          }`}
                        >
                          <div className="font-bold text-slate-800">{n.title}</div>
                          <p className="text-slate-600 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar and Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0] || 'U'}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-slate-700">
                  {user?.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-procure-border p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-xs text-slate-800">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <div className="space-y-1 mt-1">
                    <Link
                      to="/app/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" /> Settings & Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl p-4 flex flex-col z-50 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-procure-border">
                <span className="font-bold text-lg text-procure-text">ProcureX</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 py-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                  >
                    <item.icon className="w-5 h-5 text-slate-400" /> {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
