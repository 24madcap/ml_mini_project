import { useState } from 'react';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep(2); // โชว์หน้า Loading

    try {
      // 🔗 *** ใส่ลิงก์ URL ของ Render.com ที่นี่ ***
      const API_URL = "https://ai-laptop-backend.onrender.com/recommend";

      // ส่งข้อมูลไปให้ Backend ประมวลผล
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }

      const result = await response.json();
      
      // รับข้อมูลที่ AI จัดอันดับแล้วมาแสดงผล
      if (result.status === "success") {
        setProducts(result.data);
        setStep(3);
      }
      
    } catch (error) {
      console.error(error);
      alert("❌ เชื่อมต่อ AI Backend ไม่สำเร็จ (หากเพิ่งรันเซิร์ฟเวอร์ฟรี อาจต้องรอ 1-2 นาทีให้เซิร์ฟเวอร์ตื่น แล้วกดค้นหาใหม่ครับ)");
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
          AI Laptop Finder 💻
        </h1>
        <p className="text-center text-gray-500 mb-8">
          ตอบคำถามสั้นๆ ให้ AI ช่วยเลือกโน้ตบุ๊กที่ใช่สำหรับคุณ (Full-Stack Version)
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
              🔍 ส่งให้ AI วิเคราะห์
            </button>
          </form>
        )}

        {/* STEP 2: Loading Animation */}
        {step === 2 && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">ส่งข้อมูลไปยังเซิร์ฟเวอร์...</h2>
            <p className="text-gray-400">กำลังใช้ AI คำนวณแบบ Real-time</p>
          </div>
        )}

        {/* STEP 3: ผลลัพธ์ */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">ผลลัพธ์จาก AI:</h2>
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