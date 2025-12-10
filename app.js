let currentQuestions = [];
let currentIndex = 0;
let answers = [];
let currentSet = "";

function showPage(pageId) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function startScreening(setName) {
  currentSet = setName;
  currentQuestions = shuffleArray([...QUESTIONS[setName]]);
  currentIndex = 0;
  answers = new Array(currentQuestions.length).fill(null);
  showQuestion();
  showPage("screening");
}

function showQuestion() {
  const q = currentQuestions[currentIndex];
  document.getElementById("questionNumber").innerText = `${currentIndex + 1}/${currentQuestions.length}`;
  document.getElementById("questionText").innerText = q;

  const form = document.getElementById("questionForm");
  form.innerHTML = "";

  // กำหนดตัวเลือกตามชุดแบบทดสอบ
  let choices;
  if (currentSet === "ST5") {
    choices = [
      { value: 0, text: "เป็นน้อยมากหรือแทบไม่มี" },
      { value: 1, text: "เป็นบางครั้ง" },
      { value: 2, text: "เป็นบ่อยครั้ง" },
      { value: 3, text: "เป็นประจำ" }
    ];
  } else {
    // ใช้รูปแบบตามภาพที่อ้างอิงสำหรับ PHQ‑9 / WHO‑5
    choices = [
      { value: 0, text: "ไม่มีเลย" },
      { value: 1, text: "เป็นบางวัน 1–7 วัน" },
      { value: 2, text: "เป็นบ่อย >7 วัน" },
      { value: 3, text: "เป็นทุกวัน" }
    ];
  }

  choices.forEach(c => {
    const label = document.createElement("label");
    label.className = "choice";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = c.value;
    if (answers[currentIndex] === c.value) input.checked = true;
    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + c.text));
    form.appendChild(label);
  });
}

function nextQuestion() {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) {
    alert("กรุณาเลือกคำตอบก่อน");
    return;
  }
  answers[currentIndex] = parseInt(selected.value, 10);

  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    calculateResult();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
}

