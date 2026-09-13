import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc } from "firebase/firestore";
import { Recycle, AlertTriangle, CheckCircle2, Truck, PlusCircle, QrCode, X, ShoppingCart, Printer, Trash2, Eye } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const WarehouseDashboard = () => {
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBagId, setNewBagId] = useState('');
  const [newOrderId, setNewOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [activeBagForQR, setActiveBagForQR] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null); // Detailed view modal state

  useEffect(() => {
    const bagsRef = collection(db, "bags");
    const q = query(bagsRef, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const bagsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setBags(bagsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching real-time data: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddBag = async (e) => {
    e.preventDefault();
    if (!newBagId || !newOrderId) return alert("Kripya Bag ID aur Order ID bharein!");
    
    setSubmitting(true);
    try {
      const bagRef = doc(db, "bags", newBagId.trim());
      await setDoc(bagRef, {
        bagId: newBagId.trim(),
        currentOrderId: newOrderId.trim(),
        customerName: customerName.trim() || "Warehouse Walk-in",
        deliveryAddress: deliveryAddress.trim() || "Jabalpur Hub",
        status: "OUT_FOR_DELIVERY",
        customerDepositStatus: "PENDING",
        totalPrice: 1500,
        items: [{ name: "Manual Entry Product", qty: 1, price: 1500 }],
        updatedAt: new Date().toISOString(),
        locationHistory: [
          { status: "OUT_FOR_DELIVERY", timestamp: new Date().toISOString() }
        ]
      });

      setNewBagId('');
      setNewOrderId('');
      setCustomerName('');
      setDeliveryAddress('');
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding bag: ", err);
      alert("Bag add karne mein error aaya.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrder = async (bagId, orderId) => {
    if (window.confirm(`Kya aap sach mein order ${orderId} (Bag: ${bagId}) ko delete karna chahte hain?`)) {
      try {
        await deleteDoc(doc(db, "bags", bagId));
        alert("Order successfully delete ho gaya hai!");
      } catch (err) {
        console.error("Error deleting order:", err);
        alert("Order delete karne mein error aaya.");
      }
    }
  };

//   const getScanUrl = (bagId, orderId) => {
//     const hostname = window.location.hostname === 'localhost' ? '192.168.1.5' : window.location.hostname;
//     const port = window.location.port ? `:${window.location.port}` : '';
//     const protocol = window.location.protocol;
    
//     return `${protocol}//${hostname}${port}/scan?bagId=${bagId}&orderId=${orderId || 'ORD-998877'}`;
//   };


const getScanUrl = (bagId, orderId) => {
    const origin = window.location.origin;
    return `${origin}/scan?bagId=${bagId}&orderId=${orderId || 'ORD-998877'}`;
  };

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-900">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-200 gap-4">
        <div>
            <h1 className="text-3xl font-black text-emerald-700 flex items-center gap-3">
                <Recycle className="w-8 h-8" /> LoopPack Warehouse Hub
            </h1>
            <p className="text-gray-500 text-xs mt-1">Real-time Closed-Loop Packaging & Return Tracking System</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <a 
                href="/order" 
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold shadow-md transition text-xs"
            >
                <ShoppingCart className="w-4 h-4" /> Open Storefront
            </a>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-2xl font-bold shadow-md transition text-xs"
            >
                <PlusCircle className="w-4 h-4" /> Add Manual Bag
            </button>
        </div>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Truck className="w-8 h-8"/></div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Active Orders</p>
                <h3 className="text-3xl font-black mt-0.5 text-gray-900">{bags.length}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle2 className="w-8 h-8"/></div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Returned / Cleaned Bags</p>
                <h3 className="text-3xl font-black mt-0.5 text-emerald-700">
                    {bags.filter(b => b.status === 'EMPTY_BAG_RETURNED').length}
                </h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><AlertTriangle className="w-8 h-8"/></div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Out for Delivery</p>
                <h3 className="text-3xl font-black mt-0.5 text-amber-700">
                    {bags.filter(b => b.status === 'OUT_FOR_DELIVERY' || b.status === 'DELIVERED_SUCCESS').length}
                </h3>
            </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Live Orders & Customer QR Registry</h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Secure Admin Hub
            </span>
        </div>
        {loading ? (
            <div className="p-12 text-center text-gray-500 text-sm">Loading live registry data...</div>
        ) : bags.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
                <p className="text-sm font-semibold">Koi order nahi mila.</p>
                <a href="/order" className="text-xs text-emerald-600 underline font-bold mt-1 inline-block">Storefront par jakar order place karein</a>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-extrabold">
                            <th className="p-4">Order & Bag ID</th>
                            <th className="p-4">Customer Details</th>
                            <th className="p-4">Total Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Return Refund (10%)</th>
                            <th className="p-4">Full Details</th>
                            <th className="p-4">Printable QR Badge</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                        {bags.map((bag) => {
                            const scanUrl = getScanUrl(bag.id, bag.currentOrderId);
                            const orderTotal = bag.totalPrice || 1500;
                            const cashback10 = Math.round(orderTotal * 0.10);

                            return (
                                <tr key={bag.id} className="hover:bg-gray-50/80 transition">
                                    <td className="p-4">
                                        <div className="font-mono font-bold text-gray-800 text-xs">{bag.currentOrderId}</div>
                                        <div className="text-xs font-mono text-emerald-700 font-bold mt-0.5">Bag: {bag.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 text-xs">{bag.customerName || 'N/A'}</div>
                                        <div className="text-[11px] text-gray-500">📞 {bag.customerPhone || 'N/A'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-black text-gray-900 text-xs">₹{orderTotal}</div>
                                        <div className="text-[10px] text-gray-400">{bag.items?.length || 1} item(s)</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold 
                                            ${bag.status === 'EMPTY_BAG_RETURNED' ? 'bg-emerald-100 text-emerald-800' : 
                                              bag.status === 'ORDER_CANCELLED_RETURN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {bag.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${bag.customerDepositStatus === 'REFUNDED' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                            ₹{cashback10} {bag.customerDepositStatus === 'REFUNDED' ? 'RETURNED' : '10% BACK'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => setSelectedOrderDetails(bag)}
                                            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-bold transition border border-blue-200"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View Items
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => setActiveBagForQR(bag)}
                                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                                        >
                                            <QrCode className="w-3.5 h-3.5" /> Print QR
                                        </button>
                                    </td>
                                    <td className="p-4 flex items-center gap-2">
                                        <a 
                                            href={scanUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-emerald-700 hover:text-emerald-900 font-bold underline text-xs"
                                        >
                                            Scan ↗
                                        </a>
                                        <button 
                                            onClick={() => handleDeleteOrder(bag.id, bag.currentOrderId)}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition"
                                            title="Delete Order"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Order Full Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-200 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedOrderDetails(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-4 border-b border-gray-100 pb-3">
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                Order Summary & Address
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-2">{selectedOrderDetails.customerName}</h3>
              <p className="text-xs text-gray-500 font-mono">Order ID: {selectedOrderDetails.currentOrderId} | Bag: {selectedOrderDetails.bagId}</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1.5">
                <p className="font-bold text-gray-700">Delivery Information:</p>
                <p className="text-gray-600">📍 <strong className="text-gray-800">Address:</strong> {selectedOrderDetails.deliveryAddress || 'N/A'}</p>
                <p className="text-gray-600">📞 <strong className="text-gray-800">Phone:</strong> {selectedOrderDetails.customerPhone || 'N/A'}</p>
                <p className="text-gray-600">💳 <strong className="text-gray-800">Payment:</strong> {selectedOrderDetails.paymentMethod || 'COD'} ({selectedOrderDetails.paymentStatus || 'PENDING'})</p>
              </div>

              <div>
                <p className="font-bold text-gray-700 mb-2">Purchased Items:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                    selectedOrderDetails.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <div>
                          <p className="font-bold text-gray-800">{item.name}</p>
                          <p className="text-[11px] text-gray-500">Qty: {item.qty}</p>
                        </div>
                        <p className="font-black text-gray-900">₹{item.price * item.qty}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No items recorded.</p>
                  )}
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex justify-between items-center text-sm font-black text-emerald-900">
                <span>Total Amount:</span>
                <span>₹{selectedOrderDetails.totalPrice || 1500}</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full mt-5 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-2xl transition text-xs"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Manual Bag Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-200">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
                <h3 className="text-lg font-black mb-4 text-gray-800">Add Manual Bag & Order</h3>
                <form onSubmit={handleAddBag} className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Bag ID</label>
                        <input type="text" value={newBagId} onChange={(e) => setNewBagId(e.target.value)} placeholder="BAG-101" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Order ID</label>
                        <input type="text" value={newOrderId} onChange={(e) => setNewOrderId(e.target.value)} placeholder="ORD-5001" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name</label>
                        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Rahul Verma" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Address</label>
                        <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Jabalpur" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition text-xs mt-3 shadow-md">
                        {submitting ? "Saving..." : "Save & Generate QR"}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Personalized Printable QR Code Modal */}
      {activeBagForQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center relative border border-gray-200">
                <button onClick={() => setActiveBagForQR(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    LoopPack Sustainable Box
                  </span>
                </div>

                <h3 className="text-xl font-black text-gray-900 mt-1">{activeBagForQR.customerName}</h3>
                <p className="text-xs text-gray-500 mb-4">📍 {activeBagForQR.deliveryAddress || 'Jabalpur Hub'}</p>

                {/* Printable Badge Container */}
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-emerald-300 inline-block mb-4 shadow-sm">
                    <QRCodeSVG value={getScanUrl(activeBagForQR.id, activeBagForQR.currentOrderId)} size={180} />
                    <div className="mt-3 text-center">
                      <span className="font-mono font-bold text-xs bg-white px-3 py-1 rounded-xl border border-gray-200 text-emerald-800 block">
                        {activeBagForQR.currentOrderId} | {activeBagForQR.id}
                      </span>
                    </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handlePrintQR}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30"
                  >
                    <Printer className="w-4 h-4" /> Print Customer Badge
                  </button>
                  <p className="text-[10px] text-gray-400">Scan this QR code during delivery & bag return pickup.</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseDashboard;