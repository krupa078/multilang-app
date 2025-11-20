import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./i18n/en.json";
import hi from "./i18n/hi.json";
import es from "./i18n/es.json";
import pt from "./i18n/pt.json";
import zh from "./i18n/zh.json";
import fr from "./i18n/fr.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  es: { translation: es },
  pt: { translation: pt },
  zh: { translation: zh },
  fr: { translation: fr },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("lng") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;