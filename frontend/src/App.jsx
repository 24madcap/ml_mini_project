import { useState } from 'react';

// 1. ฐานข้อมูลสินค้า (ย้ายจาก CSV มาไว้ที่นี่เลย และแก้เลขราคาแล้วครับ)
const productsData = [
  { id: 1, name: "MacBook Air M2", price: 34900, weight: 1.24, gaming_score: 3, battery_score: 10, image_url: "/images/mac.png" },
  { id: 2, name: "ASUS TUF Gaming F15", price: 29990, weight: 2.30, gaming_score: 9, battery_score: 5, image_url: "/images/tuf.png" },
  { id: 3, name: "Lenovo Legion 5", price: 38990, weight: 2.40, gaming_score: 9, battery_score: 4, image_url: "/images/legion.png" },
  { id: 4, name: "Dell XPS 13 Plus", price: 55000, weight: 1.23, gaming_score: 2, battery_score: 8, image_url: "/images/xps.png" },
  { id: 5, name: "Acer Swift Go 14", price: 23990, weight: 1.25, gaming_score: 3, battery_score: 7, image_url: "/images/swift.jpg" },
  { id: 6, name: "HP Victus 16", price: 32900, weight: 2.46, gaming_score: 8, battery_score: 5, image_url: "/images/victus.jpg" },
  { id: 7, name: "MSI Katana 15", price: 35990, weight: 2.25, gaming_score: 9, battery_score: 4, image_url: "/images/katana.png" },
  { id: 8, name: "ACER PREDATOR HELIOS NEO 16S", price: 55990, weight: 2.30, gaming_score: 10, battery_score: 3, image_url: "/images/helios.jpg" }, // แก้พาธและราคาตัวนี้แล้วครับ
  { id: 9, name: "Lenovo Yoga Slim 7", price: 31990, weight: 1.17, gaming_score: 3, battery_score: 8, image_url: "/images/yoga.png" },
  { id: 10, name: "ROG Strix G16", price: 59990, weight: 2.50, gaming_score: 10, battery_score: 4, image_url: "/images/strix.png" } // แก้ราคาตัวนี้แล้วครับ (ห้ามมีลูกน้ำ)
];

// ฟังก์ชันหาค่า Min/Max สำหรับปรับสเกลข้อมูล (Normalize)
const getMinMax = (key) => {
  const values = productsData.map(p => p[key]);
  return { min: Math.min(...values), max: Math.max(...values) };
};

const bounds = {
  price: getMinMax('price'),
  weight: getMinMax('weight'),
  gaming: getMinMax('gaming_score'),
  battery: getMinMax('battery_score')
};

