type SectionHeadingProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
        {title}
      </h1>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
