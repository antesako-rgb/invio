"use client";
import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import { Field } from "@/components/ui/field";
import { DatePicker } from "@/components/ui/picker/DatePicker";
import { TimePicker } from "@/components/ui/picker/TimePicker";
import { Section } from "@/components/ui/section";
import type { EventFormValues } from "../../../validation/event.schema";

interface Props {
  form: EventFormValues;
  disabled?: boolean;
  setField: <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => void;
}
export default function EventScheduleSection({ form, disabled = false, setField }: Props) {
  const t = useTranslations("Events.form.schedule");
  return <Section id="schedule" icon={CalendarDays} title={t("title")} description={t("description")}>
    <Field id="start_date" label={t("date.label")} required>
      <DatePicker id="start_date" value={form.start_date}
        onChange={value => { if (value) setField("start_date", value); }}
        placeholder={t("date.placeholder")} disabled={disabled} />
    </Field>
    <Field id="start_time" label={t("time.start")}>
      <TimePicker id="start_time" value={form.start_time}
        onChange={value => setField("start_time", value)} disabled={disabled} />
    </Field>
  </Section>;
}
