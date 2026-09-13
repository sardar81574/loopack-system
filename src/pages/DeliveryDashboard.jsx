import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc } from "firebase/firestore";
import { Truck, MapPin, Phone, LogOut, Clock, Navigation } from 'lucide-react';

const DELIVERY_AREAS = ['Vijay Nagar', 'Civil Lines', 'Napier Town', 'Gorakhpur'];
const SESSION_DURATION_HOURS = 8; 

// Initial Demo Data agar Firebase mein orders na ho
const INITIAL_DEMO_ORDERS = [
  {
    id: 'BAG-101',
    bagId: 'BAG-101',
    currentOrderId: 'ORD-5001',
    customerName: 'Rahul Verma',
    deliveryAddress: 'Vijay Nagar Sector 4, Jabalpur',
    customerPhone: '9876543210',
    status: 'OUT_FOR_DELIVERY',
    estimatedDelivery: 'Mon, Sep 15',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'BAG-102',
    bagId: 'BAG-102',
    currentOrderId: 'ORD-5002',
    customerName: 'Priya Sharma',
    deliveryAddress: 'Civil Lines Near High Court, Jabalpur',
    customerPhone: '9123456789',
    status: 'OUT_FOR_DELIVERY',
    estimatedDelivery: 'Tue, Sep 16',
    updatedAt: new Date().toISOString()
  }
];

const DeliveryDashboard = () => {
  const [selectedArea, setSelectedArea] = useState('');
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Check localStorage on initial load to maintain active session
  useEffect(() => {
    const savedArea = localStorage.getItem('delivery_area');
    const savedExpiry = localStorage.getItem('delivery_session_expiry');

    if (savedArea && savedExpiry) {
      const now = new Date().getTime();
      if (now < parseInt(savedExpiry)) {
        setSelectedArea(savedArea);
        setSessionExpiry(parseInt(savedExpiry));
      } else {
        handleLogout();
      }
    }
  }, []);

  // Timer countdown and Auto Logout handler
  useEffect(() => {
    if (!sessionExpiry) return;

    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = sessionExpiry - now;

      if (distance <= 0) {
        clearInterval(timerInterval);
        alert("Aapka delivery session expire ho gaya hai. Kripya dobara area select karein.");
        handleLogout();
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [sessionExpiry]);

  // Handle Area Selection & Lock Session
  const handleSelectArea = async (area) => {
    const expiryTime = new Date().getTime() + (SESSION_DURATION_HOURS * 60 * 60 * 1000);
    localStorage.setItem('delivery_area', area);
    localStorage.setItem('delivery_session_expiry', expiryTime.toString());
    setSelectedArea(area);
    setSessionExpiry(expiryTime);

    // Auto-seed demo data into Firestore if empty for testing convenience
    try {
      for (const demo of INITIAL_DEMO_ORDERS) {
        await setDoc(doc(db, "bags", demo.id), demo, { merge: true });
      }
    } catch (err) {
      console.log("Demo seed note:", err);
    }
  };

  // Logout / Switch Area
  const handleLogout = () => {
    localStorage.removeItem('delivery_area');
    localStorage.removeItem('delivery_session_expiry');
    setSelectedArea('');
    setSessionExpiry(null);
    setAssignedOrders([]);
  };

  // Fetch Orders based on assigned delivery range/area
  useEffect(() => {
    if (!selectedArea) return;

    setLoading(true);
    const bagsRef = collection(db, "bags");
    const q = query(bagsRef, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter for delivery boy's operational range/area
      const filtered = allOrders.filter(order => 
        order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(selectedArea.toLowerCase())
      );

      setAssignedOrders(filtered);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedArea]);

  const updateOrderStatus = async (bagId, newStatus) => {
    try {
      const bagRef = doc(db, "bags", bagId);
      await updateDoc(bagRef, { status: newStatus });
      alert("Order status successfully updated!");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  // Area Selection Screen
  if (!selectedArea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-emerald-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl text-center border border-white/20">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Truck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Delivery Partner Range Login</h2>
          <p className="text-gray-500 text-xs mb-6">Select your operational work area. Your session will be locked for {SESSION_DURATION_HOURS} hours.</p>
          
          <div className="space-y-3">
            {DELIVERY_AREAS.map(area => (
              <button
                key={area}
                onClick={() => handleSelectArea(area)}
                className="w-full bg-gray-50 hover:bg-emerald-50 hover:border-emerald-500 border border-gray-200 text-gray-800 font-bold py-3.5 px-4 rounded-2xl transition text-sm flex items-center justify-between shadow-sm"
              >
                <span className="flex items-center gap-2">📍 {area} Range</span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-2.5 py-1 rounded-xl">Lock & Start →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      {/* Header with Active Session Timer */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-200 mb-8 max-w-4xl mx-auto gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-emerald-700">Active Range: {selectedArea}</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Locked Session</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Session Auto-Logout in: <strong className="text-gray-800 font-mono">{timeLeft}</strong>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-2xl font-bold text-xs transition shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Force Logout / Switch Area
        </button>
      </header>

      {/* Orders List with GPS Google Maps Navigation */}
      <div className="max-w-4xl mx-auto space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-3xl text-center text-gray-500 shadow-sm border border-gray-200">Loading assigned range orders...</div>
        ) : assignedOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center text-gray-400 shadow-sm border border-gray-200">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-40 text-emerald-600" />
            <p className="font-bold text-gray-800 text-base">Is range ({selectedArea}) mein abhi koi active order nahi hai.</p>
            <p className="text-xs text-gray-400 mt-1">Storefront se order place karein ya admin panel se manual bag add karein.</p>
          </div>
        ) : (
          assignedOrders.map(order => {
            // Google Maps Navigation URL generator based on customer address
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress + ', Jabalpur')}`;

            return (
              <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-2">
                  <div>
                    <span className="text-xs font-mono text-gray-500">Order ID: <strong className="text-gray-800">{order.currentOrderId}</strong> | Bag: {order.bagId}</span>
                    <h4 className="font-bold text-gray-900 text-lg mt-0.5">{order.customerName}</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Delivery Address</p>
                      <p className="font-semibold text-gray-800 text-xs mt-0.5">{order.deliveryAddress}</p>
                      
                      {/* GPS Google Maps Route Button */}
                      <a 
                        href={googleMapsUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm transition"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Open Google Maps Route ↗
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Customer Phone</p>
                      <a href={`tel:${order.customerPhone}`} className="font-bold text-emerald-700 text-xs hover:underline">
                        📞 {order.customerPhone || 'N/A'}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-gray-500">Expected Delivery: <strong className="text-gray-800">{order.estimatedDelivery || '3-4 Days'}</strong></span>
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'DELIVERED_SUCCESS')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition shadow-md shadow-emerald-600/20"
                  >
                    Mark Delivered ✓
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;