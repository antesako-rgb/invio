import {
  CircleCheck,
  CircleDashed,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

import ManagementStatusCardMobileToggle
  from "@/features/management/components/ManagementStatusCard/ManagementStatusCardMobileToggle";

import styles
  from "./ManagementStatusCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface ManagementStatusCardProps {
  title:
    string;

  description:
    string;

  statusTitle:
    string;

  statusDescription:
    string;

  isPublished:
    boolean;

  action:
    ReactNode;
}


/* ==========================================================================
   Management Status Card
========================================================================== */

export default function ManagementStatusCard({
  title,
  description,
  statusTitle,
  statusDescription,
  isPublished,
  action,
}: ManagementStatusCardProps) {
  /* ==========================================================================
     Content
  ========================================================================== */

  const content = (
    <CardContent
      className={
        styles.content
      }
    >
      {/* ==================================================================
          Header
      ================================================================== */}

      <div
        className={
          styles.header
        }
      >
        <CardTitle>
          {title}
        </CardTitle>

        <CardDescription>
          {description}
        </CardDescription>
      </div>


      {/* ==================================================================
          Status
      ================================================================== */}

      <div
        className={
          styles.status
        }
        data-published={
          isPublished
            ? "true"
            : "false"
        }
      >
        {isPublished
          ? (
              <CircleCheck
                aria-hidden="true"
              />
            )
          : (
              <CircleDashed
                aria-hidden="true"
              />
            )}

        <div
          className={
            styles.statusContent
          }
        >
          <strong>
            {statusTitle}
          </strong>

          <span>
            {statusDescription}
          </span>
        </div>
      </div>


      {/* ==================================================================
          Action
      ================================================================== */}

      <div
        className={
          styles.actions
        }
      >
        {action}
      </div>
    </CardContent>
  );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Card
      className={
        styles.card
      }
      radius="xl"
      shadow="xs"
    >
      <ManagementStatusCardMobileToggle
        title={
          title
        }
        status={
          statusTitle
        }
        isPublished={
          isPublished
        }
      >
        {content}
      </ManagementStatusCardMobileToggle>
    </Card>
  );
}