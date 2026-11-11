"use client";

import { Link } from "@/lib/i18n/navigation";
import { trackJourneyClick } from "@/lib/analytics/events";
import type { ReactNode } from "react";

/** Tracks only fixed workflow and destination IDs; never user-entered data. */
export function JourneyLink({
  href, journey, destination, locale, position, children, className,
}: {
  href: `/tools/${string}`;
  journey: string;
  destination: string;
  locale: string;
  position: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} prefetch={false} className={className}
      onClick={() => trackJourneyClick({ journey, destination, locale, position })}>
      {children}
    </Link>
  );
}
