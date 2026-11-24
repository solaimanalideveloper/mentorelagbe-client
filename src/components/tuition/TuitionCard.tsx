import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/data";
import { BookmarkButton } from "@/components/tuition/BookmarkButton";
import type { Tuition } from "@/types";

export function TuitionCard({ tuition }: { tuition: Tuition }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {tuition.bannerImage ? (
        <Image
          src={tuition.bannerImage}
          alt={`${tuition.title} tuition`}
          width={1280}
          height={720}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-primary/10 font-heading text-lg font-semibold text-primary">
          {tuition.subject}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
            {tuition.subject}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
            {tuition.classLevel}
          </span>
        </div>
        <div className="mt-3 flex justify-end">
          <BookmarkButton tuition={tuition} />
        </div>
        <h2 className="mt-3 line-clamp-2 font-heading text-lg font-semibold text-foreground">
          {tuition.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {tuition.mode} · {tuition.daysPerWeek} days/week
        </p>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{tuition.location}</span>
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-heading text-lg font-bold text-foreground">
            {formatTaka(tuition.monthlyFee)}
            <span className="text-xs font-normal text-muted-foreground"> / month</span>
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Tutor: {tuition.tutorName}</p>
        <Button
          variant="outline"
          size="lg"
          className="mt-auto w-full"
          nativeButton={false}
          render={<Link href={`/tuitions/${tuition._id}`} />}
        >
          View Details <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}
