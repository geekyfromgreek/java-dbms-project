package com.student.dbms;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api")
public class MainController {

    @Autowired
    private DatabaseService db;

    // --- Helpers to build maps and normalize keys ---
    private static Map<String, Object> mapOf(Object... keyValues) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            map.put((String) keyValues[i], keyValues[i + 1]);
        }
        return map;
    }

    // Normalizes a list of maps to have lowercase keys (crucial for frontend compatibility)
    private List<Map<String, Object>> normalize(List<Map<String, Object>> list) {
        List<Map<String, Object>> normalizedList = new ArrayList<>();
        for (Map<String, Object> map : list) {
            Map<String, Object> normalizedMap = new LinkedHashMap<>();
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                normalizedMap.put(entry.getKey().toLowerCase(), entry.getValue());
            }
            normalizedList.add(normalizedMap);
        }
        return normalizedList;
    }

    private String getString(Map<String, Object> body, String key) {
        Object val = body.get(key);
        return val == null ? null : val.toString();
    }

    private long getLong(Map<String, Object> body, String key) {
        Object val = body.get(key);
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).longValue();
        try {
            return Long.parseLong(val.toString());
        } catch (Exception e) {
            return 0;
        }
    }

    // --- Student Endpoints ---
    @GetMapping("/students")
    public List<Map<String, Object>> getStudents() {
        return normalize(db.getAllStudents());
    }

    @PostMapping("/students")
    public ResponseEntity<?> addStudent(@RequestBody Map<String, Object> body) {
        try {
            long id = db.addStudent(getString(body, "name"), getString(body, "roll_number"));
            return ResponseEntity.ok(mapOf("id", id, "name", getString(body, "name"), "roll_number", getString(body, "roll_number")));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(mapOf("error", e.getMessage()));
        }
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable long id, @RequestBody Map<String, Object> body) {
        try {
            db.updateStudent(id, getString(body, "name"), getString(body, "roll_number"));
            return ResponseEntity.ok(mapOf("message", "Student updated successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(mapOf("error", e.getMessage()));
        }
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable long id) {
        try {
            db.deleteStudent(id);
            return ResponseEntity.ok(mapOf("message", "Student deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(mapOf("error", e.getMessage()));
        }
    }

    // --- Attendance Endpoints ---
    @GetMapping("/attendance")
    public List<Map<String, Object>> getAttendance() {
        return normalize(db.getAttendanceReport());
    }

    @PostMapping("/attendance")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> body) {
        try {
            db.markAttendance(
                    getLong(body, "student_id"),
                    getString(body, "date"),
                    getString(body, "status")
            );
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(mapOf("error", e.getMessage()));
        }
    }

    @PutMapping("/attendance/{id}")
    public ResponseEntity<?> updateAttendance(@PathVariable long id, @RequestBody Map<String, Object> body) {
        try {
            db.updateAttendance(id, getString(body, "status"), getString(body, "date"));
            return ResponseEntity.ok(mapOf("message", "Attendance updated successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(mapOf("error", e.getMessage()));
        }
    }

    @DeleteMapping("/attendance/{id}")
    public ResponseEntity<?> deleteAttendance(@PathVariable long id) {
        try {
            db.deleteAttendance(id);
            return ResponseEntity.ok(mapOf("message", "Attendance deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(mapOf("error", e.getMessage()));
        }
    }

    // --- Grade Endpoints ---
    @GetMapping("/grades")
    public List<Map<String, Object>> getGrades() {
        return normalize(db.getGrades());
    }

    @PostMapping("/grades")
    public ResponseEntity<?> addGrade(@RequestBody Map<String, Object> body) {
        try {
            db.addGrade(
                    getLong(body, "student_id"),
                    getString(body, "subject"),
                    (int) getLong(body, "marks")
            );
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(mapOf("error", e.getMessage()));
        }
    }

    @PutMapping("/grades/{id}")
    public ResponseEntity<?> updateGrade(@PathVariable long id, @RequestBody Map<String, Object> body) {
        try {
            db.updateGrade(
                    id,
                    getString(body, "subject"),
                    (int) getLong(body, "marks")
            );
            return ResponseEntity.ok(mapOf("message", "Grade updated successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(mapOf("error", e.getMessage()));
        }
    }

    @DeleteMapping("/grades/{id}")
    public ResponseEntity<?> deleteGrade(@PathVariable long id) {
        try {
            db.deleteGrade(id);
            return ResponseEntity.ok(mapOf("message", "Grade deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(mapOf("error", e.getMessage()));
        }
    }

    @GetMapping("/subjects")
    public List<String> getSubjects() {
        return db.getSubjects();
    }

    @GetMapping("/reports")
    public List<Map<String, Object>> getReports() {
        return normalize(db.getReports());
    }

    // --- AI Query ---
    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private static final Map<String, String> PREDEFINED_QUERIES = new HashMap<>();
    static {
        PREDEFINED_QUERIES.put("show all students", "SELECT * FROM students");
        PREDEFINED_QUERIES.put("students absent on 2026-04-14", "SELECT s.name, s.roll_number, a.date, a.status FROM students s JOIN attendance a ON s.id = a.student_id WHERE a.status = 'Absent' AND a.date = '2026-04-14'");
        PREDEFINED_QUERIES.put("average marks per subject", "SELECT subject, ROUND(AVG(marks), 2) as average_marks FROM grades GROUP BY subject");
        PREDEFINED_QUERIES.put("top 3 students by marks in dbms", "SELECT s.name, g.subject, g.marks FROM students s JOIN grades g ON s.id = g.student_id WHERE g.subject = 'DBMS' ORDER BY g.marks DESC LIMIT 3");
        PREDEFINED_QUERIES.put("who is the top student", "SELECT s.name, SUM(g.marks) as total_marks FROM students s JOIN grades g ON s.id = g.student_id GROUP BY s.id ORDER BY total_marks DESC LIMIT 1");
        PREDEFINED_QUERIES.put("show me the grading list", "SELECT s.name, g.subject, g.marks FROM students s JOIN grades g ON s.id = g.student_id ORDER BY s.name");
        PREDEFINED_QUERIES.put("attendance summary", "SELECT s.name, COUNT(a.id) as total_classes, SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as attended FROM students s LEFT JOIN attendance a ON s.id = a.student_id GROUP BY s.id");
    }

    private static final String DB_SCHEMA_CONTEXT =
            "You are a MySQL query generator. You MUST respond with ONLY a valid MySQL query - no explanations, no markdown, no code fences.\n\n" +
            "The database 'student_dbms' has these tables:\n\n" +
            "TABLE: students\n  - id INT AUTO_INCREMENT PRIMARY KEY\n  - name VARCHAR(100) NOT NULL\n  - roll_number VARCHAR(20) NOT NULL UNIQUE\n  - created_at TIMESTAMP\n\n" +
            "TABLE: attendance\n  - id INT AUTO_INCREMENT PRIMARY KEY\n  - student_id INT NOT NULL (FK -> students.id)\n  - date DATE NOT NULL\n  - status ENUM('Present', 'Absent') NOT NULL DEFAULT 'Present'\n  - created_at TIMESTAMP\n\n" +
            "TABLE: grades\n  - id INT AUTO_INCREMENT PRIMARY KEY\n  - student_id INT NOT NULL (FK -> students.id)\n  - subject VARCHAR(100) NOT NULL\n  - marks INT NOT NULL\n  - created_at TIMESTAMP\n\n" +
            "RULES:\n- Only generate SELECT queries.\n- Always use proper JOINs when data from multiple tables is needed.\n- Return ONLY the raw SQL query string.";

    @SuppressWarnings("unchecked")
    @PostMapping("/ai-query")
    public ResponseEntity<?> aiQuery(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(mapOf("error", "Please enter a question or SQL query."));
        }

        String normalizedPrompt = prompt.trim().toLowerCase();
        String sql = "";

        try {
            if (PREDEFINED_QUERIES.containsKey(normalizedPrompt)) {
                sql = PREDEFINED_QUERIES.get(normalizedPrompt);
            } else if (normalizedPrompt.startsWith("select ") || normalizedPrompt.startsWith("describe ")) {
                sql = prompt.trim();
            } else if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
                RestTemplate restTemplate = new RestTemplate();
                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                String escapedContent = (DB_SCHEMA_CONTEXT + "\n\nUser question: " + prompt)
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"")
                        .replace("\n", "\\n");

                String requestJson = "{\"contents\":[{\"parts\":[{\"text\":\"" + escapedContent + "\"}]}]}";

                HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);
                Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    sql = (String) parts.get(0).get("text");
                    sql = sql.replaceAll("```sql\\s*", "").replaceAll("```\\s*", "").trim();
                }
            } else {
                return ResponseEntity.badRequest().body(mapOf("error", "AI API key not configured and prompt didn't match a recommended query."));
            }

            if (sql.isEmpty()) {
                return ResponseEntity.badRequest().body(mapOf("error", "Could not generate a valid SQL query."));
            }

            String firstWord = sql.split("\\s+")[0].toUpperCase();
            if (!firstWord.equals("SELECT") && !firstWord.equals("SHOW") && !firstWord.equals("DESCRIBE") && !firstWord.equals("EXPLAIN")) {
                return ResponseEntity.badRequest().body(mapOf("error", "Only read queries (SELECT) are allowed for safety.", "sql", sql));
            }

            List<Map<String, Object>> results = db.executeRawSql(sql);
            return ResponseEntity.ok(mapOf("sql", sql, "results", normalize(results)));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(mapOf("error", e.getMessage(), "sql", sql));
        }
    }
}
