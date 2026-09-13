import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { 
  ShoppingBag, 
  ShoppingCart, 
  PackageSearch, 
  LayoutDashboard, 
  Truck, 
  LogOut, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const ADMIN_EMAIL = 'sardardhakad81@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          } else {
            setUserData({
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email
            });
          }
        } catch (err) {
          console.error("Error fetching user data in navbar:", err);
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/login');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isAdmin = user && user.email?.toLowerCase() === ADMIN_EMAIL;
  const displayName = userData?.name || user?.displayName || user?.email?.split('@')[0] || 'My Account';

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-emerald-950 to-teal-950 text-white sticky top-0 z-50 shadow-xl border-b border-emerald-900/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          
          {/* Brand Logo */}
          <Link to="/order" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:bg-emerald-500 transition">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight flex items-center gap-1.5 text-white">
                LoopStore <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </span>
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase -mt-0.5">Sustainable Retail</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner text-sm font-semibold">
            <Link 
              to="/order" 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${location.pathname === '/order' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold' : 'hover:bg-white/10 text-gray-300'}`}
            >
              <ShoppingCart className="w-4 h-4" /> Store
            </Link>

            <Link 
              to="/track" 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${location.pathname === '/track' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold' : 'hover:bg-white/10 text-gray-300'}`}
            >
              <PackageSearch className="w-4 h-4" /> Track Order
            </Link>

            {isAdmin && (
              <>
                <Link 
                  to="/delivery" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${location.pathname === '/delivery' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold' : 'hover:bg-white/10 text-gray-300'}`}
                >
                  <Truck className="w-4 h-4" /> Delivery
                </Link>

                <Link 
                  to="/admin" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/40 transition ${location.pathname === '/admin' ? 'bg-amber-500 text-gray-900 font-black shadow-md' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300'}`}
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-400" /> Admin Hub
                </Link>
              </>
            )}
          </div>

          {/* User Profile / Auth Area (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-2xl border border-white/10 transition text-xs font-semibold shadow-sm"
                >
                  <div className="w-7 h-7 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-3xl shadow-2xl py-3 border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-800 truncate">{displayName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> System Admin
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Secure Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-lg shadow-emerald-900/40 transition flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 text-white border-t border-gray-800 px-5 py-6 space-y-3 shadow-2xl animate-in slide-in-from-top duration-200">
          
          {user && (
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-base">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{displayName}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <Link 
            to="/order" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 font-semibold text-sm transition"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-400" /> Storefront
          </Link>

          <Link 
            to="/track" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 font-semibold text-sm transition"
          >
            <PackageSearch className="w-4 h-4 text-emerald-400" /> Track Order Status
          </Link>

          {isAdmin && (
            <>
              <Link 
                to="/delivery" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 font-semibold text-sm transition"
              >
                <Truck className="w-4 h-4 text-emerald-400" /> Delivery Portal
              </Link>

              <Link 
                to="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500 text-gray-900 font-bold text-sm transition shadow-md"
              >
                <LayoutDashboard className="w-4 h-4" /> Admin Hub Dashboard
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-white/10 mt-3">
            {user ? (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl font-bold text-xs transition shadow-lg shadow-red-900/30"
              >
                <LogOut className="w-4 h-4" /> Logout Account
              </button>
            ) : (
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-bold text-xs transition shadow-lg shadow-emerald-900/30"
              >
                <User className="w-4 h-4" /> Sign In / Register
              </Link>
            )}
          </div>

        </div>
      )}
    </nav>
  );
};

export default Navbar;