// ฟังก์ชันแปลงสเกลให้เป็น 0 ถึง 1
const normalize = (val, min, max) => (max === min ? 0 : (val - min) / (max - min));

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    budget: 30000,
    portability: 5,
    gaming: 5,
    work_duration: 5
  });
  const [products, setProducts] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(2); // โชว์ Loading

    // 2. เริ่มการคำนวณแบบ AI (ย้ายจาก Python มาคำนวณใน JS)
    setTimeout(() => {
      const estimatedWeight = 3.0 - (formData.portability * 0.2);
      
      // สเปคที่ User อยากได้ (แปลงเป็นสเกล 0-1)
      const userVector = {
        price: normalize(formData.budget, bounds.price.min, bounds.price.max),
        weight: normalize(estimatedWeight, bounds.weight.min, bounds.weight.max),
        gaming: normalize(formData.gaming, bounds.gaming.min, bounds.gaming.max),
        battery: normalize(formData.work_duration, bounds.battery.min, bounds.battery.max)
      };

      // เทียบกับโน้ตบุ๊กทุกเครื่อง
      const scoredProducts = productsData.map(product => {
        const pVector = {
          price: normalize(product.price, bounds.price.min, bounds.price.max),
          weight: normalize(product.weight, bounds.weight.min, bounds.weight.max),
          gaming: normalize(product.gaming_score, bounds.gaming.min, bounds.gaming.max),
          battery: normalize(product.battery_score, bounds.battery.min, bounds.battery.max)
        };

        // หาระยะห่าง (Euclidean Distance)
        const distance = Math.sqrt(
          Math.pow(userVector.price - pVector.price, 2) +
          Math.pow(userVector.weight - pVector.weight, 2) +
          Math.pow(userVector.gaming - pVector.gaming, 2) +
          Math.pow(userVector.battery - pVector.battery, 2)
        );

        // คำนวณ % Match (สูตรใหม่ ป้องกัน 0% และดูสมจริงขึ้น)
        const rawScore = (1 - (distance / 2)) * 100;
        const matchScore = Math.max(0, Math.min(100, rawScore));

        return { ...product, match_score: matchScore.toFixed(1), distance };
      });

      // เรียงลำดับจากระยะห่างน้อยสุด (ใกล้เคียงสุด) ไปหามากสุด แล้วตัดเอาแค่ 3 อันดับแรก
      scoredProducts.sort((a, b) => a.distance - b.distance);
      const top3 = scoredProducts.slice(0, 3);

      setProducts(top3);
      setStep(3); // โชว์ผลลัพธ์
    }, 1000); // ดีเลย์ 1 วินาทีให้ดูเหมือน AI กำลังคิด
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
          AI Laptop Finder 💻
        </h1>
        <p className="text-center text-gray-500 mb-8">
          ตอบคำถามสั้นๆ ให้ AI ช่วยเลือกโน้ตบุ๊กที่ใช่สำหรับคุณ
        </p>

        {/* STEP 1: แบบฟอร์มคำถาม */}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex justify-between font-semibold text-gray-700 mb-2">
                <span>งบประมาณสูงสุด</span>
                <span className="text-indigo-600">{formData.budget.toLocaleString()} บาท</span>
              </label>
              <input 
                type="range" name="budget" min="15000" max="60000" step="1000"
                value={formData.budget} onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">เน้นพกพาบ่อยแค่ไหน?</label>
              <input 
                type="range" name="portability" min="1" max="10"
                value={formData.portability} onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>ตั้งโต๊ะถาวร</span><span>พกทุกวัน</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">เล่นเกมหนักแค่ไหน?</label>
              <input 
                type="range" name="gaming" min="1" max="10"
                value={formData.gaming} onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>พิมพ์งาน/ดูหนัง</span><span>ระดับ AAA / ตัดต่อ</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">ใช้งานนอกสถานที่ (ไม่เสียบปลั๊ก)</label>
              <input 
                type="range" name="work_duration" min="1" max="10"
                value={formData.work_duration} onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>เสียบปลั๊กตลอด</span><span>ใช้งานทั้งวัน</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition duration-200 shadow-lg mt-4">
              🔍 ค้นหาคำตอบด้วย AI
            </button>
          </form>
        )}

        {/* STEP 2: Loading Animation */}
        {step === 2 && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">AI กำลังวิเคราะห์ข้อมูล...</h2>
            <p className="text-gray-400">เปรียบเทียบจากฐานข้อมูลสินค้า</p>
          </div>
        )}

        {/* STEP 3: ผลลัพธ์ */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">ผลลัพธ์ที่แนะนำ:</h2>
              <button onClick={() => setStep(1)} className="text-sm text-indigo-600 underline hover:text-indigo-800">
                ค้นหาใหม่
              </button>
            </div>

            <div className="space-y-4">
              {products.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition bg-white items-center relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>

                  {/* แสดงรูปภาพ */}
                  <div className="w-24 h-24 flex-shrink-0 relative">
                    <img 
                      src={item.image_url || "https://placehold.co/150x150?text=No+Image"} 
                      alt={item.name} 
                      className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                        {item.match_score}% Match
                      </span>
                    </div>
                    <p className="text-indigo-600 font-bold text-lg">฿{item.price.toLocaleString()}</p>
                    
                    <div className="flex gap-2 mt-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">หนัก {item.weight} kg</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">Game: {item.gaming_score}/10</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">Batt: {item.battery_score}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}