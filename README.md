# Student Grade Manager

A fullstack web application to manage student grades by class.

## Tech Stack
- Backend: Java, Spring Boot, Spring Data JPA
- Database: MySQL
- Frontend: HTML, CSS, JavaScript

## Features
- Create and manage class boxes
- Add, edit, delete students
- Search and sort by name or grade
- Color-coded grade badges
- Dark mode
- Average grade per class

## Setup
1. Clone the repo
2. Create MySQL database: `CREATE DATABASE gradedb;`
3. Update `src/main/resources/application.properties` with your MySQL password
4. Run: `mvn spring-boot:run`
5. Open: `http://localhost:8080`