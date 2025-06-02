import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc, setDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDKt4OmuZdKdgGFOHbW2EEDVc7ZiRA2NMU",
  authDomain: "insideit.firebaseapp.com",
  projectId: "insideit",
  storageBucket: "insideit.firebasestorage.app",
  messagingSenderId: "272264388012",
  appId: "1:272264388012:web:15069a7a3bc0a2f00dee09",
  measurementId: "G-B7ZSHFPJBD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Функция для добавления тестового курса
export const addTestCourse = async () => {
  try {
    const courseData = {
      course: "Python для начинающих",
      description: "Базовый курс по Python для новичков в программировании",
      about: "Освой один из самых востребованных языков программирования в мире — Python! Этот курс идеально подойдёт как для начинающих, так и для тех, кто хочет систематизировать знания и выйти на новый уровень.; Python используется в веб-разработке, анализе данных, машинном обучении, автоматизации и даже в игровой индустрии. В рамках курса вы не только изучите основы языка, но и создадите собственные проекты, которые сможете добавить в своё портфолио.",
      level: "Начальный",
      duration: "20 часов",
      certificate: true,
      price: "9990 ₽",
      oldPrice: "12990 ₽",
      skills: [
        "Синтаксис Python: переменные",
        "условия",
        "циклы",
        "функции Работа со списками",
        "словарями",
        "множествами и кортежами",
        "Исключения и обработка ошибок ООП: классы",
        "наследование",
        "инкапсуляция Работа с файлами (текстовыми",
        "JSON",
        "CSV) Библиотеки для анализа данных и визуализации",
        "Введение в работу с API и запросами"
      ],
      steps: [
        {
          id: "step1",
          title: "Введение в Python",
          description: "Знакомство с языком Python и его возможностями",
          duration: "30 минут",
          type: "video",
          videoUrl: "https://example.com/video1",
          order: 1,
          isCompleted: false,
          materials: [
            {
              title: "Презентация урока",
              type: "pdf",
              url: "https://example.com/presentation1.pdf"
            },
            {
              title: "Примеры кода",
              type: "code",
              url: "https://example.com/code1"
            }
          ]
        },
        {
          id: "step2",
          title: "Основы синтаксиса",
          description: "Изучение базового синтаксиса Python",
          duration: "45 минут",
          type: "video",
          videoUrl: "https://example.com/video2",
          order: 2,
          isCompleted: false,
          materials: [
            {
              title: "Практические задания",
              type: "pdf",
              url: "https://example.com/tasks2.pdf"
            }
          ]
        }
      ],
      progress: {
        totalSteps: 2,
        completedSteps: 0,
        lastAccessedStep: "step1"
      }
    };

    // Добавляем курс в коллекцию courses
    const docRef = await addDoc(collection(db, "courses"), courseData);
    console.log("Курс успешно добавлен с ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Ошибка при добавлении курса:", error);
    throw error;
  }
};

// Функция для обновления существующего курса
export const updateCourse = async (courseId, courseData) => {
  try {
    await setDoc(doc(db, "courses", courseId), courseData);
    console.log("Курс успешно обновлен");
  } catch (error) {
    console.error("Ошибка при обновлении курса:", error);
    throw error;
  }
};

// Функция для загрузки файла в Storage
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
    throw error;
  }
};
