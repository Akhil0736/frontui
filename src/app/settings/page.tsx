import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-transparent">
        <Card className="w-[380px] bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Agent Settings</CardTitle>
                <CardDescription>Configure your agent's engagement settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="engage-mode" className="flex flex-col space-y-1">
                        <span>Engage on Instagram</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                            Allow the agent to interact with posts and users.
                        </span>
                    </Label>
                    <Switch id="engage-mode" />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
