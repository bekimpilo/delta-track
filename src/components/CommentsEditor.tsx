import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { CommentEntry, parseComments, serializeComments, periodOptions } from "@/lib/comments";

interface CommentsEditorProps {
  /** Serialized comments value (JSON array or legacy text). */
  value: string;
  onChange: (serialized: string) => void;
  author?: string;
}

export const CommentsEditor = ({ value, onChange, author }: CommentsEditorProps) => {
  const entries = parseComments(value);
  const [period, setPeriod] = useState<string>("");
  const [text, setText] = useState("");
  const periods = periodOptions();

  const commit = (next: CommentEntry[]) => onChange(serializeComments(next));

  const addEntry = () => {
    if (!text.trim()) return;
    commit([
      ...entries,
      { period, text: text.trim(), author, createdAt: new Date().toISOString() },
    ]);
    setText("");
  };

  const removeEntry = (index: number) => commit(entries.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        Comments / Updates
      </Label>

      {entries.length > 0 && (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {entry.period && <Badge variant="secondary">{entry.period}</Badge>}
                  {entry.author && (
                    <span className="text-xs text-muted-foreground">{entry.author}</span>
                  )}
                  {entry.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{entry.text}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEntry(index)}
                aria-label="Remove comment"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
        <div className="grid gap-2 sm:grid-cols-[200px_1fr] sm:items-start">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Reporting period" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {periods.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add an update for this period…"
            rows={2}
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addEntry} disabled={!text.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add comment
        </Button>
      </div>
    </div>
  );
};
