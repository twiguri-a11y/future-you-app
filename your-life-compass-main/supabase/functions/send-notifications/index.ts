import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Multilingual notification messages ────────────────────────────

const MESSAGES: Record<string, Record<string, { title: string; messages: string[] }>> = {
  en: {
    morning: {
      title: "Good Morning ✨",
      messages: [
        "Let's start your day with one small win.",
        "Your day is waiting — let's begin.",
        "A small step today can change everything.",
        "What would your future self do this morning?",
        "Show up for your future self today.",
        "One intentional decision can change your day.",
        "You're closer than you think. Take a step.",
        "Be intentional today — even in small moments.",
      ],
    },
    evening: {
      title: "Evening Reflection 🌙",
      messages: [
        "Take a moment to reflect on your day.",
        "You showed up today — that counts.",
        "Did today reflect who you want to become?",
        "One honest reflection can change tomorrow.",
        "Even small steps count — don't overlook them.",
        "What would you do differently tomorrow?",
        "Progress is quiet. Look for it.",
        "Reset. Tomorrow is another step forward.",
      ],
    },
    inactive: {
      title: "A gentle nudge",
      messages: [
        "Want to take a minute for yourself?",
        "Let's do one small thing today.",
        "You don't need motivation — just a start.",
      ],
    },
    streak: {
      title: "Your streak matters 🔥",
      messages: [
        "You're close to breaking your streak — keep it alive.",
        "Don't lose your momentum today.",
      ],
    },
    comeback: {
      title: "We saved your place",
      messages: [
        "We saved your place.",
        "No pressure — just come back when you're ready.",
        "Let's reset and start fresh.",
      ],
    },
  },
  de: {
    morning: {
      title: "Guten Morgen ✨",
      messages: [
        "Starte deinen Tag mit einem kleinen Erfolg.",
        "Dein Tag wartet — lass uns beginnen.",
        "Ein kleiner Schritt heute kann alles verändern.",
        "Was würde dein zukünftiges Ich heute Morgen tun?",
        "Zeig dich heute für dein zukünftiges Ich.",
        "Eine bewusste Entscheidung kann deinen Tag verändern.",
        "Du bist näher dran, als du denkst.",
        "Sei heute achtsam — auch in kleinen Momenten.",
      ],
    },
    evening: {
      title: "Abendreflexion 🌙",
      messages: [
        "Nimm dir einen Moment, um deinen Tag zu reflektieren.",
        "Du warst heute da — das zählt.",
        "Hat heute widergespiegelt, wer du werden willst?",
        "Eine ehrliche Reflexion kann morgen verändern.",
        "Auch kleine Schritte zählen — übersehe sie nicht.",
        "Was würdest du morgen anders machen?",
        "Fortschritt ist leise. Achte darauf.",
        "Neustart. Morgen ist ein neuer Schritt.",
      ],
    },
    inactive: {
      title: "Ein sanfter Hinweis",
      messages: [
        "Möchtest du dir eine Minute für dich nehmen?",
        "Lass uns heute eine Kleinigkeit tun.",
        "Du brauchst keine Motivation — nur einen Anfang.",
      ],
    },
    streak: {
      title: "Deine Serie zählt 🔥",
      messages: [
        "Deine Serie ist in Gefahr — halte sie am Leben.",
        "Verliere heute nicht dein Momentum.",
      ],
    },
    comeback: {
      title: "Wir haben deinen Platz aufgehoben",
      messages: [
        "Wir haben deinen Platz aufgehoben.",
        "Kein Druck — komm zurück, wenn du bereit bist.",
        "Lass uns neu starten.",
      ],
    },
  },
  ru: {
    morning: {
      title: "Доброе утро ✨",
      messages: [
        "Начните день с маленькой победы.",
        "Ваш день ждёт — давайте начнём.",
        "Маленький шаг сегодня может изменить всё.",
        "Что бы сделало ваше будущее «Я» сегодня утром?",
        "Покажитесь сегодня для своего будущего «Я».",
        "Одно осознанное решение может изменить день.",
        "Вы ближе, чем думаете. Сделайте шаг.",
        "Будьте осознанны сегодня — даже в мелочах.",
      ],
    },
    evening: {
      title: "Вечерняя рефлексия 🌙",
      messages: [
        "Уделите момент размышлению о прошедшем дне.",
        "Вы были сегодня — это считается.",
        "Отразил ли день того, кем хотите стать?",
        "Одно честное размышление может изменить завтра.",
        "Даже маленькие шаги важны — не упускайте их.",
        "Что бы вы сделали иначе завтра?",
        "Прогресс тих. Ищите его.",
        "Перезагрузка. Завтра — новый шаг.",
      ],
    },
    inactive: {
      title: "Мягкое напоминание",
      messages: [
        "Хотите уделить минуту себе?",
        "Давайте сделаем одну маленькую вещь сегодня.",
        "Вам не нужна мотивация — только начало.",
      ],
    },
    streak: {
      title: "Ваша серия важна 🔥",
      messages: [
        "Ваша серия под угрозой — сохраните её.",
        "Не теряйте импульс сегодня.",
      ],
    },
    comeback: {
      title: "Мы сохранили ваше место",
      messages: [
        "Мы сохранили ваше место.",
        "Без давления — возвращайтесь, когда будете готовы.",
        "Давайте начнём заново.",
      ],
    },
  },
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMessagesForLang(lang: string, type: string) {
  const l = MESSAGES[lang] || MESSAGES["en"];
  return l[type] || MESSAGES["en"][type];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json().catch(() => ({}));
    const period: string = body.period || "morning"; // "morning" | "evening" | "inactive" | "streak"

    if (period === "inactive") {
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("user_id")
        .eq("inactive_reminders_enabled", true)
        .eq("in_app_enabled", true);

      if (!prefs || prefs.length === 0) {
        return new Response(JSON.stringify({ sent: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userIds = prefs.map((p: any) => p.user_id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, last_active_at")
        .in("user_id", userIds);

      if (!profiles) {
        return new Response(JSON.stringify({ sent: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let sent = 0;
      const now = new Date();
      const lang = "en"; // Default for edge function; could be extended per-user

      for (const profile of profiles) {
        if (!profile.last_active_at) continue;
        const lastActive = new Date(profile.last_active_at);
        const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

        let type: string | null = null;
        if (diffDays >= 7) type = "comeback";
        else if (diffDays >= 4) type = "inactive";
        else if (diffDays >= 2) type = "inactive";

        if (type) {
          const msgData = getMessagesForLang(lang, type);
          const message = pickRandom(msgData.messages);
          await supabase.from("notifications").insert({
            user_id: profile.user_id,
            title: msgData.title,
            message,
            type: "re-engagement",
          });
          sent++;
        }
      }

      return new Response(JSON.stringify({ sent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Morning or evening notifications
    const timeField = period === "morning" ? "morning_enabled" : "evening_enabled";

    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("user_id")
      .eq(timeField, true)
      .eq("in_app_enabled", true);

    if (!prefs || prefs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = "en";
    const msgData = getMessagesForLang(lang, period);

    const notifications = prefs.map((p: any) => ({
      user_id: p.user_id,
      title: msgData.title,
      message: pickRandom(msgData.messages),
      type: "daily",
    }));

    const { error } = await supabase.from("notifications").insert(notifications);

    if (error) throw error;

    return new Response(JSON.stringify({ sent: notifications.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
