# Car Dealership Inventory System

A full-stack web application for managing a car dealership's vehicle inventory. The system provides authentication, vehicle management, and an admin interface for adding and managing vehicles, including vehicle image uploads.

## Features

* User registration and authentication
* Admin dashboard
* Add vehicles to inventory
* Upload vehicle images
* Vehicle management through REST APIs
* Automated backend tests
* Frontend interface for interacting with the system

## Tech Stack

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* Pytest

### Frontend

* React
* JavaScript
* HTML/CSS

### Development Tools

* Git & GitHub
* VS Code
* Swagger/OpenAPI
* ChatGPT

## Project Structure

```text
car-dealership-inventory/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── routes/
│   │       ├── auth.py
│   │       └── vehicles.py
│   │
│   └── tests/
│       └── test_vehicles.py
│
├── frontend/
│   └── ...
│
├── README.md
└── PROMPTS.md
```

## How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Sindhukanithi02/car-dealership-inventory-system.git
cd car-dealership-inventory-system
```

### 2. Backend Setup

Open a terminal and navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the URL displayed in the terminal.

## Testing

The backend test suite can be executed using:

```bash
python -m pytest tests/ -v
```

### Test Results

Add your **actual final test output/screenshot** here.

For example:

```text
========================= test session starts =========================
...
PASSED
PASSED
PASSED
...
========================= tests passed ================================
```

## Screenshots

### Login Page
<img width="1143" height="746" alt="image" src="https://github.com/user-attachments/assets/d36cc161-ca9d-441a-87fb-9a0db25b495a" />

### User Dashboard

<img width="1823" height="945" alt="image" src="https://github.com/user-attachments/assets/9d7cc058-f132-404f-bc3e-286460ac544e" />

 ### User Search and Filter Page
 
<img width="1508" height="941" alt="image" src="https://github.com/user-attachments/assets/4e96db05-e835-4dfb-b427-b471105847a4" />

### Admin Dashboard
<img width="1069" height="879" alt="image" src="https://github.com/user-attachments/assets/43b50fc2-6d90-48b2-b30d-46e062103ed5" />


### Vehicle Adding Form
<img width="1048" height="813" alt="image" src="https://github.com/user-attachments/assets/9b9b7d2f-f0d7-4916-99e6-4eebe727d468" />


### Vehicle Inventory
![Uploading image.png…]()


# My AI Usage

## AI Tools Used

I used **ChatGPT** as an AI assistant during the development of this project.

## How I Used AI

* Used ChatGPT to understand and debug **FastAPI and Python errors**.
* Used it for guidance while implementing **authentication and vehicle APIs**.
* Used it to improve the **frontend UI and vehicle adding form**, including the image upload option.

## Reflection on AI Usage

AI helped me save time while debugging and understanding unfamiliar concepts. I used ChatGPT mainly for guidance and problem-solving, then reviewed and tested the suggestions before using them in my project. It helped make the development process easier while allowing me to understand and implement the features myself.
