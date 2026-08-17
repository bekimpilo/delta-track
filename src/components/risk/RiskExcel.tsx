import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Risk, RISK_STATUSES } from "./risk-types";

export const RiskExcelTemplate = () => {
  const download = () => {
    const data = [
      {
        "Organisation": "Ministry of Health",
        "Description": "Delayed delivery of training materials",
        "Likelihood": 3,
        "Impact": 4,
        "Mitigation": "Establish contracts early; identify backup suppliers",
        "Owner": "Programme Manager",
        "Status": "Open",
        "Date Identified": "2025-01-15",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 24 }, { wch: 40 }, { wch: 12 }, { wch: 10 }, { wch: 40 }, { wch: 20 }, { wch: 14 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Risks");
    XLSX.writeFile(wb, "risk_register_template.xlsx");
    toast.success("Template downloaded");
  };
  return (
    <Button onClick={download} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />Template
    </Button>
  );
};

interface UploadProps {
  onUpload: (risks: Risk[]) => void;
}

export const RiskExcelUpload = ({ onUpload }: UploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws) as any[];
      if (!rows.length) { toast.error("Empty file"); return; }

      const parseDate = (v: unknown): string | null => {
        if (v == null || v === "") return null;
        if (typeof v === "number") {
          const d = new Date((v - 25569) * 86400 * 1000);
          return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
        }
        const d = new Date(v as string);
        return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
      };
      const num = (v: unknown) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };
      const validStatus = (s: string) =>
        (RISK_STATUSES as readonly string[]).includes(s) ? s : "Open";

      const risks: Risk[] = rows.map((r, i) => ({
        id: `${Date.now()}-${i}`,
        riskId: "",
        organisation: String(r["Organisation"] ?? r["organisation"] ?? "").trim(),
        description: String(r["Description"] ?? r["description"] ?? "").trim(),
        likelihood: num(r["Likelihood"] ?? r["likelihood"]),
        impact: num(r["Impact"] ?? r["impact"]),
        mitigation: String(r["Mitigation"] ?? r["mitigation"] ?? "").trim(),
        owner: String(r["Owner"] ?? r["owner"] ?? "").trim(),
        status: validStatus(String(r["Status"] ?? r["status"] ?? "Open").trim()),
        dateIdentified: parseDate(r["Date Identified"] ?? r["date_identified"]),
      }));

      onUpload(risks);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse Excel file");
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handle} className="hidden" id="risk-excel-upload" />
      <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2">
        <Upload className="h-4 w-4" />Bulk Upload
      </Button>
    </>
  );
};
