"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import { FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";

const links = [
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Sign Up", href: "/sign-up" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) return null;

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="md:col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            MentorLagbe
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            Helping students and tutors find the right learning partnership.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a href="https://x.com" aria-label="X" className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-primary"><FaXTwitter className="size-4" /></a>
            <a href="https://www.linkedin.com" aria-label="LinkedIn" className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-primary"><FaLinkedin className="size-4" /></a>
            <a href="https://www.instagram.com" aria-label="Instagram" className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-primary"><FaInstagram className="size-4" /></a>
          </div>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground">Explore</h2>
          <ul className="mt-4 space-y-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="size-4" aria-hidden="true" /><a href="mailto:hello@mentorlagbe.com">hello@mentorlagbe.com</a></li>
            <li className="flex items-center gap-2"><Phone className="size-4" aria-hidden="true" /><a href="tel:+8801700000000">+880 1700-000000</a></li>
            <li className="flex items-center gap-2"><MapPin className="size-4" aria-hidden="true" />Dhaka, Bangladesh</li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground">For your next step</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">Explore available classes or create a listing to meet motivated learners.</p>
          <Link href="/tuitions" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">Find a tuition</Link>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          MentorLagbe. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
