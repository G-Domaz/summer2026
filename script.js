// script.js

const scriptURL = "https://script.google.com/macros/s/AKfycbyY4Fdyo__fZRyG_vosyQq9PajqrDn3udgV_xTWleVMFfizLtm5ho99sI3f5DLpnH98jQ/exec";

function updateDepartments() {
  const level = document.getElementById("levelSelect").value;
  const dept = document.getElementById("departmentSelect");
  dept.innerHTML = "";
  if (level === "الأولى") {
    dept.innerHTML = '<option value="عامة">عامة</option>';
  } else if (["الثانية", "الثالثة", "الرابعة"].includes(level)) {
    dept.innerHTML = `
      <option value="فنادق">فنادق</option>
      <option value="إرشاد">إرشاد</option>`;
  }
}

function sheetName(level, dep) {
  if (level === "الأولى") return "الأولى";
  const lvl = { "الثانية": "2", "الثالثة": "3", "الرابعة": "4" }[level] || "";
  const d = { "فنادق": "ف", "إرشاد": "ش" }[dep] || "";
  return lvl + d;
}

function toggleSeatBox() {
  const box = document.getElementById('seatBox');
  box.style.display = (box.style.display === "block") ? "none" : "block";
}

async function getResult() {
  const roll = document.getElementById("seatNumber").value.trim();
  const national = document.getElementById("nationalInput").value.trim();
  const level = document.getElementById("levelSelect").value;
  const dep = document.getElementById("departmentSelect").value;
  const resultBox = document.getElementById("resultBox");

  if (!roll || !national || !level || !dep) {
    alert("يرجى استكمال جميع الحقول.");
    return;
  }

  const sheet = sheetName(level, dep);
  const url = `${scriptURL}?roll=${roll}&national=${national}&level=${encodeURIComponent(sheet)}`;

  resultBox.style.display = "block";
  resultBox.innerHTML = "جاري التحميل...";

  try {
    const response = await fetch(url);
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      let tableRows = "";
      data.subjects.forEach((sub) => {
        tableRows += `<tr><td>${sub.name}</td><td>${sub.score}</td><td>${sub.grade}</td></tr>`;
      });

      resultBox.innerHTML = `
        <h3>الاسم: ${data.name}</h3>
        <h4>المجموع الكلي: ${data.total}</h4>
        <h4>النسبة: ${data.percentage}%</h4>
        <h4>التقدير النهائي: ${data.finalGrade}</h4>
        <table>
          <tr><th>المادة</th><th>الدرجة</th><th>التقدير</th></tr>
          ${tableRows}
        </table>
        <hr>
        <h4>مادة التخلف ١:</h4>
        <p>${data.makeup1.name} - الدرجة: ${data.makeup1.score} - التقدير: ${data.makeup1.grade}</p>
        <h4>مادة التخلف ٢:</h4>
        <p>${data.makeup2.name} - الدرجة: ${data.makeup2.score} - التقدير: ${data.makeup2.grade}</p>
      `;
    } catch {
      resultBox.innerHTML = `<span style="color:red;">${text}</span>`;
    }
  } catch {
    resultBox.innerHTML = `<span style="color:red;">حدث خطأ أثناء الاتصال بالخادم.</span>`;
  }
}

async function showSeatInfo() {
  const nid = document.getElementById('nationalSearch').value.trim();
  const res = document.getElementById('seatResult');

  if (!nid) {
    res.innerHTML = '<span style="color:red;">أدخل الرقم القومي</span>';
    return;
  }

  res.innerHTML = "جاري البحث...";

  try {
    const response = await fetch(`${scriptURL}?national=${nid}`);
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.innerHTML = `رقم الجلوس: <strong>${data.roll}</strong><br>الاسم: <strong>${data.name || "غير متوفر"}</strong>`;
      document.getElementById("seatNumber").value = data.roll;
      document.getElementById("nationalInput").value = nid;
    } catch {
      res.innerHTML = `<span style="color:red;">${text}</span>`;
    }
  } catch {
    res.innerHTML = `<span style="color:red;">حدث خطأ أثناء الاتصال بالخادم.</span>`;
  }
}
