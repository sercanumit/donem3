import { gradeStorage } from "./storage.js";

// Her dersin kredi ağırlığı
const weightMap = {
  professionalism: 2, // 2 kredi
  pregnancy: 5, // 5 kredi
  tumors: 5, // 5 kredi
  respiratoryCirculatory: 6, // 6 kredi
  trauma: 5, // 5 kredi
  infection: 5, // 5 kredi
  endocrine: 5, // 5 kredi
  digestive: 5, // 5 kredi
  aging: 5, // 5 kredi
  neuropsychiatry: 5, // 5 kredi
  elective: 4, // 4 kredi
};

const totalCredits = 52; // Toplam kredi

// Form elementlerinin ID'leri
const courseInputs = [
  "professionalism",
  "pregnancy",
  "tumors",
  "respiratoryCirculatory",
  "trauma",
  "infection",
  "endocrine",
  "digestive",
  "aging",
  "neuropsychiatry",
  "elective",
];

// Geçme notu
const PASSING_GRADE = 69.5;

// Blok başarı notunu hesaplayan fonksiyon
function calculateBlockGrade() {
  let totalWeightedScore = 0;
  let hasAnyGrade = false;

  courseInputs.forEach((courseId) => {
    const input = document.getElementById(courseId);
    const score = parseFloat(input.value);

    if (!isNaN(score) && score >= 0 && score <= 100) {
      // Not * kredi / toplam kredi formülü
      const credit = weightMap[courseId];
      const weightedScore = (score * credit) / totalCredits;
      totalWeightedScore += weightedScore;
      hasAnyGrade = true;
    }
  });

  if (!hasAnyGrade) {
    return 0;
  }

  return Math.round(totalWeightedScore * 100) / 100; // sonucu 2 ondalıklı basamak olarak döndür
}

// Genel ortalama hesaplama fonksiyonu
function calculateGeneralAverage() {
  const blockGrade = calculateBlockGrade();
  const finalGrade =
    parseFloat(document.getElementById("finalExam").value) || 0;
  const pdoGrade = parseFloat(document.getElementById("pdo").value) || 0;
  const mduGrade = parseFloat(document.getElementById("mdu").value) || 0;

  // Hesaplama: (Blok * 0.5) + (Final * 0.25) + (PDÖ * 0.1) + (MDU * 0.1)
  const weightedSum =
    blockGrade * 0.5 + finalGrade * 0.25 + pdoGrade * 0.1 + mduGrade * 0.1;

  // Sonucu 1.05 ile çarp
  const generalAverage = weightedSum * 1.05;

  return Math.round(generalAverage * 100) / 100; // 2 ondalık basamakla döndür
}

// Geçmek için gerekli final puanını hesaplayan fonksiyon
function calculateRequiredFinalScore() {
  const blockGrade = calculateBlockGrade();
  const pdoGrade = parseFloat(document.getElementById("pdo").value) || 0;
  const mduGrade = parseFloat(document.getElementById("mdu").value) || 0;

  // Eğer blok notu 0 ise hesaplama yapılamaz
  if (blockGrade === 0) {
    return null;
  }

  // Mevcut puanların katkısı (final hariç)
  const currentContribution =
    blockGrade * 0.5 + pdoGrade * 0.1 + mduGrade * 0.1;

  // Geçme notu için gereken toplam puan (1.05 çarpanı dahil)
  const requiredTotal = PASSING_GRADE / 1.05;

  // Final için gereken puan
  const requiredFinalScore = (requiredTotal - currentContribution) / 0.25;

  // Final barajı 59.5 - gerekli puan bundan az ise minimum 59.5 göster
  const MINIMUM_FINAL_GRADE = 59.5;
  const finalRequirement = Math.max(requiredFinalScore, MINIMUM_FINAL_GRADE);

  return Math.max(0, Math.min(100, finalRequirement)); // 0-100 arasında sınırla
}

function updateBlockGrade() {
  const blockGrade = calculateBlockGrade();
  const blockGradeElement = document.getElementById("blockGrade");

  if (blockGrade > 0) {
    blockGradeElement.textContent = `${blockGrade}`;
    blockGradeElement.className = "text-3xl font-semibold text-emerald-200";
  } else {
    blockGradeElement.textContent = "Notlar girilmemiş";
    blockGradeElement.className = "text-lg font-medium text-slate-300";
  }

  updateGeneralAverage();
  updateRequiredFinalScore();
  saveGradesToStorage();
}