function calculateResult() {
  const total = answers.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0);

  let summaryTitle = "";
  let tableHTML = "";
  let advice = "";
  let summaryLine = "";

  if (currentSet === "PHQ9") {
    // ตารางผลแบบตามภาพที่อ้างอิง
    summaryTitle = "การแปลผลคะแนนรวม (PHQ‑9)";
    if (total < 7) summaryLine = "ไม่มีอาการของโรคซึมเศร้า หรือมีอาการระดับน้อยมาก";
    else if (total <= 12) summaryLine = "มีอาการของโรคซึมเศร้า ระดับน้อย";
    else if (total <= 18) summaryLine = "มีอาการของโรคซึมเศร้า ระดับปานกลาง";
    else summaryLine = "มีอาการของโรคซึมเศร้า ระดับรุนแรง";

    tableHTML = `
      <tr><th>คะแนนรวม</th><th>การแปลผล</th></tr>
      <tr${total < 7 ? ' style="background:#f3e9df"' : ''}><td>&lt; 7</td><td>ไม่มีอาการของโรคซึมเศร้า หรือมีอาการระดับน้อยมาก</td></tr>
      <tr${total >= 7 && total <= 12 ? ' style="background:#f3e9df"' : ''}><td>7 - 12</td><td>มีอาการของโรคซึมเศร้า ระดับน้อย</td></tr>
      <tr${total >= 13 && total <= 18 ? ' style="background:#f3e9df"' : ''}><td>13 - 18</td><td>มีอาการของโรคซึมเศร้า ระดับปานกลาง</td></tr>
      <tr${total > 19 ? ' style="background:#f3e9df"' : ''}><td>&gt; 19</td><td>มีอาการของโรคซึมเศร้า ระดับรุนแรง</td></tr>
    `;

    // คำแนะนำ
    const dangerFlag = answers.length === 9 && answers[8] > 0; // ข้อ 9 ของ PHQ‑9
    if (total > 19 || dangerFlag) {
      advice = "ควรปรึกษาผู้เชี่ยวชาญด้านสุขภาพจิตโดยเร็ว และพูดคุยกับคนที่คุณไว้ใจ";
    } else if (total >= 13) {
      advice = "ควรนัดหมายเพื่อรับคำปรึกษาจากผู้เชี่ยวชาญ และดูแลตัวเองต่อเนื่อง";
    } else if (total >= 7) {
      advice = "ลองจัดการตารางชีวิต พักผ่อน ออกกำลังกาย และพูดคุยกับคนที่ไว้ใจ หากอาการไม่ดีขึ้นควรปรึกษาผู้เชี่ยวชาญ";
    } else {
      advice = "ผลอยู่ในเกณฑ์น้อยมาก หากยังรู้สึกไม่สบายใจ ให้ลองพูดคุยกับคนที่ไว้ใจหรือหากิจกรรมที่ทำให้รู้สึกดี";
    }
  } else if (currentSet === "ST5") {
    summaryTitle = "การแปลผลคะแนนรวม (ST‑5)";
    let level = "";
    if (total <= 4) level = "ความเครียดน้อย";
    else if (total <= 7) level = "ความเครียดปานกลาง";
    else if (total <= 9) level = "ความเครียดมาก";
    else level = "ความเครียดรุนแรง";
    summaryLine = `ระดับ: ${level}`;

    tableHTML = `
      <tr><th>คะแนนรวม</th><th>ระดับความเครียด</th></tr>
      <tr${total <= 4 ? ' style="background:#f3e9df"' : ''}><td>0 - 4</td><td>น้อย</td></tr>
      <tr${total >= 5 && total <= 7 ? ' style="background:#f3e9df"' : ''}><td>5 - 7</td><td>ปานกลาง</td></tr>
      <tr${total >= 8 && total <= 9 ? ' style="background:#f3e9df"' : ''}><td>8 - 9</td><td>มาก</td></tr>
      <tr${total >= 10 ? ' style="background:#f3e9df"' : ''}><td>10 - 15</td><td>รุนแรง</td></tr>
    `;

    if (total >= 10) {
      advice = "ควรพักผ่อน ลดภาระ พูดคุยกับคนที่ไว้ใจ และปรึกษาผู้เชี่ยวชาญด้านสุขภาพจิต";
    } else if (total >= 8) {
      advice = "ลองใช้เทคนิคผ่อนคลาย เช่น การหายใจลึก ๆ ออกกำลังกายเบา ๆ หากยังเครียดควรปรึกษาผู้เชี่ยวชาญ";
    } else if (total >= 5) {
      advice = "จัดเวลาพัก ทำกิจกรรมที่ผ่อนคลาย และสังเกตอาการ หากแย่ลงควรปรึกษาผู้เชี่ยวชาญ";
    } else {
      advice = "ระดับความเครียดน้อย ดูแลตัวเองให้เพียงพอ พักผ่อนและทำกิจกรรมที่ชอบ";
    }
  } else if (currentSet === "WHO5") {
    summaryTitle = "การแปลผลคะแนนรวม (WHO‑5)";
    // ใช้สเกล 0–3 จากรูปแบบตัวเลือกเดียวกับ PHQ/ภาพที่อ้างอิง (แปลงเป็นเปอร์เซ็นต์แบบสัดส่วน)
    const maxScore = currentQuestions.length * 3; // 5 ข้อ * 3 = 15
    const percent = Math.round((total / maxScore) * 100);
    summaryLine = `คะแนนสุขภาวะทางใจ: ${percent}%`;

    // ตารางเปอร์เซ็นต์ (เทียบสัดส่วน)
    tableHTML = `
      <tr><th>เปอร์เซ็นต์</th><th>การแปลผล</th></tr>
      <tr${percent < 50 ? ' style="background:#f3e9df"' : ''}><td>&lt; 50%</td><td>สุขภาวะทางใจต่ำ</td></tr>
      <tr${percent >= 50 && percent <= 70 ? ' style="background:#f3e9df"' : ''}><td>50% - 70%</td><td>ปานกลาง</td></tr>
      <tr${percent > 70 ? ' style="background:#f3e9df"' : ''}><td>&gt; 70%</td><td>สุขภาวะทางใจดี</td></tr>
    `;

    if (percent < 50) {
      advice = "ลองเพิ่มกิจกรรมที่ทำให้รู้สึกดี เช่น เดินเล่น ออกกำลังกายเบา ๆ พบปะผู้คน และพูดคุยกับคนที่ไว้ใจ";
    } else if (percent <= 70) {
      advice = "สุขภาวะทางใจปานกลาง ดูแลตัวเองต่อเนื่อง และสังเกตอารมณ์ หากแย่ลงให้ปรึกษาผู้เชี่ยวชาญ";
    } else {
      advice = "สุขภาวะทางใจดี รักษานิสัยที่ดี เช่น พักผ่อนให้พอ ออกกำลังกาย และเชื่อมโยงกับคนรอบตัว";
    }
  }

  // แสดงผล
  document.getElementById("scoreSummary").innerText = `คะแนนรวม: ${total}\n${summaryTitle}\n${summaryLine}`;
  document.getElementById("scoreTable").innerHTML = tableHTML;
  document.getElementById("recommendation").innerText = advice;

  showPage("result");
}