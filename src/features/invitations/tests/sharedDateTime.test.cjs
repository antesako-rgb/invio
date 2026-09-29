/* eslint-disable @typescript-eslint/no-require-imports -- Node's CommonJS test loader compiles the real TS modules without adding dependencies. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

// Run the actual domain/session modules without adding a test dependency.
require.extensions[".ts"] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, filename);
};
require.extensions[".tsx"] = require.extensions[".ts"];
require.extensions[".css"] = module => { module.exports = { default: {} }; };

const { parseInvitationDocument } = require("../utils/parseInvitationDocument.ts");
const { setInvitationDateTime, resolveInvitationPageDateTime, applyInvitationTemplate } = require("../utils/invitationSharedDateTime.ts");
const { createInvitationPage, duplicateInvitationPage } = require("../utils/invitationDocumentOperations.ts");
const { createInvitationTemplateDocument } = require("../templates/createInvitationTemplateDocument.ts");
const { InvitationSession } = require("../editor/state/InvitationSession.ts");
const { InvitationSaveConflict } = require("../utils/invitationRevision.ts");

function page(type, content = {}) {
  return { ...createInvitationPage(type), content };
}

function legacy(pages) {
  return parseInvitationDocument({ theme: "botanical", pages });
}

test("matching canonical legacy values migrate; missing values become null", () => {
  const document = legacy([
    page("cover", { date: "2027-06-13" }),
    page("details", { date: "2027-06-13", time: "16:00" }),
  ]);
  assert.equal(document.eventDate, "2027-06-13");
  assert.equal(document.eventTime, "16:00");
  for (const item of document.pages) {
    assert.equal(item.content.date, undefined);
    assert.equal(item.content.time, undefined);
  }
  assert.equal(legacy([]).eventDate, null);
  assert.deepEqual(parseInvitationDocument(document), document);
});

test("conflicts and localized text are preserved, explicitly marked, and stable after page deletion", () => {
  const document = legacy([
    page("cover", { date: "13. lipnja 2027." }),
    page("details", { date: "2027-06-20", time: "16:00" }),
    page("details", { time: "19:00" }),
  ]);
  assert.deepEqual(document.legacyDateTime, { date: true, time: true });
  assert.equal(document.eventDate, null);
  assert.equal(resolveInvitationPageDateTime(document, document.pages[0]).content.date, "13. lipnja 2027.");
  const deleted = { ...document, pages: [document.pages[0]] };
  assert.deepEqual(parseInvitationDocument(deleted), deleted);
  const resolved = setInvitationDateTime(document, "date", "2027-06-21");
  assert.equal(resolved.pages, document.pages);
  assert.deepEqual(resolved.legacyDateTime, { time: true });
  assert.equal(resolveInvitationPageDateTime(resolved, resolved.pages[0]).content.date, "2027-06-21");
  assert.deepEqual(parseInvitationDocument(resolved), resolved);
});

test("one canonical update keeps pages unchanged, applies to new/duplicate pages, and leaves schedule alone", () => {
  const document = legacy([page("cover"), page("details"), page("schedule", { schedule: "19:00 Dinner" })]);
  const next = setInvitationDateTime(setInvitationDateTime(document, "date", "2027-06-13"), "time", "16:00");
  assert.equal(next.pages, document.pages);
  assert.equal(resolveInvitationPageDateTime(next, next.pages[0]).content.date, "2027-06-13");
  assert.equal(resolveInvitationPageDateTime(next, next.pages[1]).content.time, "16:00");
  assert.equal(resolveInvitationPageDateTime(next, page("details")).content.date, "2027-06-13");
  const duplicated = duplicateInvitationPage(next, next.pages[0].id);
  assert.equal(duplicated.eventDate, next.eventDate);
  assert.equal(duplicated.pages[1].content.date, undefined);
  assert.equal(next.pages[2].content.schedule, "19:00 Dinner");
  const cleared = setInvitationDateTime(next, "date", "");
  assert.equal(cleared.eventDate, null);
  assert.equal(resolveInvitationPageDateTime(cleared, cleared.pages[0]).content.date, "");
  assert.deepEqual(parseInvitationDocument(JSON.parse(JSON.stringify(next))), next);
});

test("canonical validation rejects presentation values and invalid dates/times, but accepts historical dates", () => {
  const document = legacy([]);
  for (const date of ["13. lipnja 2027.", "2027-02-29", "2027-13-01"]) {
    assert.throws(() => setInvitationDateTime(document, "date", date));
  }
  assert.throws(() => setInvitationDateTime(document, "time", "24:00"));
  assert.equal(setInvitationDateTime(document, "date", "2020-02-29").eventDate, "2020-02-29");
});

test("the actual Details renderer formats the resolved shared date in HR and EN", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const DateCard = require("../components/invitation-renderer/layouts/DateCard/DateCard.tsx").default;
  const document = setInvitationDateTime(legacy([page("details")]), "date", "2027-06-13");
  const resolved = resolveInvitationPageDateTime(document, document.pages[0]);
  const render = locale => renderToStaticMarkup(React.createElement(DateCard, { page: resolved, locale, photos: new Map() }));
  assert.match(render("hr"), /lipanj/);
  assert.match(render("en"), /June/);
  assert.match(render("hr"), /datetime="2027-06-13"/i);
});

test("Calendar derives leap months, six-week grids, locale week starts and handles missing dates", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const Calendar = require("../components/invitation-renderer/layouts/Calendar/Calendar.tsx").default;
  const render = (date, locale) => {
    const document = setInvitationDateTime(legacy([page("details")]), "date", date);
    return renderToStaticMarkup(React.createElement(Calendar, {
      page: resolveInvitationPageDateTime(document, document.pages[0]), locale, photos: new Map(),
    }));
  };
  const leap = render("2028-02-29", "hr");
  assert.match(leap, />29<\/time>/);
  assert.doesNotMatch(leap, />30<\/span>/);
  assert.match(leap, /<th[^>]*>pon/);
  const sixWeeks = render("2026-08-31", "en");
  assert.equal((sixWeeks.match(/<tr>/g) ?? []).length, 7);
  assert.match(sixWeeks, /<th[^>]*>Sun/);
  assert.doesNotMatch(render("", "hr"), /<table/);
});

test("template defaults are canonical, initial input wins, later application preserves owned values including null", () => {
  for (const id of ["botanical", "celebration", "conference"]) {
    const template = createInvitationTemplateDocument(id, key => key);
    assert.match(template.eventDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(template.pages.every(item => item.content.date === undefined && item.content.time === undefined));
    const initialized = createInvitationTemplateDocument(id, key => key, { eventDate: "2030-01-02", eventTime: "09:30" });
    assert.equal(initialized.eventDate, "2030-01-02");
    assert.equal(initialized.eventTime, "09:30");
    assert.equal(applyInvitationTemplate(initialized, template).eventDate, "2030-01-02");
    assert.equal(applyInvitationTemplate({ ...initialized, eventDate: null }, template).eventDate, null);
  }
});

test("session save/reload, one-step undo/redo, and revision conflict behavior", async () => {
  const document = legacy([page("cover"), page("details")]);
  let saved;
  const session = new InvitationSession(document, 1, 1, async (value, version, revision) => {
    saved = parseInvitationDocument(JSON.parse(JSON.stringify(value)));
    return { document: saved, version, revision: revision + 1 };
  });
  session.commit(value => setInvitationDateTime(value, "date", "2030-01-02"));
  assert.equal(await session.flush(), true);
  assert.equal(saved.eventDate, "2030-01-02");
  session.undo();
  assert.equal(session.getSnapshot().document.eventDate, null);
  assert.equal(session.getSnapshot().canUndo, false);
  await session.flush();
  session.redo();
  assert.equal(await session.flush(), true);
  assert.equal(saved.eventDate, "2030-01-02");
  const conflict = new InvitationSession(document, 1, 1, async () => { throw new InvitationSaveConflict(); });
  conflict.commit(value => setInvitationDateTime(value, "time", "16:00"));
  assert.equal(await conflict.flush(), false);
  assert.equal(conflict.getSnapshot().conflict, true);
});
