from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler
import os

app = FastAPI()

# --- Config CORS (เพื่อให้ Frontend React คุยกับ Backend ได้) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ใน Production ควรระบุ domain จริง
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL VARIABLES สำหรับเก็บโมเดลและข้อมูล ---
model = None
scaler = None
df = None
feature_columns = ['price', 'weight', 'gaming_score', 'battery_score']

# --- 1. ฟังก์ชันโหลดข้อมูลและ Train Model ---
@app.on_event("startup")
def load_data_and_train_model():
    global model, scaler, df
    
    # อ่านไฟล์ CSV (เช็ค path ให้ถูกต้อง)
    current_dir = os.path.dirname(os.path.realpath(__file__))
    csv_path = os.path.join(current_dir, "data", "products.csv")
    
    print(f"Loading data from: {csv_path}")
    df = pd.read_csv(csv_path)

    # เตรียมข้อมูลสำหรับ Train (X)
    X = df[feature_columns]

    # ปรับสเกลข้อมูลให้อยู่ในช่วง 0-1 (Normalization)
    # เพราะราคา (หลักหมื่น) จะมีผลมากกว่าคะแนน (หลักหน่วย) ถ้าไม่ปรับ
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    # สร้างโมเดล KNN (ค้นหาเพื่อนบ้านที่ใกล้ที่สุด 3 อันดับ)
    model = NearestNeighbors(n_neighbors=3, metric='euclidean')
    model.fit(X_scaled)
    print("Model trained successfully!")

# --- 2. รูปแบบข้อมูลที่รับจากหน้าเว็บ (Data Model) ---
class UserPreferences(BaseModel):
    budget: float       # งบประมาณ
    portability: int    # ความสำคัญเรื่องพกพา (1-10)
    gaming: int         # เน้นเล่นเกม (1-10)
    work_duration: int  # เน้นแบตเตอรี่ (1-10)

# --- 3. API Endpoint สำหรับการค้นหา ---
@app.post("/recommend")
def recommend(prefs: UserPreferences):
    global model, scaler, df

    # แปลงค่าจากความชอบ (Preference) เป็น Feature ของสินค้า
    # Logic:
    # - Portability (ความพกพาง่าย) 10 คะแนน = น้ำหนักน้อย (ประมาณ 1.0 kg)
    # - Portability 1 คะแนน = น้ำหนักเยอะได้ (ประมาณ 3.0 kg)
    estimated_weight = 3.0 - (prefs.portability * 0.2)
    
    # สร้าง Vector ของผู้ใช้ [ราคา, น้ำหนัก, เกม, แบต]
    user_vector = np.array([[
        prefs.budget,
        estimated_weight,
        prefs.gaming,
        prefs.work_duration
    ]])

    # ปรับสเกล Vector ของผู้ใช้ให้เหมือนกับที่ Train โมเดล
    user_vector_scaled = scaler.transform(user_vector)

    # ให้ AI คำนวณหาระยะห่างและ Index ของสินค้าที่ใกล้ที่สุด
    distances, indices = model.kneighbors(user_vector_scaled)

    # ดึงข้อมูลสินค้าตาม Index ที่ได้
    recommended_products = []
    
    # indices[0] คือ list ของ index สินค้าที่ใกล้ที่สุด
    # distances[0] คือค่าความห่าง (ยิ่งน้อยยิ่งเหมือน)
    # ... (โค้ดก่อนหน้า)
    for i, idx in enumerate(indices[0]):
        product = df.iloc[idx].to_dict()
        
        # --- เปลี่ยนสูตรคำนวณเปอร์เซ็นต์ตรงนี้ ---
        # ระยะห่างสูงสุดใน Normalize Data (4 มิติ) จะอยู่ที่ไม่เกิน 2.0
        # เราจึงเอา (1 - (ระยะห่าง / 2)) * 100 เพื่อให้ได้เปอร์เซ็นต์ที่สมจริงขึ้น
        raw_score = (1 - (distances[0][i] / 2)) * 100
        match_score = max(0, min(100, raw_score)) # บังคับให้อยู่ในช่วง 0-100%
        
        product['match_score'] = round(match_score, 1)
        recommended_products.append(product)

    return {"status": "success", "data": recommended_products}