function updateGeneralAverage() {
  const generalAverage = calculateGeneralAverage();
  const generalAverageElement = document.getElementById("generalAverage");
  const finalGrade =
    parseFloat(document.getElementById("finalExam").value) || 0;
  const MINIMUM_FINAL_GRADE = 59.5;

  if (generalAverage > 0) {
    generalAverageElement.textContent = generalAverage.toFixed(2);

    // Final notu girildiyse ve barajı geçemediyse kırmızı renk
    if (
      !isNaN(finalGrade) &&
      finalGrade > 0 &&
      finalGrade < MINIMUM_FINAL_GRADE
    ) {
      generalAverageElement.className = "text-5xl font-bold text-red-400 mb-2";
    } else if (
      !isNaN(finalGrade) &&
      finalGrade > 0 &&
      generalAverage >= PASSING_GRADE &&
      finalGrade >= MINIMUM_FINAL_GRADE
    ) {
      // Hem genel ortalama hem de final barajı geçildiyse yeşil renk
      generalAverageElement.className =
        "text-5xl font-bold text-emerald-400 mb-2";
    } else {
      // Normal durum
      generalAverageElement.className =
        "text-5xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text mb-2";
    }
  } else {
    generalAverageElement.textContent = "--";
    generalAverageElement.className =
      "text-5xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text mb-2";
  }

  updateRequiredFinalScore();
  updateStatusInfo();
}

function updateRequiredFinalScore() {
  const requiredScore = calculateRequiredFinalScore();
  const requiredFinalElement = document.getElementById("requiredFinalScore");
  const MINIMUM_FINAL_GRADE = 59.5;

  const requiredScoreTitle = document.getElementById("requiredScoreTitle");
  const requiredScoreValue = document.getElementById("requiredScoreValue");
  const finalBarrierText = document.getElementById("finalBarrierText");

  if (requiredScore === null) {
    requiredScoreValue.textContent = "---";
    return;
  }

  const finalInput = document.getElementById("finalExam");
  const currentFinalScore = parseFloat(finalInput.value);

  if (isNaN(currentFinalScore) || finalInput.value === "") {
    if (requiredScore <= 100) {
      // Normal durum - gerekli puanı göster
      requiredScoreValue.textContent = requiredScore.toFixed(1);
      requiredScoreTitle.className = "text-purple-200 font-medium";
      requiredScoreValue.className = "text-2xl font-bold text-purple-100 mt-1";
    } else {
      // uyarı göster
      requiredScoreValue.textContent = `${requiredScore.toFixed(
        1
      )} puan gerekli`;
      requiredFinalElement.className =
        "bg-red-500/20 rounded-lg p-3 border border-red-400/30";
      requiredScoreTitle.textContent =
        "Uyarı: Mevcut notlarla geçmek mümkün değil";
      requiredScoreTitle.className = "text-red-200 font-medium";
      requiredScoreValue.className = "text-lg font-bold text-red-100 mt-1";
      finalBarrierText.className = "text-sm text-red-300 mt-1";
    }
  } else {
    requiredScoreValue.textContent = `${requiredScore.toFixed(1)}`;
    requiredScoreTitle.className = "text-purple-200 font-medium";
    requiredScoreValue.className = "text-2xl font-bold text-purple-100 mt-1";
    finalBarrierText.textContent = `Final barajı: ${MINIMUM_FINAL_GRADE}`;
    finalBarrierText.className = "text-sm text-purple-300 mt-1";
  }
}

function checkPassingStatus() {
  const generalAverage = calculateGeneralAverage();
  const finalGrade =
    parseFloat(document.getElementById("finalExam").value) || 0;
  const MINIMUM_FINAL_GRADE = 59.5;

  // Genel ortalama 69.5'un üzerinde VE final 59.5'un üzerinde olmalı
  return generalAverage >= PASSING_GRADE && finalGrade >= MINIMUM_FINAL_GRADE;
}

function getGradeLetter(score) {
  if (score >= 90)
    return { letter: "AA", coefficient: "4,00", degree: "PEKİYİ" };
  if (score >= 85)
    return { letter: "BA", coefficient: "3,50", degree: "PEKİYİ" };
  if (score >= 80) return { letter: "BB", coefficient: "3,00", degree: "İYİ" };
  if (score >= 75) return { letter: "CB", coefficient: "2,50", degree: "İYİ" };
  if (score >= 70) return { letter: "CC", coefficient: "2,00", degree: "ORTA" };
  return { letter: "FF", coefficient: "0,00", degree: "BAŞARISIZ" };
}

// Durumu belirleyen fonksiyon
function getStatusMessage() {
  const generalAverage = calculateGeneralAverage();
  const finalGrade =
    parseFloat(document.getElementById("finalExam").value) || 0;
  const blockGrade = calculateBlockGrade();
  const MINIMUM_FINAL_GRADE = 59.5;

  // Eğer hiç not girilmemişse
  if (generalAverage === 0 || blockGrade === 0) {
    return null;
  }

  // Final notu girilmemişse
  if (isNaN(finalGrade) || finalGrade === 0) {
    if (generalAverage >= PASSING_GRADE) {
      return {
        type: "info",
        message: "Final notu bekleniyor",
        detail: "Mevcut ortalama geçme notunun üzerinde",
      };
    } else {
      return {
        type: "warning",
        message: "Final notu bekleniyor",
        detail: "Geçmek için final notu gerekli",
      };
    }
  }

  // Final barajı kontrolü
  if (finalGrade < MINIMUM_FINAL_GRADE) {
    return {
      type: "fail",
      message: "Final barajından kaldı",
      detail: `Final notu ${MINIMUM_FINAL_GRADE}'in altında (${finalGrade})`,
    };
  }

  // Genel ortalama kontrolü
  if (generalAverage < PASSING_GRADE) {
    return {
      type: "fail",
      message: "Ortalamadan dolayı kaldı",
      detail: `Genel ortalama ${PASSING_GRADE}'in altında (${generalAverage.toFixed(
        2
      )})`,
    };
  }

  // Geçti
  const gradeInfo = getGradeLetter(generalAverage);
  return {
    type: "pass",
    message: "Geçti",
    detail: `${gradeInfo.letter} (${gradeInfo.coefficient}) - ${gradeInfo.degree}`,
  };
}

