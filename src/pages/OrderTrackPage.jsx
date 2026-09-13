import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { PackageSearch, Package, Truck, Calendar, ShieldCheck } from 'lucide-react';

const OrderTrackPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firestore se saare orders real-time fetch karein bina number search ke
  useEffect(() => {
    const bagsRef = collection(db, "bags");
    const q = query(bagsRef, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 pb-16">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white py-12 px-6 text-center shadow-inner mb-8">
        <h1 className="text-3xl font-black mb-2 flex items-center justify-center gap-2">
          <PackageSearch className="w-8 h-8" /> All Placed Orders & Tracking
        </h1>
        <p className="text-emerald-100 text-sm max-w-md mx-auto">Yahan system ke saare live orders aur reusable bag return status direct dikh rahe hain.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl text-center text-gray-500 border border-gray-200">
            <p className="text-sm font-semibold">Orders load ho rahe hain...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center text-gray-400 border border-gray-200">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-bold text-gray-700">Abhi tak koi order place nahi hua hai.</p>
            <p className="text-xs text-gray-400 mt-1">Storefront page par jakar pehla order place karein!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-2">
                  <div>
                    <span className="text-xs font-mono text-gray-500">Order ID: <strong className="text-gray-800">{order.currentOrderId}</strong></span>
                    <h4 className="font-bold text-gray-900 mt-0.5 text-lg">{order.customerName || 'Customer'}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">📞 {order.customerPhone || 'N/A'} | 📍 {order.deliveryAddress || 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold 
                    ${order.status === 'EMPTY_BAG_RETURNED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Expected Delivery</p>
                      <p className="font-bold text-gray-800">{order.estimatedDelivery || '3-4 Days'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Reusable Bag ID</p>
                      <p className="font-mono font-bold text-gray-800">{order.bagId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Green Deposit Status</p>
                      <p className="font-bold text-emerald-700">₹50 ({order.customerDepositStatus || 'PENDING'})</p>
                    </div>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="text-xs text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                    🛍️ <strong className="text-gray-800">Items:</strong> {order.items.map(i => `${i.name} (x${i.qty})`).join(', ')} | <strong className="text-emerald-700">Total: ₹{order.totalPrice}</strong>
                  </div>
                )}

                <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 leading-relaxed">
                  📦 <strong className="font-bold">Return Information:</strong> Order milne ke baad product ko bag se nikal lein aur khali reusable bag delivery agent ko wapas dein, jisse aapka ₹50 deposit turant refund kar diya jayega!
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackPage;