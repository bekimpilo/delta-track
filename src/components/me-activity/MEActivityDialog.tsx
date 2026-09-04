import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { MEActivity, ME_STATUSES, emptyMEActivity, computeVariance } from "./me-activity-types";

interface Props {
  record?: MEActivity | null;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  onSave: (r: MEActivity) => Promise<void> | void;
  trigger?: React.ReactNode;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
    {children}
  </div>
);

export const MEActivityDialog = ({ record, open, onOpenChange, onSave, trigger }: Props) => {
  const controlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlled ? open! : internalOpen;
  const setOpen = (o: boolean) => (controlled ? onOpenChange?.(o) : setInternalOpen(o));

  const [form, setForm] = useState<MEActivity>(emptyMEActivity);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const base = record ? { ...emptyMEActivity, ...record } : { ...emptyMEActivity };
      setForm({
        ...base,
        startDate: base.startDate ? String(base.startDate).split("T")[0] : "",
        endDate: base.endDate ? String(base.endDate).split("T")[0] : "",
      });
    }
  }, [isOpen, record]);

  const set = <K extends keyof MEActivity>(k: K, v: MEActivity[K]) =>
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "target" || k === "achieved") {
        next.variance = computeVariance(next.target, next.achieved);
      }
      return next;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger !== undefined ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !controlled ? (
        <DialogTrigger asChild>
          <Button className="gap-2"><Plus className="h-4 w-4" />Add Record</Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? "Edit M&E Activity" : "Add M&E Activity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Activity">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Activity</Label>
                <Textarea value={form.activity || ""} onChange={(e) => set("activity", e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Key Project Activity</Label>
                <Textarea value={form.keyProjectActivity || ""} onChange={(e) => set("keyProjectActivity", e.target.value)} rows={2} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Sub-Activity #</Label>
                  <Input value={form.subActivityNo || ""} onChange={(e) => set("subActivityNo", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Sub-Activities</Label>
                  <Input value={form.subActivities || ""} onChange={(e) => set("subActivities", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Task #</Label>
                  <Input value={form.taskNo || ""} onChange={(e) => set("taskNo", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Task</Label>
                  <Input value={form.task || ""} onChange={(e) => set("task", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Inputs / Resources</Label>
                <Textarea value={form.inputsResources || ""} onChange={(e) => set("inputsResources", e.target.value)} rows={2} />
              </div>
            </div>
          </Section>

          <Section title="Responsibility">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Implementing Entity</Label>
                <Input value={form.implementingEntity || ""} onChange={(e) => set("implementingEntity", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Delivery Partner</Label>
                <Input value={form.deliveryPartner || ""} onChange={(e) => set("deliveryPartner", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Responsible</Label>
                <Input value={form.responsible || ""} onChange={(e) => set("responsible", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Delivery Partner Responsible</Label>
                <Input value={form.deliveryPartnerResponsible || ""} onChange={(e) => set("deliveryPartnerResponsible", e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Timeline & Status">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status || "Not Yet Started"} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ME_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={(form.startDate as string) || ""} onChange={(e) => set("startDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={(form.endDate as string) || ""} onChange={(e) => set("endDate", e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Results">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Outputs</Label>
                <Textarea value={form.outputs || ""} onChange={(e) => set("outputs", e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Indicator</Label>
                <Textarea value={form.indicator || ""} onChange={(e) => set("indicator", e.target.value)} rows={2} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Baseline</Label>
                  <Input value={form.baseline || ""} onChange={(e) => set("baseline", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Target</Label>
                  <Input value={form.target || ""} onChange={(e) => set("target", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Achieved</Label>
                  <Input value={form.achieved || ""} onChange={(e) => set("achieved", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Variance</Label>
                  <Input value={form.variance || ""} onChange={(e) => set("variance", e.target.value)} placeholder="Auto" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Means of Verification</Label>
                <Textarea value={form.meansOfVerification || ""} onChange={(e) => set("meansOfVerification", e.target.value)} rows={2} />
              </div>
            </div>
          </Section>

          <Section title="Comments">
            <Textarea value={form.comments || ""} onChange={(e) => set("comments", e.target.value)} rows={3} />
          </Section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
