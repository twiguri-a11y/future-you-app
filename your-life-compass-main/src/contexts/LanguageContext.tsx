import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type Language = "en" | "es" | "ru";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectLanguage(): Language {
  const stored = localStorage.getItem("futureYou_language");
  if (stored === "en" || stored === "es" || stored === "ru") return stored;

  const browserLang = navigator.language || (navigator as any).userLanguage || "";
  const lang = browserLang.toLowerCase();

  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("ru")) return "ru";
  return "en";
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("futureYou_language", lang);
  }, []);

  useEffect(() => {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      let result: any = translations[language];
      for (const k of keys) {
        result = result?.[k];
      }
      if (typeof result === "string") return result;
      result = translations.en;
      for (const k of keys) {
        result = result?.[k];
      }
      return typeof result === "string" ? result : key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};

// ─── Translation Strings ───────────────────────────────────────────

const translations: Record<Language, Record<string, any>> = {
  en: {
    nav: {
      features: "Features",
      getStarted: "Get Started",
      testimonials: "Testimonials",
      faq: "FAQ",
    },
    hero: {
      badge: "FUTURE YOU",
      headline: "Meet the person you are becoming",
      subtext: "There's a part of you that already knows.",
      cta: "Start Becoming",
      ctaAuth: "Continue Your Path",
      secondary: "See How It Works",
    },
    auth: {
      headline: "Meet the person you are becoming",
      subtext: "There's a part of you that already knows.",
      google: "Continue with Google",
      apple: "Continue with Apple",
      email: "Continue with Email",
      guest: "Continue as Guest",
      or: "or",
      createAccount: "Create your account",
      welcomeBack: "Welcome back",
      signUpDesc: "Start designing your future",
      signInDesc: "Continue your journey",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      createBtn: "Create Account",
      signInBtn: "Sign In",
      pleaseWait: "Please wait...",
      hasAccount: "Already have an account? Sign in",
      noAccount: "Don't have an account? Sign up",
      backToAll: "← Back to all options",
    },
    onboarding: {
      reflectionTitle: "This might feel familiar.",
      reflectionQuestion: "Do you feel like you're not fully where you could be?",
      no: "No.",
      notYet: "Not yet.",
      almost: "Almost.",
      continue: "Continue",
      genderTitle: "How should we address you?",
      genderSubtext: "This helps us personalize your experience.",
      genderMale: "Male",
      genderFemale: "Female",
      genderNeutral: "Prefer not to say",
    },
    home: {
      fromFutureSelf: "From Your Future Self",
      dayStreak: "Day Streak",
      visionProgress: "Vision Progress",
      dailyAlignment: "Daily Alignment",
      completedToday: "You're aligned today ✓",
      thirtySeconds: "~30 seconds",
      dailyAction: "Take one small aligned step today. That's all it takes.",
      startRitual: "Start Today's Ritual",
      alreadyDone: "You've Already Shown Up",
      fallbackMessage: "Take one small step toward the life you described. That's enough for today.",
    },
    daily: {
      title: "Daily Alignment",
      doneSubtext: "You showed up today. That matters.",
      checkIn: "A quiet moment to check in with yourself.",
      moodTitle: "How are you showing up today?",
      moodSubtext: "There's no wrong answer. Just honesty.",
      intentionTitle: "Take one small aligned step today.",
      intentionSubtext: "What's one thing you could do today that your future self would quietly respect?",
      intentionPlaceholder: "e.g. I'll stay present in every conversation today.",
      reflectionTitle: "A quiet moment of gratitude.",
      reflectionSubtext: "What's one thing you notice right now that you're grateful for?",
      reflectionPlaceholder: "Something small is enough.",
      alignmentTitle: "Did today reflect who you want to become?",
      alignmentSubtext: "Not a grade — just a feeling.",
      notAtAll: "Not at all",
      fullyAligned: "Fully aligned",
      completeRitual: "Complete Ritual",
      saving: "Saving...",
      todayDone: "You showed up today. That's what matters.",
      seeYou: "See you tomorrow.",
      reinforcement: "You're staying aligned. That's what this looks like.",
      toastTitle: "You showed up today",
      toastDesc: "That's what staying aligned looks like.",
    },
    greeting: {
      entry: [
        "You're closer than you think — don't disconnect now.",
        "Something in you already knows the way forward.",
        "The gap between now and your future is smaller than it feels.",
        "This might feel familiar — like remembering something you haven't lived yet.",
        "You may already sense this... today matters more than you think.",
      ],
      return: [
        "Your future self has been holding space for you.",
        "You stepped away, and that's okay. What matters is you're here now.",
        "Still becoming. Still aligned. Still you.",
      ],
    },
    welcome: {
      title: "Welcome back",
    },
    features: {
      headline: "Not another goal-setting app.",
      headlineAccent: "An identity system.",
      subtext: "You may already sense there's more to you than what you've been living. This is where that feeling becomes something real.",
    },
    cta: {
      headline: "Meet the person you are becoming",
      subtext: "5 minutes. No fluff. Just you — talking to the version of yourself who already figured it out.",
      button: "Start Becoming",
    },
    featureItems: [
      { title: "Record Your Future Voice", description: "Read identity statements out loud — in your own voice. Not affirmations. Real words from the person you're becoming." },
      { title: "See Your Future Day", description: "A vivid snapshot of one day in the life you described. Not fantasy — a grounded picture of what may already be unfolding." },
      { title: "30-Second Daily Ritual", description: "Choose one aligned action. Reflect tonight. That's it. Small steps that quietly rewire how you see yourself." },
      { title: "Talk to Future You", description: "Ask real questions. Get honest, grounded answers shaped by your vision and values. No generic advice." },
      { title: "Consistency That Speaks", description: "Watch your alignment grow. Reach quiet milestones. Receive identity feedback that actually resonates." },
      { title: "Private. Encrypted. Yours.", description: "Your vision stays yours. Full privacy, data encryption, and the ability to export or delete everything." },
    ],
    timeline: {
      headline: "Your journey,",
      headlineAccent: "year by year",
      subtext: "Every great transformation follows a path. Here's how your future unfolds when you commit to your vision.",
      items: [
        { year: "Year 1", title: "Plant the Seeds", description: "Clarify your vision, build daily habits, and take the first bold steps toward the life you want." },
        { year: "Year 3", title: "Build Momentum", description: "Your routines compound. Career shifts, deeper relationships, and growing confidence become visible." },
        { year: "Year 5", title: "Reach New Heights", description: "You're living intentionally — your environment, work, and health reflect the person you set out to become." },
        { year: "Year 10", title: "Become Your Future Self", description: "The vision is no longer a dream. You've built the life, the legacy, and the freedom you imagined." },
      ],
    },
    social: {
      stats: ["People becoming", "Visions created", "Days of alignment"],
    },
    testimonials: {
      badge: "Real people. Real shifts.",
      headline: "They started becoming.",
      items: [
        { name: "Sarah M.", role: "Entrepreneur", quote: "I didn't expect to cry. But hearing my future self talk back to me — it hit different. I use it every morning now." },
        { name: "James K.", role: "Software Engineer", quote: "Most apps tell you what to do. This one shows you who to become. The daily ritual is the only habit I've kept for 60+ days." },
        { name: "Priya L.", role: "Graduate Student", quote: "The vision experience gave me chills. It felt like meeting someone I already knew — just hadn't met yet." },
        { name: "Marcus T.", role: "Creative Director", quote: "I've tried every self-improvement app. This is the first one that actually changed how I see myself." },
        { name: "Elena R.", role: "Therapist", quote: "I recommend this to my clients. The identity-first approach aligns with real psychology — not just hype." },
        { name: "David W.", role: "Fitness Coach", quote: "The alignment score keeps me honest. I can see exactly when I'm drifting from who I want to be." },
        { name: "Aisha N.", role: "Product Manager", quote: "I play my future self audio on my commute. It's like having a mentor who knows me better than I know myself." },
        { name: "Tom H.", role: "Retired Teacher", quote: "At 62, I thought reinvention was behind me. This app proved me wrong. My future self is vibrant and alive." },
        { name: "Lina C.", role: "Medical Resident", quote: "Between 80-hour weeks, this is the 5 minutes that keeps me grounded. The daily ritual is non-negotiable now." },
      ],
    },
    pricing: {
      headline: "Simple, transparent pricing",
      subtext: "Start free. Upgrade when you're ready to go deeper.",
      free: { name: "Free", price: "$0", period: "forever", description: "Start designing your ideal life", cta: "Get Started", features: ["1 Life Blueprint", "Daily Alignment Ritual", "Basic Future Self preview", "7-day reflection history"] },
      premium: { name: "Premium", price: "$10", period: "/month", description: "Unlock the full Life Mentor experience", cta: "Start Free Trial", features: ["Unlimited Blueprints", "Cinematic Future Self Simulation", "AI Chat with Future Self", "Full progress & reflection history", "Export & share your vision", "Priority support"] },
    },
    faq: {
      headline: "Frequently asked",
      headlineAccent: "questions",
      subtext: "Everything you need to know before starting your journey.",
      items: [
        { q: "What is Future You?", a: "Future You is a personal identity system — not a goal-setting app. It helps you define who you're becoming, talk to that version of yourself, and build small daily habits that quietly close the gap." },
        { q: "How does the Future Vision Experience work?", a: "You answer 8 questions about your ideal future — where you live, how you feel, who's with you. AI then generates a cinematic image and writes a personal message from your future self. It's designed to feel real, not generic." },
        { q: "Is my data private?", a: "Completely. Your vision, reflections, and conversations are encrypted and stored securely. Only you can access your data. You can export or delete everything at any time." },
        { q: "Can I try it for free?", a: "Yes — you can experience the full Future Vision flow once for free, no account needed. After that, creating an account unlocks daily alignment tools, your future self chat, and more." },
        { q: "What makes this different from journaling or affirmation apps?", a: "Most apps ask you to write goals or repeat affirmations. Future You lets you see, hear, and talk to the person you're becoming. It's experiential — you feel it, not just think about it." },
        { q: "How much does it cost?", a: "The core experience is free. Premium features — including unlimited vision generations, advanced AI chat, and weekly progress reports — are available for $10/month." },
      ],
    },
    settings: {
      title: "Settings",
      account: "Account",
      profile: "Profile",
      profileDesc: "Manage your account",
      notifications: "Notifications",
      notificationsDesc: "Reminders & alerts",
      subscription: "Subscription",
      subscriptionDesc: "Free plan",
      privacy: "Privacy",
      privacyControls: "Privacy Controls",
      privacyDesc: "Data & visibility",
      exportData: "Export Data",
      exportDesc: "Download your data",
      language: "Language",
      languageDesc: "Change app language",
      signOut: "Sign Out",
    },
    languages: {
      en: "English",
      es: "Español",
      ru: "Русский",
    },
    lifeAreas: {
      health: "Health",
      career: "Career",
      relationships: "Relationships",
      mind: "Mind",
      weeklyBalance: "Life Balance This Week",
      areaStep: "What area of life is this about?",
      areaSubtext: "Optional — helps you see your balance over time.",
    },
    moods: {
      energized: "Energized",
      calm: "Calm",
      neutral: "Neutral",
      low: "Low",
      heavy: "Heavy",
    },
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    notifications: {
      morning: [
        "Let's start your day with one small win.",
        "Your day is waiting — let's begin.",
        "A small step today can change everything.",
        "What would your future self do this morning?",
        "Show up for your future self today.",
      ],
      evening: [
        "Take a moment to reflect on your day.",
        "You showed up today — that counts.",
        "Did today reflect who you want to become?",
        "One honest reflection can change tomorrow.",
        "Even small steps count — don't overlook them.",
      ],
      inactive: [
        "Want to take a minute for yourself?",
        "Let's do one small thing today.",
        "You don't need motivation — just a start.",
      ],
      streak: [
        "You're close to breaking your streak — keep it alive.",
        "Don't lose your momentum today.",
      ],
      comeback: [
        "We saved your place.",
        "No pressure — just come back when you're ready.",
        "Let's reset and start fresh.",
      ],
    },
  },

  es: {
    nav: { features: "Funciones", getStarted: "Comenzar", testimonials: "Testimonios", faq: "FAQ" },
    hero: { badge: "FUTURE YOU", headline: "Conoce a la persona en la que te estás convirtiendo", subtext: "Una parte de ti ya lo sabe.", cta: "Empieza a ser", ctaAuth: "Continúa tu camino", secondary: "Cómo funciona" },
    auth: { headline: "Conoce a la persona en la que te estás convirtiendo", subtext: "Una parte de ti ya lo sabe.", google: "Continuar con Google", apple: "Continuar con Apple", email: "Continuar con Email", guest: "Continuar como invitado", or: "o", createAccount: "Crear cuenta", welcomeBack: "Bienvenido de vuelta", signUpDesc: "Empieza a diseñar tu futuro", signInDesc: "Continúa tu viaje", emailPlaceholder: "Email", passwordPlaceholder: "Contraseña", createBtn: "Crear cuenta", signInBtn: "Iniciar sesión", pleaseWait: "Espera...", hasAccount: "¿Ya tienes cuenta? Inicia sesión", noAccount: "¿No tienes cuenta? Regístrate", backToAll: "← Volver" },
    onboarding: { reflectionTitle: "Esto puede parecer familiar.", reflectionQuestion: "¿Sientes que no estás del todo donde podrías estar?", no: "No.", notYet: "Aún no.", almost: "Casi.", continue: "Continuar", genderTitle: "¿Cómo debemos dirigirnos a ti?", genderSubtext: "Esto nos ayuda a personalizar tu experiencia.", genderMale: "Masculino", genderFemale: "Femenino", genderNeutral: "Prefiero no decir" },
    home: { fromFutureSelf: "De tu yo futuro", dayStreak: "Racha de días", visionProgress: "Progreso de visión", dailyAlignment: "Alineación diaria", completedToday: "Estás alineado hoy ✓", thirtySeconds: "~30 segundos", dailyAction: "Un pequeño paso alineado hoy. Eso es todo.", startRitual: "Comenzar el ritual", alreadyDone: "Ya te presentaste hoy", fallbackMessage: "Da un pequeño paso hacia la vida que describiste. Es suficiente por hoy." },
    daily: { title: "Alineación diaria", doneSubtext: "Te presentaste hoy. Eso importa.", checkIn: "Un momento tranquilo para ti.", moodTitle: "¿Cómo te sientes hoy?", moodSubtext: "No hay respuesta incorrecta. Solo honestidad.", intentionTitle: "Un paso alineado hoy.", intentionSubtext: "¿Qué podrías hacer hoy que tu yo futuro respetaría?", intentionPlaceholder: "ej. Estaré presente en cada conversación.", reflectionTitle: "Un momento de gratitud.", reflectionSubtext: "¿Por qué estás agradecido ahora?", reflectionPlaceholder: "Algo pequeño es suficiente.", alignmentTitle: "¿El día reflejó quién quieres ser?", alignmentSubtext: "No es una nota — solo un sentimiento.", notAtAll: "Para nada", fullyAligned: "Totalmente", completeRitual: "Completar ritual", saving: "Guardando...", todayDone: "Te presentaste hoy. Eso importa.", seeYou: "Hasta mañana.", reinforcement: "Sigues alineado. Así se ve.", toastTitle: "Te presentaste hoy", toastDesc: "Así se ve mantenerse alineado." },
    greeting: { entry: ["Estás más cerca de lo que crees.", "Algo en ti ya conoce el camino.", "La distancia a tu futuro es menor de lo que parece.", "Como recordar algo que aún no has vivido.", "Hoy importa más de lo que crees."], return: ["Tu yo futuro ha guardado un lugar para ti.", "Te alejaste, y está bien. Estás aquí ahora.", "Aún convirtiéndote. Aún alineado. Aún tú."] },
    welcome: { title: "Bienvenido de vuelta" },
    features: { headline: "No es otra app de metas.", headlineAccent: "Un sistema de identidad.", subtext: "Quizás ya sientes que hay más en ti. Aquí ese sentimiento se hace real." },
    cta: { headline: "Conoce a la persona en la que te estás convirtiendo", subtext: "5 minutos. Sin relleno. Solo tú — hablando con la versión de ti que ya lo resolvió.", button: "Comenzar" },
    featureItems: [
      { title: "Graba tu voz futura", description: "Lee en voz alta declaraciones de identidad — con tu propia voz." },
      { title: "Ve tu día futuro", description: "Una imagen vívida de un día en la vida que describiste." },
      { title: "Ritual diario de 30 segundos", description: "Una acción alineada. Reflexión por la noche. Pequeños pasos que transforman." },
      { title: "Habla con tu yo futuro", description: "Preguntas reales. Respuestas honestas desde tu visión." },
      { title: "Consistencia que habla", description: "Observa tu alineación crecer. Hitos silenciosos. Retroalimentación que resuena." },
      { title: "Privado. Encriptado. Tuyo.", description: "Privacidad total. Exporta o elimina todo en cualquier momento." },
    ],
    timeline: { headline: "Tu camino,", headlineAccent: "año tras año", subtext: "Cada transformación sigue un camino.", items: [
      { year: "Año 1", title: "Plantar las semillas", description: "Clarifica tu visión y da los primeros pasos." },
      { year: "Año 3", title: "Ganar impulso", description: "Las rutinas se acumulan. Los cambios se hacen visibles." },
      { year: "Año 5", title: "Nuevas alturas", description: "Vives intencionalmente. Todo refleja quién quieres ser." },
      { year: "Año 10", title: "Convertirte en tu yo futuro", description: "La visión ya no es un sueño. Construiste la vida." },
    ] },
    social: { stats: ["Personas transformándose", "Visiones creadas", "Días de alineación"] },
    testimonials: { badge: "Personas reales. Cambios reales.", headline: "Empezaron a ser.", items: [
      { name: "Sarah M.", role: "Emprendedora", quote: "Cuando mi yo futuro habló — fue diferente. Lo uso cada mañana." },
      { name: "James K.", role: "Ingeniero", quote: "Esta app muestra quién puedes ser. Llevo 60+ días con el ritual." },
      { name: "Priya L.", role: "Estudiante", quote: "La experiencia de visión me dio escalofríos." },
      { name: "Marcus T.", role: "Director creativo", quote: "La primera app que cambió cómo me veo." },
      { name: "Elena R.", role: "Terapeuta", quote: "El enfoque de identidad se alinea con la psicología real." },
      { name: "David W.", role: "Entrenador", quote: "La puntuación me mantiene honesto." },
      { name: "Aisha N.", role: "Gerente de producto", quote: "Escucho mi audio futuro camino al trabajo." },
      { name: "Tom H.", role: "Profesor jubilado", quote: "A los 62, demostró que reinventarse es posible." },
      { name: "Lina C.", role: "Residente médica", quote: "Los 5 minutos que me mantienen centrada." },
    ] },
    pricing: { headline: "Precios simples y transparentes", subtext: "Comienza gratis. Mejora cuando estés listo.", free: { name: "Gratis", price: "$0", period: "para siempre", description: "Diseña tu vida ideal", cta: "Comenzar", features: ["1 plan de vida", "Ritual diario", "Vista previa básica", "Historial de 7 días"] }, premium: { name: "Premium", price: "$10", period: "/mes", description: "Experiencia completa de mentor", cta: "Prueba gratis", features: ["Planes ilimitados", "Simulación cinematográfica", "Chat con IA", "Historial completo", "Exportar visión", "Soporte prioritario"] } },
    faq: { headline: "Preguntas", headlineAccent: "frecuentes", subtext: "Todo lo que necesitas saber.", items: [
      { q: "¿Qué es Future You?", a: "Un sistema de identidad. Te ayuda a definir quién te estás convirtiendo y construir hábitos diarios." },
      { q: "¿Cómo funciona la visión?", a: "8 preguntas sobre tu futuro. La IA genera una imagen y un mensaje de tu yo futuro." },
      { q: "¿Mis datos son privados?", a: "Completamente encriptados. Solo tú tienes acceso. Exporta o elimina en cualquier momento." },
      { q: "¿Puedo probarlo gratis?", a: "Sí — una vez sin cuenta. Después, crear una cuenta desbloquea más herramientas." },
      { q: "¿Qué lo hace diferente?", a: "Ves, escuchas y hablas con quien te estás convirtiendo. Lo sientes." },
      { q: "¿Cuánto cuesta?", a: "Las funciones básicas son gratis. Premium $10/mes." },
    ] },
    settings: { title: "Configuración", account: "Cuenta", profile: "Perfil", profileDesc: "Administrar cuenta", notifications: "Notificaciones", notificationsDesc: "Recordatorios", subscription: "Suscripción", subscriptionDesc: "Plan gratuito", privacy: "Privacidad", privacyControls: "Controles de privacidad", privacyDesc: "Datos y visibilidad", exportData: "Exportar datos", exportDesc: "Descargar", language: "Idioma", languageDesc: "Cambiar idioma", signOut: "Cerrar sesión" },
    languages: { en: "English", es: "Español", ru: "Русский" },
    lifeAreas: {
      health: "Salud",
      career: "Carrera",
      relationships: "Relaciones",
      mind: "Mente",
      weeklyBalance: "Balance semanal",
      areaStep: "¿A qué área pertenece?",
      areaSubtext: "Opcional — te ayuda a ver tu balance.",
    },
    moods: { energized: "Energizado", calm: "Tranquilo", neutral: "Neutral", low: "Bajo", heavy: "Pesado" },
    goodMorning: "Buenos días",
    goodAfternoon: "Buenas tardes",
    goodEvening: "Buenas noches",
    notifications: {
      morning: [
        "Empieza tu día con una pequeña victoria.",
        "Tu día te espera — comencemos.",
        "Un pequeño paso hoy puede cambiarlo todo.",
      ],
      evening: [
        "Tómate un momento para reflexionar sobre tu día.",
        "Te presentaste hoy — eso cuenta.",
      ],
      inactive: [
        "¿Quieres tomarte un minuto para ti?",
        "Hagamos una pequeña cosa hoy.",
      ],
      streak: [
        "Estás a punto de perder tu racha — mantenla viva.",
      ],
      comeback: [
        "Guardamos tu lugar.",
        "Sin presión — vuelve cuando estés listo.",
      ],
    },
  },


  ru: {
    nav: { features: "Возможности", getStarted: "Начать", testimonials: "Отзывы", faq: "Вопросы" },
    hero: { badge: "FUTURE YOU", headline: "Познакомьтесь с тем, кем вы становитесь", subtext: "Часть вас уже знает.", cta: "Начать становление", ctaAuth: "Продолжить путь", secondary: "Как это работает" },
    auth: { headline: "Познакомьтесь с тем, кем вы становитесь", subtext: "Часть вас уже знает.", google: "Продолжить с Google", apple: "Продолжить с Apple", email: "Продолжить с Email", guest: "Продолжить как гость", or: "или", createAccount: "Создать аккаунт", welcomeBack: "С возвращением", signUpDesc: "Начните создавать будущее", signInDesc: "Продолжите путешествие", emailPlaceholder: "Email", passwordPlaceholder: "Пароль", createBtn: "Создать аккаунт", signInBtn: "Войти", pleaseWait: "Подождите...", hasAccount: "Есть аккаунт? Войти", noAccount: "Нет аккаунта? Зарегистрироваться", backToAll: "← Назад" },
    onboarding: { reflectionTitle: "Это может показаться знакомым.", reflectionQuestion: "Чувствуете, что ещё не там, где могли бы быть?", no: "Нет.", notYet: "Пока нет.", almost: "Почти.", continue: "Продолжить", genderTitle: "Как к вам обращаться?", genderSubtext: "Поможет персонализировать опыт.", genderMale: "Мужчина", genderFemale: "Женщина", genderNeutral: "Не указывать" },
    home: { fromFutureSelf: "От вашего будущего «Я»", dayStreak: "Дней подряд", visionProgress: "Прогресс видения", dailyAlignment: "Ежедневная настройка", completedToday: "Вы настроены сегодня ✓", thirtySeconds: "~30 секунд", dailyAction: "Один маленький осознанный шаг. Этого достаточно.", startRitual: "Начать ритуал", alreadyDone: "Вы уже были сегодня", fallbackMessage: "Один шаг к жизни, которую вы описали. На сегодня достаточно." },
    daily: { title: "Ежедневная настройка", doneSubtext: "Вы были здесь. Это важно.", checkIn: "Тихий момент для себя.", moodTitle: "Как вы сегодня?", moodSubtext: "Нет неправильного ответа.", intentionTitle: "Один осознанный шаг.", intentionSubtext: "Что ваше будущее «Я» тихо уважало бы?", intentionPlaceholder: "напр. Буду присутствовать в каждом разговоре.", reflectionTitle: "Момент благодарности.", reflectionSubtext: "За что вы благодарны?", reflectionPlaceholder: "Что-то маленькое.", alignmentTitle: "Отразил ли день того, кем хотите стать?", alignmentSubtext: "Не оценка — ощущение.", notAtAll: "Совсем нет", fullyAligned: "Полностью", completeRitual: "Завершить ритуал", saving: "Сохранение...", todayDone: "Вы были сегодня. Это важно.", seeYou: "До завтра.", reinforcement: "Вы остаётесь настроенными.", toastTitle: "Вы были сегодня", toastDesc: "Вот как выглядит настройка." },
    greeting: { entry: ["Вы ближе, чем думаете.", "Что-то внутри уже знает путь.", "Расстояние до будущего меньше, чем кажется.", "Как воспоминание о том, что ещё не прожили.", "Сегодня важнее, чем вы думаете."], return: ["Ваше будущее «Я» хранило место.", "Вы отошли — это нормально. Вы здесь сейчас.", "Всё ещё становитесь. Всё ещё вы."] },
    welcome: { title: "С возвращением" },
    features: { headline: "Не очередное приложение.", headlineAccent: "Система идентичности.", subtext: "В вас больше, чем вы живёте. Здесь это становится реальным." },
    cta: { headline: "Познакомьтесь с тем, кем становитесь", subtext: "5 минут. Только вы — в разговоре с версией себя, которая всё поняла.", button: "Начать" },
    featureItems: [
      { title: "Запишите голос будущего", description: "Прочитайте вслух утверждения о себе — своим голосом." },
      { title: "Увидьте будущий день", description: "Яркая картина дня в жизни, которую вы описали." },
      { title: "30-секундный ритуал", description: "Одно действие. Рефлексия вечером. Маленькие шаги меняют восприятие." },
      { title: "Поговорите с будущим «Я»", description: "Настоящие вопросы. Честные ответы из вашего видения." },
      { title: "Последовательность говорит", description: "Наблюдайте рост. Тихие вехи. Обратная связь, которая резонирует." },
      { title: "Приватно. Зашифровано. Ваше.", description: "Полная конфиденциальность. Экспорт или удаление в любой момент." },
    ],
    timeline: { headline: "Ваш путь,", headlineAccent: "год за годом", subtext: "Каждая трансформация следует пути.", items: [
      { year: "Год 1", title: "Посеять семена", description: "Прояснить видение и сделать первые шаги." },
      { year: "Год 3", title: "Набрать обороты", description: "Рутины накапливаются. Перемены становятся заметными." },
      { year: "Год 5", title: "Новые высоты", description: "Вы живёте осознанно. Всё отражает того, кем стремились стать." },
      { year: "Год 10", title: "Стать будущим «Я»", description: "Видение стало жизнью. Свобода и наследие построены." },
    ] },
    social: { stats: ["Людей в становлении", "Видений создано", "Дней настройки"] },
    testimonials: { badge: "Реальные люди. Реальные перемены.", headline: "Они начали.", items: [
      { name: "Сара М.", role: "Предприниматель", quote: "Когда будущее «Я» заговорило — это было по-другому." },
      { name: "Джеймс К.", role: "Инженер", quote: "Это показывает, кем стать. Ритуал держу 60+ дней." },
      { name: "Прия Л.", role: "Студентка", quote: "Мурашки. Как встретить кого-то, кого уже знала." },
      { name: "Маркус Т.", role: "Директор", quote: "Первое приложение, изменившее моё самовосприятие." },
      { name: "Елена Р.", role: "Психотерапевт", quote: "Подход согласуется с настоящей психологией." },
      { name: "Давид В.", role: "Тренер", quote: "Показатель держит меня честным." },
      { name: "Аиша Н.", role: "Менеджер", quote: "Слушаю аудио по дороге на работу. Как ментор." },
      { name: "Том Х.", role: "Пенсионер", quote: "В 62 доказало, что перерождение возможно." },
      { name: "Лина К.", role: "Ординатор", quote: "5 минут, которые держат заземлённой." },
    ] },
    pricing: { headline: "Простые цены", subtext: "Начните бесплатно.", free: { name: "Бесплатно", price: "$0", period: "навсегда", description: "Создайте идеальную жизнь", cta: "Начать", features: ["1 план", "Ежедневный ритуал", "Базовый предпросмотр", "7-дневная история"] }, premium: { name: "Премиум", price: "$10", period: "/месяц", description: "Полный опыт", cta: "Пробная версия", features: ["Безлимитные планы", "Кинематографическая симуляция", "ИИ-чат", "Полная история", "Экспорт видения", "Приоритетная поддержка"] } },
    faq: { headline: "Часто задаваемые", headlineAccent: "вопросы", subtext: "Всё, что нужно знать.", items: [
      { q: "Что такое Future You?", a: "Система идентичности. Помогает определить, кем вы становитесь." },
      { q: "Как работает видение?", a: "8 вопросов. ИИ создаёт изображение и послание от будущего «Я»." },
      { q: "Данные приватны?", a: "Полностью зашифрованы. Только ваш доступ. Экспорт или удаление в любой момент." },
      { q: "Бесплатно?", a: "Да — один раз без регистрации. Аккаунт открывает больше." },
      { q: "Чем отличается?", a: "Вы видите, слышите и говорите с тем, кем становитесь. Это опыт." },
      { q: "Стоимость?", a: "Базовые функции бесплатны. Премиум — $10/месяц." },
    ] },
    settings: { title: "Настройки", account: "Аккаунт", profile: "Профиль", profileDesc: "Управление", notifications: "Уведомления", notificationsDesc: "Напоминания", subscription: "Подписка", subscriptionDesc: "Бесплатно", privacy: "Конфиденциальность", privacyControls: "Настройки", privacyDesc: "Данные", exportData: "Экспорт", exportDesc: "Скачать", language: "Язык", languageDesc: "Изменить язык", signOut: "Выйти" },
    languages: { en: "English", es: "Español", ru: "Русский" },
    lifeAreas: {
      health: "Здоровье",
      career: "Карьера",
      relationships: "Отношения",
      mind: "Разум",
      weeklyBalance: "Баланс за неделю",
      areaStep: "Какая область жизни?",
      areaSubtext: "Необязательно — помогает видеть баланс.",
    },
    moods: { energized: "Энергичный", calm: "Спокойный", neutral: "Нейтральный", low: "Низкий", heavy: "Тяжёлый" },
    goodMorning: "Доброе утро",
    goodAfternoon: "Добрый день",
    goodEvening: "Добрый вечер",
    notifications: {
      morning: [
        "Начните день с маленькой победы.",
        "Ваш день ждёт — давайте начнём.",
        "Маленький шаг сегодня может изменить всё.",
        "Что бы сделало ваше будущее «Я» сегодня утром?",
        "Покажитесь сегодня для своего будущего «Я».",
      ],
      evening: [
        "Уделите момент размышлению о прошедшем дне.",
        "Вы были сегодня — это считается.",
        "Отразил ли сегодняшний день того, кем хотите стать?",
        "Одно честное размышление может изменить завтра.",
        "Даже маленькие шаги важны — не упускайте их.",
      ],
      inactive: [
        "Хотите уделить минуту себе?",
        "Давайте сделаем одну маленькую вещь сегодня.",
        "Вам не нужна мотивация — только начало.",
      ],
      streak: [
        "Ваша серия под угрозой — сохраните её.",
        "Не теряйте импульс сегодня.",
      ],
      comeback: [
        "Мы сохранили ваше место.",
        "Без давления — возвращайтесь, когда будете готовы.",
        "Давайте начнём заново.",
      ],
    },
  },
};
