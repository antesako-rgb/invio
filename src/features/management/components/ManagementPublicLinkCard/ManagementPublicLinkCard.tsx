import {
  ExternalLink,
  Link2,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

import ManagementPublicLinkCopy
  from "@/features/management/components/ManagementPublicLinkCopy/ManagementPublicLinkCopy";

import ManagementPublicLinkCardMobileToggle
  from "@/features/management/components/ManagementPublicLinkCard/ManagementPublicLinkCardMobileToggle";

import styles
  from "./ManagementPublicLinkCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface ManagementPublicLinkCardProps {
  title:
    string;

  description:
    string;

  publicPath:
    string;

  isActive:
    boolean;

  activeTitle:
    string;

  inactiveTitle:
    string;

  activeDescription:
    string;

  inactiveDescription:
    string;

  copyLabel:
    string;

  copiedLabel:
    string;

  openLabel:
    string;

  openIcon?:
    ReactNode;
}


/* ==========================================================================
   Management Public Link Card
========================================================================== */

export default function ManagementPublicLinkCard({
  title,
  description,
  publicPath,
  isActive,
  activeTitle,
  inactiveTitle,
  activeDescription,
  inactiveDescription,
  copyLabel,
  copiedLabel,
  openLabel,
  openIcon,
}: ManagementPublicLinkCardProps) {
  /* ==========================================================================
     Status
  ========================================================================== */

  const statusTitle =
    isActive
      ? activeTitle
      : inactiveTitle;

  const statusDescription =
    isActive
      ? activeDescription
      : inactiveDescription;


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
          Link
      ================================================================== */}

      <div
        className={
          styles.linkBox
        }
        data-active={
          isActive
            ? "true"
            : "false"
        }
      >
        <Link2
          aria-hidden="true"
        />

        <div
          className={
            styles.linkContent
          }
        >
          <strong>
            {statusTitle}
          </strong>

          <span
            className={
              styles.publicLink
            }
          >
            {publicPath}
          </span>

          <span
            className={
              styles.linkDescription
            }
          >
            {statusDescription}
          </span>
        </div>
      </div>


      {/* ==================================================================
          Actions
      ================================================================== */}

      <div
        className={
          styles.actions
        }
      >
        <ManagementPublicLinkCopy
          publicPath={
            publicPath
          }
          copyLabel={
            copyLabel
          }
          copiedLabel={
            copiedLabel
          }
          disabled={
            !isActive
          }
        />

        <ButtonLink
          href={
            publicPath
          }
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          aria-disabled={
            !isActive
          }
          tabIndex={
            isActive
              ? undefined
              : -1
          }
          className={
            !isActive
              ? styles.disabledAction
              : undefined
          }
        >
          {openIcon ?? (
            <ExternalLink
              aria-hidden="true"
            />
          )}

          {openLabel}
        </ButtonLink>
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
      <ManagementPublicLinkCardMobileToggle
        title={
          title
        }
        status={
          statusTitle
        }
        isActive={
          isActive
        }
      >
        {content}
      </ManagementPublicLinkCardMobileToggle>
    </Card>
  );
}