database.sql
CREATE DATABASE college;
USE college;

CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    age INT
);

INSERT INTO students VALUES
(1, 'Shruti', 20),
(2, 'Rahul', 21);

SELECT * FROM students;