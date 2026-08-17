import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link2, Plus, Trash2 } from "lucide-react";
import { DataLink, parseDataLinks, serializeDataLinks } from "@/lib/dataLinks";

interface DataLinksEditorProps {
  /** Serialized links value (JSON string). */
  value?: string | null;
  onChange: (value: string) => void;
  label?: string;
}

export const DataLinksEditor = ({ value, onChange, label = "Data Source Links" }: DataLinksEditorProps) => {
  const links = useMemo<DataLink[]>(() => parseDataLinks(value), [value]);

  const commit = (next: DataLink[]) => onChange(serializeDataLinks(next));

  const updateLink = (index: number, patch: Partial<DataLink>) =>
    commit(links.map((link, i) => (i === index ? { ...link, ...patch } : link)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          {label}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => commit([...links, { url: "", source: "", description: "" }])}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add link
        </Button>
      </div>

      {links.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No links yet. Add a URL along with its data source and a short description.
        </p>
      )}

      <div className="space-y-3">
        {links.map((link, index) => (
          <div key={index} className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                value={link.source}
                onChange={(e) => updateLink(index, { source: e.target.value })}
                placeholder="Data source (e.g. DHIS2, Training records)"
              />
              <Input
                value={link.url}
                onChange={(e) => updateLink(index, { url: e.target.value })}
                placeholder="https://example.org/report.pdf"
              />
            </div>
            <Textarea
              value={link.description ?? ""}
              onChange={(e) => updateLink(index, { description: e.target.value })}
              placeholder="Description (optional)"
              rows={2}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => commit(links.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
