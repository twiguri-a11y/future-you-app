import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PathTimeline from "@/components/app/PathTimeline";

const PathTimelinePage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="px-6 pt-4 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/app/path")} className="gap-1.5 -ml-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          Path
        </Button>
        <h1 className="text-xl font-bold mt-2">Your Path Ahead</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Where you're going — 1, 3, 5, and 10 years from now</p>
      </div>
      <PathTimeline />
    </div>
  );
};

export default PathTimelinePage;
