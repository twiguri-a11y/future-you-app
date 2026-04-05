import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  push_enabled: boolean;
  in_app_enabled: boolean;
  morning_enabled: boolean;
  evening_enabled: boolean;
  morning_time: string;
  evening_time: string;
  inactive_reminders_enabled: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  push_enabled: false,
  in_app_enabled: true,
  morning_enabled: true,
  evening_enabled: true,
  morning_time: "08:00:00",
  evening_time: "20:00:00",
  inactive_reminders_enabled: true,
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    }
  }, [user]);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setPreferences({
        push_enabled: data.push_enabled,
        in_app_enabled: data.in_app_enabled,
        morning_enabled: data.morning_enabled,
        evening_enabled: data.evening_enabled,
        morning_time: data.morning_time,
        evening_time: data.evening_time,
        inactive_reminders_enabled: data.inactive_reminders_enabled,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, [fetchNotifications, fetchPreferences]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);

    await supabase
      .from("notification_preferences")
      .upsert(
        { user_id: user.id, ...newPrefs },
        { onConflict: "user_id" }
      );
  };

  return {
    notifications,
    unreadCount,
    preferences,
    loading,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    refetch: fetchNotifications,
  };
};
