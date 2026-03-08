ต้องลง Nodejs ด้วย

วิธีรันโปรเจกต์ (Run the Project)
คุณต้องเปิด Terminal 2 หน้าต่าง เพื่อรัน Backend และ Frontend พร้อมกัน

# Terminal 1 (Backend):

Bash
cd backend

# ติดตั้ง library (ทำแค่ครั้งแรก)

pip install -r requirements.txt

# รัน Server

uvicorn main:app --reload

รอจนขึ้นว่า Application startup complete.

# Terminal 2 (Frontend):

Bash
cd frontend

# ทำการติดตั้ง

npm install

npm install axios

npm install -D tailwindcss postcss autoprefixer

npx tailwindcss init -p

# รันหน้าเว็บ

npm run dev

ระบบจะบอก URL เช่น http://localhost:5173 ให้กดเข้าไปเล่นได้เลยครับ
