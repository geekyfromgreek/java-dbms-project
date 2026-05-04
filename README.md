# Student DBMS (Java Edition)

This is a converted version of the Student DBMS project, using **Java (Spring Boot + JDBC)** for the backend and **React** for the frontend.

## 🛠️ Requirements
- **Java 8** (installed)
- **MySQL Server** (running on localhost:3306)
- **Node.js** (for the frontend)

## 🚀 How to Run

### 1. Start the Java Backend
1. Open a terminal in `backend/`.
2. Run: `mvn spring-boot:run` 
   *(Note: If you don't have Maven installed, you can open the folder in IntelliJ IDEA or Eclipse and run `DbmsApplication.java`)*

### 2. Start the React Frontend
1. Open another terminal in `frontend/`.
2. Run: `npm run dev`

## 🗄️ Database Configuration
The backend is configured in `backend/src/main/resources/application.properties`:
- **DB Name**: `student_dbms`
- **User**: `root`
- **Password**: (empty)

The tables will be automatically created when the backend starts.
