import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { PackageCheck, XCircle, Recycle, LoaderCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

const CustomerScanPage = () => {
  const [searchParams] = useSearchParams();
  const bagId = searchParams.get('bagId');
  const orderId = searchParams.get('orderId');

  const [bagData, setBagData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionDone, setActionDone] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchBag = async () => {
      if (!bagId) {
        setError("Invalid QR Code: Bag ID missing.");
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "bags", bagId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBagData(docSnap.data());
        } else {
          setError("Bag ID system mein nahi mila.");
        }
      } catch (err) {
        console.error("Error fetching bag:", err);
        setError("Database Connection Error.");
      } finally {
        setLoading(false);
      }
    };
    fetchBag();
  }, [bagId]);

  const handleAction = async (newStatus, message) => {
    setLoading(true);
    try {
      const bagRef = doc(db, "bags", bagId);
      
      let updatePayload = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        locationHistory: arrayUnion({ status: newStatus, timestamp: new Date().toISOString() })
      };

      if (newStatus === 'EMPTY_BAG_RETURNED') {
        updatePayload.customerDepositStatus = 'REFUNDED';
      }

      await updateDoc(bagRef, updatePayload);
      setSuccessMessage(message);
      setActionDone(true);
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Action update karne mein error aaya.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <LoaderCircle className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="mt-4 text-gray-600">Details load ho rahi hain...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-6">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-800">Error</h1>
        <p className="mt-2 text-gray-600">{error}</p>
    </div>
  );

  if (actionDone) return (
    <div className="flex flex-col items-center justify-center h-screen bg-emerald-50 text-center px-6">
        <CheckCircle2 className="w-20 h-20 text-emerald-600" />
        <h1 className="mt-6 text-3xl font-bold text-gray-900">Thank You!</h1>
        <p className="mt-4 text-lg text-gray-700">{successMessage}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6 max-w-md mx-auto flex flex-col justify-center">
      <header className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-emerald-700">LoopPack Delivery</h1>
            <span className="text-xs font-mono bg-gray-100 px-3 py-1 rounded-full text-gray-600">{bagId}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Order ID: <span className='font-semibold text-gray-800'>{orderId || bagData?.currentOrderId || 'N/A'}</span></p>
      </header>

      <main className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-2">
            <p className="text-sm font-medium text-gray-700">Aapka order deliver ho gaya hai. Kripya niche diye gaye options mein se select karein:</p>
        </div>

        <button 
            onClick={() => handleAction('DELIVERED_SUCCESS', 'Aapka order successfully received mark ho gaya hai!')}
            className="flex w-full items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border-l-4 border-blue-600 hover:bg-blue-50 transition text-left"
        >
            <PackageCheck className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
                <h3 className="font-bold text-gray-800">1. Order Successfully Mil Gaya</h3>
                <p className="text-xs text-gray-500">Mera saman sahi salamat pahunch gaya hai.</p>
            </div>
        </button>

        <button 
            onClick={() => handleAction('ORDER_CANCELLED_RETURN', 'Aapki order cancellation aur return request raise ho gayi hai.')}
            className="flex w-full items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border-l-4 border-red-500 hover:bg-red-50 transition text-left"
        >
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
                <h3 className="font-bold text-gray-800">2. Order Cancel / Return Karna Hai</h3>
                <p className="text-xs text-gray-500">Mujhe product wapas karna hai, saman bag mein hai.</p>
            </div>
        </button>

        <button 
            onClick={() => handleAction('EMPTY_BAG_RETURNED', 'Khali bag return mark ho gaya hai. Aapka ₹50 deposit refund process ho raha hai!')}
            className="flex w-full items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border-l-4 border-emerald-600 hover:bg-emerald-50 transition text-left"
        >
            <Recycle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
                <h3 className="font-bold text-emerald-700">3. Saman Nikal Liya, Khali Bag Wapas</h3>
                <p className="text-xs text-gray-500">Saman rakh liya hai, delivery agent ko khali bag de raha hoon.</p>
            </div>
        </button>
      </main>
    </div>
  );
};

export default CustomerScanPage;