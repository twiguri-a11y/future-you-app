import { motion } from "framer-motion";
import { Bell, Sun, Moon, UserX, ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationSettingsProps {
  onBack: () => void;
}

const NotificationSettings = ({ onBack }: NotificationSettingsProps) => {
  const { preferences, updatePreferences, loading } = useNotifications();

  if (loading) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="h-8 bg-muted rounded-lg animate-pulse w-1/2 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay },
  });

  return (
    <div className="p-6 max-w-lg mx-auto">
      <motion.div {...anim(0)} className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how and when you hear from your future self
        </p>
      </motion.div>

      {/* Master toggles */}
      <motion.div {...anim(0.05)} className="mb-6">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          Channels
        </h2>
        <div className="rounded-2xl bg-card shadow-card overflow-hidden divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Bell className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">In-App Notifications</p>
                <p className="text-xs text-muted-foreground">Messages inside the app</p>
              </div>
            </div>
            <Switch
              checked={preferences.in_app_enabled}
              onCheckedChange={(checked) => updatePreferences({ in_app_enabled: checked })}
            />
          </div>
        </div>
      </motion.div>

      {/* Schedule */}
      <motion.div {...anim(0.1)} className="mb-6">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          Schedule
        </h2>
        <div className="rounded-2xl bg-card shadow-card overflow-hidden divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Sun className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">Morning Message</p>
                <p className="text-xs text-muted-foreground">Identity-focused encouragement</p>
              </div>
            </div>
            <Switch
              checked={preferences.morning_enabled}
              onCheckedChange={(checked) => updatePreferences({ morning_enabled: checked })}
            />
          </div>

          {preferences.morning_enabled && (
            <div className="flex items-center justify-between p-4 bg-muted/20">
              <p className="text-sm text-muted-foreground">Preferred time</p>
              <input
                type="time"
                value={preferences.morning_time.slice(0, 5)}
                onChange={(e) => updatePreferences({ morning_time: e.target.value + ":00" })}
                className="text-sm font-semibold bg-transparent text-foreground border border-border rounded-lg px-2 py-1"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Moon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">Evening Reflection</p>
                <p className="text-xs text-muted-foreground">End-of-day check-in</p>
              </div>
            </div>
            <Switch
              checked={preferences.evening_enabled}
              onCheckedChange={(checked) => updatePreferences({ evening_enabled: checked })}
            />
          </div>

          {preferences.evening_enabled && (
            <div className="flex items-center justify-between p-4 bg-muted/20">
              <p className="text-sm text-muted-foreground">Preferred time</p>
              <input
                type="time"
                value={preferences.evening_time.slice(0, 5)}
                onChange={(e) => updatePreferences({ evening_time: e.target.value + ":00" })}
                className="text-sm font-semibold bg-transparent text-foreground border border-border rounded-lg px-2 py-1"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Re-engagement */}
      <motion.div {...anim(0.15)}>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          Re-engagement
        </h2>
        <div className="rounded-2xl bg-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <UserX className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">Come-Back Reminders</p>
                <p className="text-xs text-muted-foreground">Gentle nudges after inactivity</p>
              </div>
            </div>
            <Switch
              checked={preferences.inactive_reminders_enabled}
              onCheckedChange={(checked) =>
                updatePreferences({ inactive_reminders_enabled: checked })
              }
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationSettings;
