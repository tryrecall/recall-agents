/**
 * Help examples shown by the Browser CLI root command.
 */
/** Core Browser CLI examples for lifecycle and inspection commands. */
export const browserCoreExamples = [
  "steelengine browser status",
  "steelengine browser start",
  "steelengine browser start --headless",
  "steelengine browser stop",
  "steelengine browser tabs",
  "steelengine browser open https://example.com",
  "steelengine browser focus abcd1234",
  "steelengine browser close abcd1234",
  "steelengine browser screenshot",
  "steelengine browser screenshot --full-page",
  "steelengine browser screenshot --ref 12",
  "steelengine browser snapshot",
  "steelengine browser snapshot --format aria --limit 200",
  "steelengine browser snapshot --efficient",
  "steelengine browser snapshot --labels",
];

/** Browser CLI examples for interaction/action commands. */
export const browserActionExamples = [
  "steelengine browser navigate https://example.com",
  "steelengine browser resize 1280 720",
  "steelengine browser click 12 --double",
  "steelengine browser click-coords 120 340",
  'steelengine browser type 23 "hello" --submit',
  "steelengine browser press Enter",
  "steelengine browser hover 44",
  "steelengine browser drag 10 11",
  "steelengine browser select 9 OptionA OptionB",
  "steelengine browser upload /tmp/steelengine/uploads/file.pdf",
  "steelengine browser upload media://inbound/file.pdf",
  'steelengine browser fill --fields \'[{"ref":"1","value":"Ada"}]\'',
  "steelengine browser dialog --accept",
  'steelengine browser wait --text "Done"',
  "steelengine browser evaluate --fn '(el) => el.textContent' --ref 7",
  "steelengine browser evaluate --fn 'const title = document.title; return title;'",
  "steelengine browser console --level error",
  "steelengine browser pdf",
];
