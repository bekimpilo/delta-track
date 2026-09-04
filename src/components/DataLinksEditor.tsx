import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link2, Plus, X } from "lucide-react";
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

  const addLink = () => {
    console.log("addLink clicked, current links:", links);
    commit([...links, { url: "", source: "", description: "" }]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Link2 className="h-4 w-4 text-primary" />
          {label}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLink}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add link
        </Button>
      </div>

      {links.length === 0 && (
        <button
          type="button"
          onClick={addLink}
          className="w-full rounded-xl border border-dashed border-border bg-muted/20 p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-muted/30 transition-colors"
        >
          <div className="h-8 w-8 rounded-full border border-border bg-card flex items-center justify-center">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">No links yet. Add a URL with its data source and description.</span>
        </button>
      )}

      <div className="space-y-4">
        {links.map((link, index) => (
          <div
            key={index}
            className="group relative rounded-xl border border-border bg-card p-5 shadow-sm hover:border-primary/20 transition-all duration-200"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => commit(links.filter((_, i) => i !== index))}
              className="absolute -top-2 -right-2 h-7 w-7 rounded-full border border-border bg-card text-muted-foreground opacity-0 shadow-sm transition-all group-hover:opacity-100 hover:text-destructive hover:border-destructive/30 focus:opacity-100"
              aria-label="Remove link"
            >
              <X className="h-3.5 w-3.5" />
            </Button>

            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                  Source Name
                </Label>
                <Input
                  value={link.source}
                  onChange={(e) => updateLink(index, { source: e.target.value })}
                  placeholder="e.g. DHIS2, Training records"
                  className="bg-muted/30 border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                  URL
                </Label>
                <Input
                  value={link.url}
                  onChange={(e) => updateLink(index, { url: e.target.value })}
                  placeholder="https://example.org/report.pdf"
                  className="bg-muted/30 border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                Description (Optional)
              </Label>
              <Textarea
                value={link.description ?? ""}
                onChange={(e) => updateLink(index, { description: e.target.value })}
                placeholder="Add context about this source..."
                rows={2}
                className="bg-muted/30 border-border resize-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
