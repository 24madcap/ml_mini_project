import { useState } from 'react';
import axios from 'axios';

function App() {
  // State สำหรับจัดการหน้าจอ (1=Form, 2=Loading, 3=Result)
  const [step, setStep] = useState(1);
  
  // ข้อมูลที่ user กรอก
  const [formData, setFormData] = useState({
    budget: 30000,
    portability: 5,
    gaming: 5,
    work_duration: 5
  });

  // เก็บผลลัพธ์สินค้า
  const [products, setProducts] = useState([]);

  // ฟังก์ชันอัปเดตค่าเมื่อเลื่อน Slider
  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: parseInt(e.target.value) 
    });
  };

  // ฟังก์ชันส่งข้อมูลไปหา Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep(2); // แสดงหน้า Loading
    
    try {
      // ยิง API ไปที่ Backend (Port 8000)
      const res = await axios.post('http://127.0.0.1:8000/recommend', formData);
      
      // รอแป๊บนึงเพื่อให้เห็น Loading (จำลองการคิด)
      setTimeout(() => {
        setProducts(res.data.data);
        setStep(3);
      }, 800);
      
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Server");
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
          ตอบคำถามสั้นๆ ให้ AI ช่วยเลือกโน้ตบุ๊กที่ใช่สำหรับคุณ
        </p>

        {/* STEP 1: แบบฟอร์มคำถาม */}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* คำถาม 1: งบประมาณ */}
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

            {/* คำถาม 2: พกพา */}
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

            {/* คำถาม 3: เล่นเกม */}
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

            {/* คำถาม 4: แบตเตอรี่ */}
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
                  
                  {/* แถบสีบอกคะแนนความแมตช์ */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>

                  {/* รูปจำลอง (ใช้ Placeholder) */}
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

export default App;