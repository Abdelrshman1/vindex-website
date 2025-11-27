import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Package, Info } from 'lucide-react';

const VindexPerfumeSystem = () => {
  const [perfumes, setPerfumes] = useState([]);
  const [filteredPerfumes, setFilteredPerfumes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);

  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyzQW-uc8aENAyheRcRsQ24negp-LUuoPiiW687mcrlYnskdQ4F8nb6MCeMDNnDdGw_/exec';

  useEffect(() => {
    fetchPerfumes();
  }, []);

  const fetchPerfumes = async () => {
    try {
      setLoading(true);
      const response = await fetch(SHEET_URL, { cache: 'no-cache' });
      const data = await response.json();
      
      const cleanedData = data.map(item => ({
        id: item.Name?.replace(/\s+/g, '_'),
        name: item.Name || '',
        type: item.Type || '',
        category: item.Category || '',
        price30ml: parseInt(item.Price_30ml) || 0,
        price50ml: parseInt(item.Price_50ml) || 0,
        price100ml: parseInt(item.Price_100ml) || 0,
        stock: parseInt(item.Stock) || 0,
        description: item.Description || '',
        notes: item.Notes || ''
      }));

      setPerfumes(cleanedData);
      setFilteredPerfumes(cleanedData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading perfumes:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = perfumes;

    if (selectedGender !== 'all') {
      filtered = filtered.filter(p => p.type.toLowerCase() === selectedGender);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPerfumes(filtered);
  }, [selectedGender, selectedCategory, searchTerm, perfumes]);

  const addToCart = (perfume, size) => {
    const priceKey = `price${size}ml`;
    const price = perfume[priceKey];
    
    if (perfume.stock <= 0) {
      alert('⚠️ هذا العطر غير متوفر حالياً');
      return;
    }

    const cartItem = {
      id: `${perfume.id}_${size}`,
      name: perfume.name,
      size: size,
      price: price,
      quantity: 1,
      perfume: perfume
    };

    const existingItem = cart.find(item => item.id === cartItem.id);
    
    if (existingItem) {
      if (existingItem.quantity >= perfume.stock) {
        alert(`⚠️ الكمية المتاحة فقط ${perfume.stock}`);
        return;
      }
      setCart(cart.map(item => 
        item.id === cartItem.id 
          ? {...item, quantity: item.quantity + 1}
          : item
      ));
    } else {
      setCart([...cart, cartItem]);
    }

    showNotification(`✅ تم إضافة ${perfume.name} (${size}ml) للسلة`);
  };

  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #D4AF37, #B8941F);
      color: #0A0A0A;
      padding: 1rem 2rem;
      border-radius: 10px;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        if (newQuantity > item.perfume.stock) {
          alert(`⚠️ الكمية المتاحة فقط ${item.perfume.stock}`);
          return item;
        }
        return {...item, quantity: newQuantity};
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      alert('⚠️ السلة فارغة!');
      return;
    }

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert('⚠️ برجاء إكمال جميع البيانات');
      return;
    }

    const orderDetails = cart.map(item => 
      `${item.name} (${item.size}ml) × ${item.quantity} = ${item.price * item.quantity} EGP`
    ).join('\n');

    const message = `
🎯 *طلب جديد - VINDEX*
━━━━━━━━━━━━━━━
👤 *بيانات العميل*
الاسم: ${customerInfo.name}
الهاتف: ${customerInfo.phone}
العنوان: ${customerInfo.address}

📦 *تفاصيل الطلب*
${orderDetails}

💰 *الإجمالي: ${getTotal()} EGP*
━━━━━━━━━━━━━━━
    `.trim();

    const whatsappUrl = `https://wa.me/201055741189?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setCart([]);
    setCustomerInfo({ name: '', phone: '', address: '' });
    setShowCart(false);
    alert('✅ تم إرسال الطلب بنجاح!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-yellow-500 text-xl font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .perfume-card {
          transition: all 0.3s ease;
        }
        .perfume-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(212, 175, 55, 0.3);
        }
        .category-badge {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1));
          border: 1px solid #D4AF37;
        }
        .size-option {
          transition: all 0.2s ease;
        }
        .size-option:hover:not(:disabled) {
          background: linear-gradient(135deg, #D4AF37, #B8941F);
          color: #0A0A0A;
          transform: scale(1.05);
        }
      `}</style>

      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-lg border-b border-yellow-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center font-bold text-black">
                V
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  VINDEX
                </h1>
                <p className="text-xs text-gray-400">Luxury Perfumes</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-3 rounded-full font-semibold text-black hover:scale-105 transition flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              السلة
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ابحث عن عطرك المفضل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="all">كل الأنواع</option>
              <option value="men's">رجالي</option>
              <option value="women's">نسائي</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="all">كل الفئات</option>
              <option value="classic">Classic</option>
              <option value="niche">Niche</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {filteredPerfumes.length === 0 ? (
          <div className="text-center py-20">
            <Filter size={64} className="mx-auto text-gray-600 mb-4" />
            <p className="text-xl text-gray-400">لا توجد عطور مطابقة للبحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPerfumes.map((perfume) => (
              <div
                key={perfume.id}
                className="perfume-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-yellow-500/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-yellow-500 mb-1">
                      {perfume.name}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className="category-badge text-xs px-3 py-1 rounded-full">
                        {perfume.category}
                      </span>
                      <span className="category-badge text-xs px-3 py-1 rounded-full">
                        {perfume.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Package size={16} />
                      <span>{perfume.stock} متوفر</span>
                    </div>
                  </div>
                </div>

                {perfume.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {perfume.description}
                  </p>
                )}

                {perfume.notes && (
                  <div className="mb-4 p-3 bg-black/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="text-yellow-500 mt-0.5" />
                      <p className="text-xs text-gray-400">{perfume.notes}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-300 mb-2">اختر الحجم:</p>
                  
                  {perfume.price30ml > 0 && (
                    <button
                      onClick={() => addToCart(perfume, 30)}
                      disabled={perfume.stock <= 0}
                      className="size-option w-full bg-gray-700/50 rounded-lg p-3 flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="font-semibold">30ml</span>
                      <span className="text-yellow-500 font-bold">{perfume.price30ml} EGP</span>
                    </button>
                  )}
                  
                  {perfume.price50ml > 0 && (
                    <button
                      onClick={() => addToCart(perfume, 50)}
                      disabled={perfume.stock <= 0}
                      className="size-option w-full bg-gray-700/50 rounded-lg p-3 flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="font-semibold">50ml</span>
                      <span className="text-yellow-500 font-bold">{perfume.price50ml} EGP</span>
                    </button>
                  )}
                  
                  {perfume.price100ml > 0 && (
                    <button
                      onClick={() => addToCart(perfume, 100)}
                      disabled={perfume.stock <= 0}
                      className="size-option w-full bg-gray-700/50 rounded-lg p-3 flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="font-semibold">100ml</span>
                      <span className="text-yellow-500 font-bold">{perfume.price100ml} EGP</span>
                    </button>
                  )}
                </div>

                {perfume.stock <= 0 && (
                  <div className="mt-3 bg-red-500/20 border border-red-500 rounded-lg p-2 text-center text-sm text-red-400">
                    غير متوفر حالياً
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowCart(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-500">سلة المشتريات</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={64} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">السلة فارغة</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-gray-800 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-yellow-500">{item.name}</h4>
                            <p className="text-sm text-gray-400">{item.size}ml</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 bg-gray-700 rounded-lg hover:bg-gray-600"
                            >
                              -
                            </button>
                            <span className="font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 bg-gray-700 rounded-lg hover:bg-gray-600"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-yellow-500 font-bold">
                            {item.price * item.quantity} EGP
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>الإجمالي:</span>
                      <span className="text-yellow-500">{getTotal()} EGP</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">الاسم الكامل</label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">رقم الهاتف</label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">عنوان التوصيل</label>
                      <textarea
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 resize-none"
                      />
                    </div>
                    
                    <button
                      onClick={handleSubmitOrder}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 py-4 rounded-xl font-bold text-white hover:scale-105 transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      إرسال الطلب عبر WhatsApp
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VindexPerfumeSystem;
