"use client";

import type {
  ReactNode,
} from "react";

import {
  Link,
  usePathname,
} from "@/i18n/navigation";

import {
  cn,
} from "@/lib/utils/utils";

import styles from "./NavLink.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface NavLinkProps {
  href:
    string;

  children:
    ReactNode;

  className?:
    string;

  onClick?:
    () => void;
}


/* ==========================================================================
   Nav Link
========================================================================== */

export default function NavLink({
  href,
  children,
  className,
  onClick,
}: NavLinkProps) {
  const pathname =
    usePathname();

  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href ||
        pathname.startsWith(
          `${href}/`
        );

  return (
    <Link
      href={
        href
      }
      onClick={
        onClick
      }
      data-active={
        isActive
      }
      className={cn(
        styles.link,
        className
      )}
    >
      {children}
    </Link>
  );
}