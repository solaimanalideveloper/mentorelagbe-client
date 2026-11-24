type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  as?: "h1" | "h2";
};

export function SectionHeading({ title, subtitle, as = "h2" }: SectionHeadingProps) {
  const Heading = as;

  return (
    <div className="max-w-2xl">
      <Heading className="font-heading text-3xl font-bold text-foreground md:text-4xl">
        {title}
      </Heading>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
