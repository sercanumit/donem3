// LocalStorage yönetimi için yardımcı sınıf
class GradeStorage {
  constructor() {
    this.STORAGE_KEY = "donem3_grades";
  }

  // Notları LocalStorage'a kaydetme
  save(grades) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(grades));
      return true;
    } catch (error) {
      console.warn("LocalStorage'a kaydetme hatası:", error);
      return false;
    }
  }

  // Notları LocalStorage'dan yükleme
  load() {
    try {
      const savedGrades = localStorage.getItem(this.STORAGE_KEY);
      if (savedGrades) {
        return JSON.parse(savedGrades);
      }
      return null;
    } catch (error) {
      console.warn("LocalStorage'dan yükleme hatası:", error);
      return null;
    }
  }

  // LocalStorage'dan notları silme
  clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn("LocalStorage'dan silme hatası:", error);
      return false;
    }
  }

  // Mevcut bir değerin olup olmadığını kontrol etme
  exists() {
    try {
      return localStorage.getItem(this.STORAGE_KEY) !== null;
    } catch (error) {
      return false;
    }
  }

  // Belirli bir dersin notunu kaydetme
  saveGrade(courseId, grade) {
    const currentGrades = this.load() || {};
    if (grade === null || grade === undefined || grade === "") {
      delete currentGrades[courseId];
    } else {
      currentGrades[courseId] = grade;
    }
    return this.save(currentGrades);
  }

  // Belirli bir dersin notunu yükleme
  loadGrade(courseId) {
    const grades = this.load();
    return grades ? grades[courseId] : null;
  }
}

// Global storage instance
const gradeStorage = new GradeStorage();

// Export for use in other modules
export { gradeStorage, GradeStorage };
