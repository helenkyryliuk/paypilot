type SummaryRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

export function SummaryRow({ icon, label, value }: SummaryRowProps) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-4">
      <dt className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </dt>

      <dd className="text-right text-sm font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}
