package com.student.dbms;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

@Service
public class DatabaseService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        try {
            // Initialize tables if they don't exist
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS students (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "roll_number VARCHAR(20) NOT NULL UNIQUE, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS attendance (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "student_id INT NOT NULL, " +
                    "date DATE NOT NULL, " +
                    "status ENUM('Present', 'Absent') NOT NULL DEFAULT 'Present', " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE)");

            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS grades (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "student_id INT NOT NULL, " +
                    "subject VARCHAR(100) NOT NULL, " +
                    "marks INT NOT NULL, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE)");
            System.out.println("✅ Database tables verified/created successfully.");
        } catch (Exception e) {
            System.err.println("❌ Database Initialization Error: " + e.getMessage());
        }
    }

    // Student Queries
    public List<Map<String, Object>> getAllStudents() {
        return jdbcTemplate.queryForList("SELECT * FROM students ORDER BY created_at DESC");
    }

    public long addStudent(String name, String rollNumber) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("INSERT INTO students (name, roll_number) VALUES (?, ?)", Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, name);
            ps.setString(2, rollNumber);
            return ps;
        }, keyHolder);
        
        Number key = keyHolder.getKey();
        return (key != null) ? key.longValue() : 0;
    }

    public void updateStudent(long id, String name, String rollNumber) {
        jdbcTemplate.update("UPDATE students SET name = ?, roll_number = ? WHERE id = ?", name, rollNumber, id);
    }

    public void deleteStudent(long id) {
        jdbcTemplate.update("DELETE FROM students WHERE id = ?", id);
    }

    // Attendance Queries
    public List<Map<String, Object>> getAttendanceReport() {
        // Changed student_name to name for frontend compatibility
        return jdbcTemplate.queryForList("SELECT a.*, s.name as name FROM attendance a JOIN students s ON a.student_id = s.id ORDER BY a.date DESC");
    }

    public void markAttendance(long studentId, String date, String status) {
        jdbcTemplate.update("INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)", studentId, date, status);
    }

    public void updateAttendance(long id, String status, String date) {
        jdbcTemplate.update("UPDATE attendance SET status = ?, date = ? WHERE id = ?", status, date, id);
    }

    public void deleteAttendance(long id) {
        jdbcTemplate.update("DELETE FROM attendance WHERE id = ?", id);
    }

    // Grade Queries
    public List<Map<String, Object>> getGrades() {
        // Changed student_name to name for frontend compatibility
        return jdbcTemplate.queryForList("SELECT g.*, s.name as name FROM grades g JOIN students s ON g.student_id = s.id ORDER BY s.name");
    }

    public void addGrade(long studentId, String subject, int marks) {
        jdbcTemplate.update("INSERT INTO grades (student_id, subject, marks) VALUES (?, ?, ?)", studentId, subject, marks);
    }

    public void updateGrade(long id, String subject, int marks) {
        jdbcTemplate.update("UPDATE grades SET subject = ?, marks = ? WHERE id = ?", subject, marks, id);
    }

    public void deleteGrade(long id) {
        jdbcTemplate.update("DELETE FROM grades WHERE id = ?", id);
    }

    public List<String> getSubjects() {
        return jdbcTemplate.queryForList("SELECT DISTINCT subject FROM grades", String.class);
    }

    // Report Queries
    public List<Map<String, Object>> getReports() {
        String sql = "SELECT s.id, s.name, s.roll_number, " +
                "COUNT(a.id) as total_days, " +
                "SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_days, " +
                "COALESCE(ROUND((SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / NULLIF(COUNT(a.id), 0)) * 100, 2), 0) as attendance_percentage, " +
                "(SELECT COALESCE(AVG(marks), 0) FROM grades WHERE student_id = s.id) as avg_marks, " +
                "(SELECT COUNT(id) FROM grades WHERE student_id = s.id) as subjects_count " +
                "FROM students s " +
                "LEFT JOIN attendance a ON s.id = a.student_id " +
                "GROUP BY s.id, s.name, s.roll_number";
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> executeRawSql(String sql) {
        return jdbcTemplate.queryForList(sql);
    }
}