// Durum bilgisini güncelleme fonksiyonu
function updateStatusInfo() {
  const statusInfo = document.getElementById("statusInfo");
  const statusText = document.getElementById("statusText");
  const gradeInfo = document.getElementById("gradeInfo");

  const status = getStatusMessage();

  if (!status) {
    statusInfo.classList.add("hidden");
    return;
  }

  statusInfo.classList.remove("hidden");
  statusText.textContent = status.message;
  gradeInfo.textContent = status.detail;

  statusInfo.className =
    "mt-4 p-4 rounded-lg border transition-all duration-300";

  switch (status.type) {
    case "pass":
      statusInfo.classList.add("bg-green-500/20", "border-green-400/50");
      statusText.className = "text-lg font-semibold mb-2 text-green-200";
      gradeInfo.className = "text-sm opacity-75 text-green-300";
      break;
    case "fail":
      statusInfo.classList.add("bg-red-500/20", "border-red-400/50");
      statusText.className = "text-lg font-semibold mb-2 text-red-200";
      gradeInfo.className = "text-sm opacity-75 text-red-300";
      break;
    case "warning":
      statusInfo.classList.add("bg-yellow-500/20", "border-yellow-400/50");
      statusText.className = "text-lg font-semibold mb-2 text-yellow-200";
      gradeInfo.className = "text-sm opacity-75 text-yellow-300";
      break;
    case "info":
      statusInfo.classList.add("bg-blue-500/20", "border-blue-400/50");
      statusText.className = "text-lg font-semibold mb-2 text-blue-200";
      gradeInfo.className = "text-sm opacity-75 text-blue-300";
      break;
  }
}

// Temizleme fonksiyonu
function clearAllInputs() {
  courseInputs.forEach((courseId) => {
    const input = document.getElementById(courseId);
    if (input) {
      input.value = "";
    }
  });

  const additionalInputs = ["pdo", "mdu", "finalExam"];
  additionalInputs.forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.value = "";
    }
  });

  const requiredScoreValue = document.getElementById("requiredScoreValue");
  if (requiredScoreValue) {
    requiredScoreValue.textContent = "---";
  }

  const statusInfo = document.getElementById("statusInfo");
  if (statusInfo) {
    statusInfo.classList.add("hidden");
  }

  gradeStorage.clear();

  updateBlockGrade();
}

// Notları LocalStorage'a kaydetme
function saveGradesToStorage() {
  const grades = {};

  courseInputs.forEach((courseId) => {
    const input = document.getElementById(courseId);
    if (input && input.value) {
      grades[courseId] = input.value;
    }
  });

  const additionalInputs = ["pdo", "mdu", "finalExam"];
  additionalInputs.forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (input && input.value) {
      grades[inputId] = input.value;
    }
  });

  gradeStorage.save(grades);
}

// Notları LocalStorage'dan yükleme fonksiyonu
function loadGradesFromStorage() {
  const savedGrades = gradeStorage.load();

  if (savedGrades) {
    // Ders notlarını yükle
    courseInputs.forEach((courseId) => {
      const input = document.getElementById(courseId);
      if (input && savedGrades[courseId]) {
        input.value = savedGrades[courseId];
      }
    });

    // PDÖ, MDU ve Final notlarını yükle
    const additionalInputs = ["pdo", "mdu", "finalExam"];
    additionalInputs.forEach((inputId) => {
      const input = document.getElementById(inputId);
      if (input && savedGrades[inputId]) {
        input.value = savedGrades[inputId];
      }
    });

    return true;
  }

  return false;
}

// Sayfa yüklendiğinde event listener'ları ekle
document.addEventListener("DOMContentLoaded", function () {
  courseInputs.forEach((courseId) => {
    const input = document.getElementById(courseId);
    if (input) {
      input.addEventListener("input", updateBlockGrade);
      input.addEventListener("change", updateBlockGrade);
    }
  });

  const additionalInputs = ["pdo", "mdu", "finalExam"];
  additionalInputs.forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener("input", function () {
        updateGeneralAverage();
        if (inputId === "finalExam") {
          updateRequiredFinalScore();
        }
      });
      input.addEventListener("change", function () {
        updateGeneralAverage();
        if (inputId === "finalExam") {
          updateRequiredFinalScore();
        }
      });
    }
  });

  const clearBtn = document.getElementById("clearBtn");

  if (clearBtn) {
    clearBtn.addEventListener("click", clearAllInputs);
  }

  loadGradesFromStorage();

  updateBlockGrade();
});
