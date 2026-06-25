  const api = "http://localhost:8080/api/students";
    let allStudents = [];
    let classes = JSON.parse(localStorage.getItem("classes") || "[]");

    async function loadStudents() {
      const res = await fetch(api);
      allStudents = await res.json();
      renderAllCards();
    }

    function saveClasses() {
      localStorage.setItem("classes", JSON.stringify(classes));
    }

    function createClass() {
      const input = document.getElementById("className");
      const name = input.value.trim();
      if (!name) return;
      if (classes.find(c => c.name === name)) return alert("Class already exists!");
      classes.push({ id: Date.now(), name });
      saveClasses();
      input.value = "";
      renderAllCards();
    }

    function deleteClass(classId) {
      if (!confirm("Delete this class? Students stay in the database.")) return;
      classes = classes.filter(c => c.id !== classId);
      saveClasses();
      renderAllCards();
    }

    function getClassStudents(className, students, search = "", sort = "") {
      let result = students.filter(s => s.subject === className);
      if (search) result = result.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
      if (sort === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name));
      else if (sort === "name-desc") result.sort((a, b) => b.name.localeCompare(a.name));
      else if (sort === "grade-asc") result.sort((a, b) => a.grade - b.grade);
      else if (sort === "grade-desc") result.sort((a, b) => b.grade - a.grade);
      return result;
    }

    function getBadge(grade) {
      if (grade >= 75) return `<span class="badge badge-high">${grade}</span>`;
      if (grade >= 50) return `<span class="badge badge-mid">${grade}</span>`;
      return `<span class="badge badge-low">${grade}</span>`;
    }

    function renderAllCards() {
      const grid = document.getElementById("classesGrid");
      const empty = document.getElementById("emptyState");

      if (classes.length === 0) {
        grid.innerHTML = '<div class="empty-state" id="emptyState">No classes yet. Create one above ☝️</div>';
        return;
      }

      grid.innerHTML = classes.map(cls => `
        <div class="class-card" id="card-${cls.id}">
          <div class="card-header">
            <span class="card-title">${cls.name}</span>
            <button class="btn-delete-class" onclick="deleteClass(${cls.id})" title="Delete class">delete</button>
          </div>

          <div class="add-student-row">
            <input id="sname-${cls.id}" placeholder="Name" />
            <input id="sgrade-${cls.id}" placeholder="Grade" type="number" min="0" max="100" style="max-width:80px" />
            <button class="btn-add" onclick="addStudent(${cls.id}, '${cls.name}')">Add</button>
          </div>

          <div class="sort-search-row">
            <input placeholder="Search..." oninput="refreshCard(${cls.id},'${cls.name}',this.value, document.getElementById('sort-${cls.id}').value)" id="search-${cls.id}" />
            <select id="sort-${cls.id}" onchange="refreshCard(${cls.id},'${cls.name}', document.getElementById('search-${cls.id}').value, this.value)">
              <option value="">Sort...</option>
              <option value="name-asc">Name A→Z</option>
              <option value="name-desc">Name Z→A</option>
              <option value="grade-asc">Grade ↑</option>
              <option value="grade-desc">Grade ↓</option>
            </select>
          </div>

          <table>
            <thead><tr>
              <th>Name</th><th>Grade</th><th>Actions</th>
            </tr></thead>
            <tbody id="tbody-${cls.id}">
              ${renderRows(cls.name)}
            </tbody>
          </table>

          <div class="card-footer" id="footer-${cls.id}">
            ${getFooter(cls.name)}
          </div>
        </div>
      `).join("");
    }

    function renderRows(className, search = "", sort = "") {
      const students = getClassStudents(className, allStudents, search, sort);
      if (students.length === 0) return `<tr><td colspan="3" class="no-data">No students yet</td></tr>`;
      return students.map(s => `
        <tr id="row-${s.id}">
          <td>${s.name}</td>
          <td>${getBadge(s.grade)}</td>
          <td>
            <button class="action-btn" onclick="editStudent(${s.id},'${s.name}',${s.grade},'${className}')" title="Edit">edit</button>
            <button class="action-btn" onclick="deleteStudent(${s.id})" title="Delete">delete</button>
          </td>
        </tr>
      `).join("");
    }

    function getFooter(className) {
      const students = getClassStudents(className, allStudents);
      if (students.length === 0) return "";
      const avg = (students.reduce((sum, s) => sum + s.grade, 0) / students.length).toFixed(1);
      return `${students.length} student(s) &nbsp;|&nbsp; Avg grade: <b>${avg}</b>`;
    }

    function refreshCard(classId, className, search, sort) {
      document.getElementById(`tbody-${classId}`).innerHTML = renderRows(className, search, sort);
      document.getElementById(`footer-${classId}`).innerHTML = getFooter(className);
    }

    async function addStudent(classId, className) {
      const name = document.getElementById(`sname-${classId}`).value.trim();
      const grade = document.getElementById(`sgrade-${classId}`).value;
      if (!name || !grade) return alert("Enter name and grade!");
      await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject: className, grade })
      });
      document.getElementById(`sname-${classId}`).value = "";
      document.getElementById(`sgrade-${classId}`).value = "";
      await loadStudents();
    }

    async function deleteStudent(id) {
      if (!confirm("Delete this student?")) return;
      await fetch(`${api}/${id}`, { method: "DELETE" });
      await loadStudents();
    }

    function editStudent(id, name, grade, className) {
      const row = document.getElementById(`row-${id}`);
      row.innerHTML = `
        <td><input id="en-${id}" value="${name}" style="width:100%;padding:4px;border:1px solid #ddd;border-radius:4px" /></td>
        <td><input id="eg-${id}" type="number" value="${grade}" style="width:70px;padding:4px;border:1px solid #ddd;border-radius:4px" /></td>
        <td>
          <button class="action-btn" onclick="saveStudent(${id},'${className}')">Save</button>
          <button class="action-btn" onclick="loadStudents()">Cancel</button>
        </td>`;
    }

    async function saveStudent(id, className) {
      const name = document.getElementById(`en-${id}`).value.trim();
      const grade = document.getElementById(`eg-${id}`).value;
      await fetch(`${api}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject: className, grade })
      });
      await loadStudents();
    }

    function toggleDark() {
      document.body.classList.toggle("dark");
      document.querySelector(".dark-toggle").textContent =
        document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
    }

    loadStudents();