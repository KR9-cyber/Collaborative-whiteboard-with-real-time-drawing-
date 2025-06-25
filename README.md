# 🖊️ Collaborative Whiteboard with Real-Time Drawing

## 📖 Project Description

This is a collaborative, real-time whiteboard app built with **React**, **Fabric.js**, and **Socket.IO**. It allows multiple users to draw, erase, and manipulate objects simultaneously.

Additional Features:

* ✅ Persistent drawings saved by Room ID using **Firebase Firestore**
* 👥 Real-time online user status using **Firebase Realtime Database**
* ⚡ Backend powered by **Node.js + Express + Socket.IO**
* 🌐 Deployed frontend (**Vercel**) and backend (**Render**)

Ideal for teaching, brainstorming, design meetings, and any collaborative drawing needs.

## ⚡ Features

* 🎨 Real-time drawing, erasing, and object manipulation
* 👥 Multiple user collaboration
* ♻️ Undo/Redo
* 🗂️ Export drawings as images or pdf
* 💾 Save and load drawings from Firestore
* 👥 Shows online status using Realtime Database
* 🌐 Responsive design
* 🚀 Deployed and publicly available

## 🛠️ Tech Stack

* **Frontend:** React, Fabric.js, Vite
* **Backend:** Node.js, Express, Socket.IO
* **Database:** Firestore (drawing persistence), Realtime Database (user status)
* **Deployment:** Backend (Render), Frontend (Vercel)

##  🚀 Deployed Demo Links

- **🌐 Frontend**: (https://collaborative-whiteboard-with-real-seven.vercel.app/)
- **⚡️ Backend**: (https://collaborative-whiteboard-with-real-time-a1jn.onrender.com/)

## ⚡️ How to Use the App

1. ✅ **Start the Backend**  
    - Ensure the backend is running.  
    - Either use the live link: (https://collaborative-whiteboard-with-real-time-a1jn.onrender.com)  

2. 🌐 **Open the Frontend**  
    - Use the live link: (https://collaborative-whiteboard-with-real-seven.vercel.app)  

3. 👥 **Create a Room**  
    - Enter a room ID or click **Create New Room**.
    - You’ll be prompted to **Enter Your Name**.

4. ✏️ **Start Collaborating**  
    - Begin drawing, adding text, or shapes.
    - Other connected participants will instantly **see your changes** and their **online status**.


## 🗺️ Project Architecture Diagram

```
User ---> Browser (React + Fabric.js) ---> WebSocket ---> Node.js (Express + Socket.IO) ---> All Connected Clients
           |
           |----------------> Firestore (Store Drawings by Room ID)  
           |----------------> Realtime DB (Online User Status)
```

## 📂 Project Structure

```
WHITEBOARD/
├─ server/
│  └─ index.js
│  └─ package.json
│  └─ package-lock.json
├─ src/
│  └─ lib/
│     └─ utils.js
├─ whiteboard-app/
│  └─ node_modules/
│  └─ public/
│     └─ vite.svg
│  └─ src/
│     └─ assets/
│     └─ components/
│        └─ CreateOrJoinRoom.jsx
│        └─ ShareModal.jsx
│        └─ Toolbar.jsx
│        └─ ToolButton.jsx
│        └─ Whiteboard.jsx
│     └─ pages/
│     └─ utils/
│        └─ firebase.js
│        └─ socket.js
│     └─ App.css
│     └─ App.jsx
│     └─ index.css
│     └─ main.jsx
├─ .gitignore
├─ components.json
├─ eslint.config.js
├─ index.html
├─ package.json
├─ package-lock.json
├─ vite.config.js
├─ vercel.json
├─ jsconfig.json
├─ README.md
```
![image](https://github.com/user-attachments/assets/296ae846-870e-43f5-90a6-8ecf11415e18)


## 💻 Setup Instructions to Run Locally

1️⃣ **Clone the Repository**

```bash
git clone https://github.com/KR9-cyber/Collaborative-whiteboard-with-real-time-drawing-.git
cd Collaborative-whiteboard-with-real-time-drawing-
```

2️⃣ **Install Dependencies**

* Backend:

  ```bash
  cd server && npm install
  ```
* Frontend:

  ```bash
  cd ../whiteboard-app && npm install
  ```

3️⃣ **Edit Firebase Configuration** in `whiteboard-app/src/utils/firebase.js`


```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "yourapp.firebaseapp.com",
  databaseURL: "https://yourapp.firebaseio.com",
  projectId: "yourapp",
  storageBucket: "yourapp.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
```


4️⃣ **Run the Server**:
`bash
    node index.js
    `
5️⃣ **Run the Frontend**:
`bash
    npm run dev
    `
✅ Done! Visit **[http://localhost:5173](http://localhost:5173)**.


## 🌟 Preview of the App

Here are some screenshots of the live application

🏁 **Landing Page** 

The starting point  where you can create a Room ID and invite collaborators. 
![image](https://github.com/user-attachments/assets/5a8cecbd-c079-48ab-88b3-2a7b5d8b5ac7)

🖥️ **Main Whiteboard Page**

This is where collaboration happens in real time:

👥 **Online Status** – Shows the list of connected participants

🎨 **Toolbar** – Provides drawing tools like pencil, shapes, text, and eraser

⚡ **Action Bar** – Buttons for Undo, Redo, Export, Clear Canvas, and more

🖌️ **Whiteboard** – The collaborative area where drawing, text, and shapes happen in real time

![image](https://github.com/user-attachments/assets/734f2680-55ea-4aac-a894-6023f28c21cc)

## 👤 Author

**Kritagya Agrawal**  
Chemical Engineering, Enrollment Number: 23112052

## 📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
