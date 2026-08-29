import type {
  ReactNode,
} from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import Logo
  from "@/components/ui/logo/Logo";

import styles from "./AuthFormLayout.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface AuthFormLayoutProps {
  title:
    string;

  description:
    string;

  children:
    ReactNode;
}


/* ==========================================================================
   Auth Form Layout
========================================================================== */

export default function AuthFormLayout({
  title,
  description,
  children,
}: AuthFormLayoutProps) {
  return (
    <main className={styles.page}>
      <Card className={styles.card}>
        <CardContent
          className={styles.content}
        >
          <Logo />

          <header className={styles.header}>
            <h1 className={styles.title}>
              {title}
            </h1>

            <p
              className={
                styles.description
              }
            >
              {description}
            </p>
          </header>

          {children}
        </CardContent>
      </Card>
    </main>
  );
}