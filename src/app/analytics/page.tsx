import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AnalyticsPage() {
  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Instagram Analytics</DialogTitle>
          <DialogDescription>
            Here are your Instagram analytics.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <p>Your analytics content goes here.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
