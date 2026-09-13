import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from "firebase/firestore";
import { ShoppingBag, CheckCircle2, ArrowRight, ShoppingCart, Star, Plus, Minus, Calendar, Search, Sparkles, CreditCard, Banknote } from 'lucide-react';

// 50+ Real Products with Real Unsplash Images
const ALL_PRODUCTS = [
  { id: 'PROD-1', category: 'Electronics', name: 'Wireless Bluetooth Earbuds Pro', price: 1499, originalPrice: 2999, rating: 4.5, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60', desc: 'Active noise cancellation, 30h battery life with fast charging case.', deliveryDays: 3 },
  { id: 'PROD-2', category: 'Electronics', name: 'Smart Fitness Band & Watch', price: 2499, originalPrice: 4999, rating: 4.2, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60', desc: 'SpO2 monitoring, AMOLED display, 24/7 heart rate tracking.', deliveryDays: 4 },
  { id: 'PROD-3', category: 'Fashion', name: 'Running Sports Shoes', price: 2999, originalPrice: 5999, rating: 4.6, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60', desc: 'Ultra-lightweight mesh upper with high shock absorption sole.', deliveryDays: 5 },
  { id: 'PROD-4', category: 'Fashion', name: 'Minimalist Travel Backpack', price: 1899, originalPrice: 3499, rating: 4.4, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60', desc: 'Water-resistant fabric with dedicated 15.6 inch padded laptop compartment.', deliveryDays: 3 },
  { id: 'PROD-5', category: 'Electronics', name: 'Portable 10000mAh Power Bank', price: 999, originalPrice: 1999, rating: 4.7, image: 'https://images.unsplash.com/photo-1609592424067-76d97c724773?w=500&auto=format&fit=crop&q=60', desc: 'Dual USB output, 18W fast charging in a pocket-friendly size.', deliveryDays: 2 },
  { id: 'PROD-6', category: 'Home', name: 'Smart LED Desk Lamp', price: 1299, originalPrice: 2499, rating: 4.3, image: 'https://images.unsplash.com/photo-1534349762230-e1cadfefc2c5?w=500&auto=format&fit=crop&q=60', desc: 'Touch control, adjustable brightness levels and eye-care tech.', deliveryDays: 4 },
  { id: 'PROD-7', category: 'Electronics', name: 'Active Noise Cancelling Headphones', price: 4999, originalPrice: 9999, rating: 4.8, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60', desc: 'Studio quality sound with 40mm drivers and 45-hour playback.', deliveryDays: 3 },
  { id: 'PROD-8', category: 'Electronics', name: 'RGB Mechanical Gaming Keyboard', price: 3499, originalPrice: 6999, rating: 4.7, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60', desc: 'Hot-swappable switches, customizable RGB backlighting and durable build.', deliveryDays: 4 },
  { id: 'PROD-9', category: 'Electronics', name: 'Ergonomic Wireless Optical Mouse', price: 1199, originalPrice: 2299, rating: 4.4, image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60', desc: 'Silent clicks, adjustable DPI levels and comfortable grip design.', deliveryDays: 3 },
  { id: 'PROD-10', category: 'Electronics', name: '4K Action Sports Camera', price: 7999, originalPrice: 14999, rating: 4.5, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60', desc: 'Waterproof up to 30m with dual screens and electronic image stabilization.', deliveryDays: 5 },
  { id: 'PROD-11', category: 'Electronics', name: 'Mini Bluetooth Soundbar', price: 1999, originalPrice: 3999, rating: 4.3, image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=60', desc: 'Deep bass, stereo sound output, ideal for TV and desktop setups.', deliveryDays: 3 },
  { id: 'PROD-12', category: 'Electronics', name: 'Smart Home Wi-Fi Security Camera', price: 2299, originalPrice: 4499, rating: 4.6, image: 'https://images.unsplash.com/photo-1557324232-b891773c3a6f?w=500&auto=format&fit=crop&q=60', desc: '1080p HD night vision, motion detection and two-way audio support.', deliveryDays: 3 },
  { id: 'PROD-13', category: 'Electronics', name: 'Fast USB-C Wall Charger 65W', price: 1599, originalPrice: 2999, rating: 4.8, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60', desc: 'GaN technology support for laptops, tablets and smartphones simultaneously.', deliveryDays: 2 },
  { id: 'PROD-14', category: 'Electronics', name: 'Smart Digital Kitchen Weighing Scale', price: 699, originalPrice: 1499, rating: 4.2, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', desc: 'High precision sensors with LCD display and stainless steel platform.', deliveryDays: 3 },
  { id: 'PROD-15', category: 'Electronics', name: 'True Wireless Gaming Earbuds', price: 2199, originalPrice: 4599, rating: 4.5, image: 'https://images.unsplash.com/photo-1606841837239-cbbbab1f81df?w=500&auto=format&fit=crop&q=60', desc: 'Ultra-low latency gaming mode with breathing RGB LED lighting effects.', deliveryDays: 4 },

  { id: 'PROD-16', category: 'Fashion', name: 'Classic Leather Casual Jacket', price: 4499, originalPrice: 8999, rating: 4.7, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60', desc: 'Premium faux leather with soft inner lining and zippered pockets.', deliveryDays: 5 },
  { id: 'PROD-17', category: 'Fashion', name: 'Designer UV-Protected Sunglasses', price: 999, originalPrice: 2499, rating: 4.3, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60', desc: 'Polarized lenses with lightweight metal frame for all-day comfort.', deliveryDays: 3 },
  { id: 'PROD-18', category: 'Fashion', name: 'Slim Fit Stretch Denim Jeans', price: 1799, originalPrice: 3599, rating: 4.4, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60', desc: 'Flexible cotton-blend fabric designed for modern casual streetwear.', deliveryDays: 4 },
  { id: 'PROD-19', category: 'Fashion', name: 'Formal Oxford Business Shoes', price: 3299, originalPrice: 6499, rating: 4.6, image: 'https://images.unsplash.com/photo-1533867617858-e7d97e0afd8b?w=500&auto=format&fit=crop&q=60', desc: 'Handcrafted genuine leather formal shoes for office and events.', deliveryDays: 5 },
  { id: 'PROD-20', category: 'Fashion', name: 'Pure Cotton Graphic Oversized T-Shirt', price: 799, originalPrice: 1599, rating: 4.5, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60', desc: '240 GSM heavy gauge bio-washed cotton for supreme breathable comfort.', deliveryDays: 3 },
  { id: 'PROD-21', category: 'Fashion', name: 'Waterproof Sports Chronograph Watch', price: 3999, originalPrice: 7999, rating: 4.7, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=60', desc: 'Stainless steel strap with luminous dials and stopwatch functionality.', deliveryDays: 4 },
  { id: 'PROD-22', category: 'Fashion', name: 'Genuine Leather Executive Wallet', price: 799, originalPrice: 1699, rating: 4.8, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60', desc: 'RFID blocking slim fold wallet with multiple card slots and cash compartments.', deliveryDays: 2 },
  { id: 'PROD-23', category: 'Fashion', name: 'Cotton Hooded Pullover Sweatshirt', price: 1499, originalPrice: 2999, rating: 4.6, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60', desc: 'Fleece-lined winter hoodie with spacious kangaroo front pocket.', deliveryDays: 4 },
  { id: 'PROD-24', category: 'Fashion', name: 'Breathable Athletic Training Shorts', price: 699, originalPrice: 1399, rating: 4.3, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60', desc: 'Moisture-wicking fabric with elastic waistband and zipper side pockets.', deliveryDays: 3 },
  { id: 'PROD-25', category: 'Fashion', name: 'Unisex Canvas Slip-On Sneakers', price: 1299, originalPrice: 2599, rating: 4.4, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&auto=format&fit=crop&q=60', desc: 'Flexible vulcanized rubber sole for casual everyday walking.', deliveryDays: 3 },
  { id: 'PROD-26', category: 'Fashion', name: 'Formal Silk Blend Neck Tie & Cufflinks', price: 899, originalPrice: 1899, rating: 4.5, image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=500&auto=format&fit=crop&q=60', desc: 'Elegant jacquard weave tie accompanied by matching metallic cufflinks.', deliveryDays: 3 },
  { id: 'PROD-27', category: 'Fashion', name: 'Thermal Winter Beanie Cap & Gloves', price: 999, originalPrice: 1999, rating: 4.7, image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&auto=format&fit=crop&q=60', desc: 'Soft knit woolen material designed for extreme cold protection.', deliveryDays: 4 },
  { id: 'PROD-28', category: 'Fashion', name: 'Lightweight Nylon Windbreaker Jacket', price: 2499, originalPrice: 4999, rating: 4.5, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=60', desc: 'Packable wind-resistant jacket with hood and adjustable drawstrings.', deliveryDays: 4 },
  { id: 'PROD-29', category: 'Fashion', name: 'Formal Leather Reversible Belt', price: 849, originalPrice: 1799, rating: 4.4, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60', desc: 'Dual-color rotatable metal buckle allowing black and brown styling.', deliveryDays: 3 },
  { id: 'PROD-30', category: 'Fashion', name: 'Cotton Ankle Athletic Socks (Pack of 5)', price: 499, originalPrice: 999, rating: 4.8, image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&auto=format&fit=crop&q=60', desc: 'Cushioned arch support breathable moisture control sport socks.', deliveryDays: 2 },

  { id: 'PROD-31', category: 'Home', name: 'Stainless Steel Insulated Water Bottle', price: 899, originalPrice: 1799, rating: 4.8, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60', desc: 'Double-wall vacuum insulation keeps drinks cold for 24h or hot for 12h.', deliveryDays: 2 },
  { id: 'PROD-32', category: 'Home', name: 'Aromatherapy Essential Oil Diffuser', price: 1599, originalPrice: 3199, rating: 4.6, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60', desc: 'Ultrasonic humidifier with ambient LED lights and auto shut-off safety.', deliveryDays: 3 },
  { id: 'PROD-33', category: 'Home', name: 'Memory Foam Orthopedic Pillow', price: 1299, originalPrice: 2599, rating: 4.7, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&auto=format&fit=crop&q=60', desc: 'Ergonomic neck support designed for deep restful sleep alignment.', deliveryDays: 4 },
  { id: 'PROD-34', category: 'Home', name: 'Non-Stick Ceramic Cooking Pan Set', price: 2799, originalPrice: 5499, rating: 4.5, image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60', desc: 'PFOA-free scratch-resistant coating with heat-resistant ergonomic handles.', deliveryDays: 5 },
  { id: 'PROD-35', category: 'Home', name: 'Rechargeable Electric Lint Remover', price: 799, originalPrice: 1599, rating: 4.4, image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=500&auto=format&fit=crop&q=60', desc: 'Efficient fabric shaver removes fuzz, pill and bobbles from clothes safely.', deliveryDays: 3 },
  { id: 'PROD-36', category: 'Home', name: 'Multifunctional Vegetable Chopper', price: 699, originalPrice: 1399, rating: 4.6, image: 'https://images.unsplash.com/photo-1594834749156-4e5421c609d5?w=500&auto=format&fit=crop&q=60', desc: 'Manual food processor with stainless steel blades for quick kitchen prep.', deliveryDays: 2 },
  { id: 'PROD-37', category: 'Home', name: 'Waterproof Mattress Protector Cover', price: 999, originalPrice: 1999, rating: 4.5, image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=60', desc: 'Breathable noiseless hypoallergenic fitted sheet style mattress cover.', deliveryDays: 3 },
  { id: 'PROD-38', category: 'Home', name: 'LED Motion Sensor Wardrobe Lights', price: 1099, originalPrice: 2199, rating: 4.7, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&auto=format&fit=crop&q=60', desc: 'Magnetic rechargeable stick-on cabinet lights with automatic infrared sensing.', deliveryDays: 3 },
  { id: 'PROD-39', category: 'Home', name: 'Collapsible Laundry Basket Hamper', price: 599, originalPrice: 1299, rating: 4.3, image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500&auto=format&fit=crop&q=60', desc: 'Storable waterproof cotton linen fabric hamper with sturdy aluminum handles.', deliveryDays: 2 },
  { id: 'PROD-40', category: 'Home', name: 'Silicon Food Storage Containers (Set of 4)', price: 1199, originalPrice: 2399, rating: 4.6, image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=60', desc: 'Collapsible airtight leakproof microwave-safe lunch boxes.', deliveryDays: 3 },

  { id: 'PROD-41', category: 'Fitness', name: 'Adjustable Heavy-Duty Hand Grip Exerciser', price: 399, originalPrice: 799, rating: 4.7, image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&auto=format&fit=crop&q=60', desc: 'Resistance adjustable from 5kg to 60kg for wrist and forearm strength.', deliveryDays: 2 },
  { id: 'PROD-42', category: 'Fitness', name: 'Natural Latex Resistance Loop Bands', price: 499, originalPrice: 999, rating: 4.8, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=60', desc: 'Set of 5 varying resistance levels for yoga, pilates and muscle toning.', deliveryDays: 2 },
  { id: 'PROD-43', category: 'Fitness', name: 'Professional Skipping Jump Rope', price: 449, originalPrice: 899, rating: 4.5, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60', desc: 'Tangle-free steel wire with ball bearings and foam comfort handles.', deliveryDays: 3 },
  { id: 'PROD-44', category: 'Fitness', name: 'High-Density EVA Foam Roller', price: 999, originalPrice: 1999, rating: 4.6, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60', desc: 'Deep tissue muscle massage roller for physical therapy and back pain relief.', deliveryDays: 4 },
  { id: 'PROD-45', category: 'Fitness', name: 'Anti-Burst Gym Exercise Yoga Mat', price: 899, originalPrice: 1799, rating: 4.7, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=60', desc: '6mm thick anti-slip texture surface for comfortable floor workouts.', deliveryDays: 3 },
  { id: 'PROD-46', category: 'Fitness', name: 'Stainless Steel Gym Shaker Bottle', price: 599, originalPrice: 1199, rating: 4.5, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60', desc: 'Leakproof protein powder mixer bottle with blender wire whisk ball.', deliveryDays: 2 },
  { id: 'PROD-47', category: 'Fitness', name: 'Push-Up Board Multifunctional System', price: 1299, originalPrice: 2599, rating: 4.8, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=60', desc: 'Color-coded muscle targeted push-up stand for home chest and shoulder workouts.', deliveryDays: 4 },
  { id: 'PROD-48', category: 'Fitness', name: 'Ankle / Wrist Weights Adjustable Set', price: 1199, originalPrice: 2399, rating: 4.4, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60', desc: 'Secure velcro strap wearable weights for running, aerobics and endurance.', deliveryDays: 3 },
  { id: 'PROD-49', category: 'Fitness', name: 'Digital Smart Body Fat Weight Scale', price: 1499, originalPrice: 2999, rating: 4.6, image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=60', desc: 'Bluetooth body composition analyzer measuring BMI, muscle mass and bone density.', deliveryDays: 3 },
  { id: 'PROD-50', category: 'Fitness', name: 'Ergonomic Exercise Slidings Discs', price: 399, originalPrice: 799, rating: 4.3, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=60', desc: 'Dual-sided core sliders for carpet and hardwood floor abdominal training.', deliveryDays: 2 }
];

const OrderPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'ONLINE'
  const [submitting, setSubmitting] = useState(false);

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const [lastBagId, setLastBagId] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const getDeliveryDateString = (daysToAdd) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setIsCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const filteredProducts = ALL_PRODUCTS.filter(prod => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const bagDeposit = cart.length > 0 ? 50 : 0;
  const totalAmount = subtotal + bagDeposit;

  const saveOrderToFirestore = async (paymentStatus, paymentId = 'COD') => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bagId = `BAG-${randomNum}`;
    const orderId = `ORD-${randomNum + 500}`;
    
    const maxDays = Math.max(...cart.map(i => i.deliveryDays || 3));
    const deliveryDateStr = getDeliveryDateString(maxDays);

    const bagRef = doc(db, "bags", bagId);
    await setDoc(bagRef, {
      bagId: bagId,
      currentOrderId: orderId,
      items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
      totalPrice: totalAmount,
      customerName: customerName.trim(),
      deliveryAddress: address.trim(),
      customerPhone: phone.trim(),
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      paymentId: paymentId,
      status: "OUT_FOR_DELIVERY",
      customerDepositStatus: "PENDING",
      estimatedDelivery: deliveryDateStr,
      updatedAt: new Date().toISOString(),
      locationHistory: [
        { status: "OUT_FOR_DELIVERY", timestamp: new Date().toISOString() }
      ]
    });

    setLastBagId(bagId);
    setLastOrderId(orderId);
    setEstimatedDate(deliveryDateStr);
    setCart([]);
    setOrderPlaced(true);
    setSubmitting(false);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Aapka cart khali hai!");
    if (!customerName || !address || !phone) return alert("Kripya saari delivery details bharein!");

    setSubmitting(true);

    if (paymentMethod === 'ONLINE') {
      // Razorpay Payment Integration
      const options = {
        key: "rzp_test_YourTestKeyHere", // Replace with your Razorpay Test/Live Key ID
        amount: totalAmount * 100, // Amount in paisa
        currency: "INR",
        name: "LoopStore Ecosystem",
        description: "Sustainable Shopping + Reusable LoopPack Deposit",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=60",
        handler: async function (response) {
          alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
          await saveOrderToFirestore("PAID", response.razorpay_payment_id);
        },
        prefill: {
          name: customerName,
          email: "customer@loopstore.com",
          contact: phone
        },
        theme: {
          color: "#059669"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
        setSubmitting(false);
      });
      rzp1.open();
    } else {
      // Cash on Delivery
      await saveOrderToFirestore("PENDING", "COD");
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl text-center border border-gray-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Order Placed Successfully! 🎉</h2>
          <p className="text-gray-500 mt-2 text-sm">Aapka order pack ho chuka hai aur eco-friendly reusable LoopPack bag ke sath dispatch kar diya gaya hai.</p>
          
          <div className="bg-gray-50 p-4 rounded-2xl my-6 text-left space-y-2 border border-gray-200 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Order ID:</span> <span className="font-mono font-bold text-gray-800">{lastOrderId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Bag ID:</span> <span className="font-mono font-bold text-emerald-700">{lastBagId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Expected Delivery:</span> <span className="font-bold text-emerald-700">{estimatedDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Green Deposit:</span> <span className="font-semibold text-gray-800">₹50 (Refundable)</span></div>
          </div>

          <button 
            onClick={() => setOrderPlaced(false)}
            className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-semibold hover:bg-emerald-700 transition text-sm shadow-md"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-900 text-white py-14 px-6 text-center shadow-md mb-8 relative overflow-hidden">
        <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">Sustainable Shopping, Zero Plastic Waste</h1>
        <p className="text-emerald-100 text-sm max-w-2xl mx-auto">Explore 50+ premium real products delivered securely in trackable, reusable LoopPack boxes with automatic 10% return cashback.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2">
            {['All', 'Electronics', 'Fashion', 'Home', 'Fitness'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition whitespace-nowrap shadow-sm ${selectedCategory === cat ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input 
                type="text"
                placeholder="Search 50+ real products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-md transition hover:bg-emerald-800 text-sm whitespace-nowrap flex-shrink-0"
            >
              <ShoppingCart className="w-4 h-4" /> Cart 
              <span className="bg-white text-emerald-800 text-xs px-2 py-0.5 rounded-full font-mono font-black">
                {cart.reduce((acc, item) => acc + item.qty, 0)}
              </span>
            </button>
          </div>
        </div>

        {/* Product Grid with Real Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(prod => {
            const estDateStr = getDeliveryDateString(prod.deliveryDays);
            return (
              <div key={prod.id} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 group">
                <div className="h-52 bg-gray-100 overflow-hidden relative">
                  <span className="absolute top-3 left-3 z-10 text-[10px] font-extrabold bg-emerald-700 text-white px-3 py-1 rounded-full shadow">
                    {prod.category}
                  </span>
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-gray-900 text-base line-clamp-1">{prod.name}</h3>
                      <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex-shrink-0">
                        <Star className="w-3 h-3 fill-amber-500 mr-1"/> {prod.rating}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{prod.desc}</p>
                    
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl mb-4 border border-emerald-100">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0"/> Delivery by: <strong className="font-bold">{estDateStr}</strong>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-black text-gray-900">₹{prod.price}</span>
                      <span className="text-xs text-gray-400 line-through">₹{prod.originalPrice}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                    <button 
                      onClick={() => addToCart(prod)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart & Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" /> Your Cart ({cart.reduce((a,c)=>a+c.qty,0)})
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Aapka cart khali hai. Kuch products add karein!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-emerald-600 font-semibold mt-0.5">₹{item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-gray-200 shadow-sm">
                        <button onClick={() => updateQty(item.id, -1)} className="text-gray-500 hover:text-black"><Minus className="w-3.5 h-3.5"/></button>
                        <span className="text-xs font-bold px-1">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="text-gray-500 hover:text-black"><Plus className="w-3.5 h-3.5"/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <form onSubmit={handleCheckout} className="space-y-3">
                  <h4 className="font-bold text-sm text-gray-800">Delivery Information</h4>
                  <input 
                    type="text" 
                    placeholder="Full Name (e.g. Sardar)" 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <textarea 
                    placeholder="Delivery Address (e.g. JEC Jabalpur)" 
                    rows="2"
                    value={address} 
                    onChange={e => setAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  ></textarea>
                  <input 
                    type="tel" 
                    placeholder="Mobile Number (for tracking)" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />

                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${paymentMethod === 'COD' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                      >
                        <Banknote className="w-4 h-4" /> Cash on Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('ONLINE')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${paymentMethod === 'ONLINE' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                      >
                        <CreditCard className="w-4 h-4" /> Razorpay Online
                      </button>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600"><span>Subtotal:</span><span>₹{subtotal}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Reusable Bag Deposit:</span><span>₹50 (Refundable)</span></div>
                    <div className="flex justify-between font-bold text-gray-900 border-t border-emerald-200 pt-2 text-sm">
                      <span>Total Amount:</span>
                      <span className="text-emerald-700 font-black">₹{totalAmount}</span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? "Processing..." : paymentMethod === 'ONLINE' ? <>Pay ₹{totalAmount} with Razorpay <ArrowRight className="w-4 h-4"/></> : <>Place Order (COD) <ArrowRight className="w-4 h-4"/></>}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;