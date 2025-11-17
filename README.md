# StudAI

[![React](https://img.shields.io/badge/React-v18.2-blue?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.104-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-v3.12-blue?logo=python)](https://www.python.org/)
[![Vite](https://img.shields.io/badge/Vite-v4.4-purple?logo=vite)](https://vitejs.dev/)

The StudAI Assistant is a full-stack web application designed to provide users with a suite of AI-powered tools for career development and personal wellness, featuring a unique, noir-themed "orbital" user interface.



## ✨ Core Features

*   **Secure User Authentication:** Full registration and login system using JWT (JSON Web Tokens).
*   **Mock Interview Coach:** An interactive chat where users can practice interview questions and receive AI-generated feedback in real-time.
*   **Smart Resume Analyzer:** Allows users to upload a resume (PDF/DOCX) and receive an ATS compatibility score and actionable recommendations.
*   **Wellness Companion:** A journaling tool that provides a compassionate, AI-generated reflection based on a user's written thoughts.
*   **Smart To-Do Maker:** An AI tool that converts unstructured text or goals into a prioritized and structured to-do list.
*   **Speech-to-Text Input:** Microphone support in all text areas for hands-free prompt writing, powered by the browser's Web Speech API.
*   **Persistent User Context:** All conversation histories are automatically saved to the user's account in the database, allowing them to continue their work across sessions.

## 🛠️ Technology Stack

| Area              | Technology                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Frontend**      | React 18, Vite, Tailwind CSS, Framer Motion, React Icons                                                      |
| **Backend**       | Python 3.12, FastAPI, Uvicorn                                                                                 |
| **Database**      | SQLite (for development) with SQLAlchemy as the ORM                                                           |
| **Authentication**| `passlib[bcrypt]` for password hashing, `python-jose` for JWT management                                        |
| **AI Engine**     | Google Gemini (`gemini-1.0-pro`) via the `google-generativeai` SDK                                                |
| **File Handling** | `python-docx` for `.docx` files, `PyPDF2` for `.pdf` files                                                      |
| **Environment**   | Python Virtual Environment (`venv`), Node.js                                                                  |

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

*   **Python 3.10+**
*   **Node.js v18+** and **npm**
*   **Git** installed on your machine
*   A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).

### ⚙️ Backend Setup

1.  **Navigate to the Backend Directory:**
    ```sh
    cd backend
    ```

2.  **Create and Activate a Virtual Environment:**
    *   **Windows:**
        ```sh
        python -m venv venv
        .\venv\Scripts\activate
        ```
    *   **Mac/Linux:**
        ```sh
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  **Set Up Environment Variables:**
    *   Create a copy of the example environment file. In your terminal, run:
        ```sh
        copy .env.example .env
        ```
    *   Open the new `.env` file and add your secret keys. It must contain:
        ```ini
        DATABASE_URL="sqlite:///./app.db"
        JWT_SECRET="YOUR_OWN_SUPER_SECRET_RANDOM_STRING_HERE"
        GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY_HERE"
        ```

4.  **Install Dependencies:**
    ```sh
    pip install -r requirements.txt
    ```

5.  **Run the Server:**
    ```sh
    uvicorn main:app --reload
    ```
    The backend API will now be running on `http://127.0.0.1:8000`.

### 🎨 Frontend Setup

1.  **Open a new, separate terminal.**

2.  **Navigate to the Frontend Directory:**
    ```sh
    cd frontend
    ```

3.  **Install Dependencies:**
    ```sh
    npm install
    ```

4.  **Run the Development Server:**
    ```sh
    npm run dev
    ```
    The frontend application will now be running on `http://localhost:5173`. Open this URL in your browser to use the application.

## 📁 Project Structure

The project uses a standard monorepo structure with a clear separation between the `frontend` and `backend` applications.

```
/
├── backend/
│   ├── main.py           # FastAPI app entry point
│   ├── app/              # Core application package
│   │   ├── api.py        # AI service routes
│   │   ├── auth.py       # Authentication helpers
│   │   ├── db.py         # Database setup
│   │   ├── models.py     # SQLAlchemy DB models
│   │   ├── routers/      # Route definitions (users.py)
│   │   ├── schemas.py    # Pydantic data schemas
│   │   └── services.py   # Gemini API logic
│   ├── prompts/          # Prompt templates for the AI
│   ├── .env.example      # Environment variable template
│   └── requirements.txt  # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable React components
    │   ├── context/      # Global state (AuthProvider)
    │   ├── hooks/        # Custom React hooks (useSpeechRecognition)
    │   ├── pages/        # Main view components (ChatView, etc.)
    │   └── App.jsx       # Main application layout and routing
    ├── index.html        # SPA entry point
    └── package.json      # Node.js dependencies
```