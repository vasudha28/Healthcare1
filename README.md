# 🏥 Healthcare Patient Management System

> A secure, scalable, and user-friendly patient management solution for healthcare professionals

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens)](https://jwt.io/)

## ✨ Features

- 🔐 **JWT Authentication** - Role-based access (Doctor, Nurse, Admin)
- 👥 **Patient Management** - Complete CRUD operations
- 📊 **Analytics Dashboard** - Medical insights & visualizations
- 📱 **Responsive Design** - Works on all devices
- 🔍 **Advanced Search** - Filter patients by condition, department
- 📋 **Medical Records** - History, prescriptions, appointments

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB (Atlas or Local)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + Tailwind CSS |
| **Backend** | FastAPI + Python |
| **Database** | MongoDB |
| **Auth** | JWT Tokens |
| **Charts** | Chart.js |

## 📁 Project Structure

```
healthcare-system/
├── backend/
│   ├── main.py
│   ├── models/
│   ├── routes/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│   └── package.json
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URL=mongodb://localhost:27017
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/login` | User authentication |
| `GET` | `/api/patients` | Get all patients |
| `POST` | `/api/patients` | Create patient |
| `PUT` | `/api/patients/{id}` | Update patient |
| `DELETE` | `/api/patients/{id}` | Delete patient |
| `GET` | `/api/analytics` | Dashboard analytics |

## 🎯 Key Features

### Patient Management
- Add/Edit/Delete patient records
- Search and filter capabilities
- Medical history tracking
- Prescription management

### Analytics Dashboard
- Patients per medical condition
- Most prescribed medications
- Department-wise statistics
- Monthly visit trends

### Security
- JWT-based authentication
- Role-based access control
- Secure API endpoints
- Data validation

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Render/Railway)
```bash
gunicorn main:app
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

