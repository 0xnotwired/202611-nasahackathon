# Showing Órbita to the team

Open `../demo/orbita.html` in a current browser. It is a single file with built-in styles, diagrams and JavaScript: the walkthrough needs no installation, server, account or connection. Links to NASA documents do require a connection.

## Suggested walkthrough for a presentation

1. Show the overview: fictional profile, body map, indicators and copilot panel.
2. Select a system and change the indicator and period to explore the charts.
3. Tap "I feel different" or "Start check-in".
4. Choose an observation, add context and enter a fictional measurement and its method. The form asks for a positive number; it does not apply medical limits.
5. Review the comparison and save the episode with the administrative next step chosen.
6. Open "My progress" and "Prepare summary". A TXT file is downloaded; it is not sent to anyone.
7. Explore "On board" and "Evidence" to show how procedures and their grounding connect.

On small screens, navigation sits at the top. Buttons and forms support the keyboard; Escape closes dialogs. "Reset demo" asks for confirmation before removing the sample records added.

`../demo/final-product-vision.html` is a separate page that shows how the finished product would look with all modules built. It is a visualization for the team, not product code.

## What it represents

It is an interactive mockup of the product, created to present the concept. It lets you navigate, complete a journey, change charts, save fictional records and export a summary. It is not the final clinical software.

All values, the person and the mission are fictional. It contains no real NASA records, sensor integration, generative AI, transmission to medical staff or validated clinical protocols. NASA sources ground the design and are linked in the Evidence section; they do not certify this tool.

Records and the draft are kept only in this browser through local storage when available. Some browsers restrict storage when opening files; the mockup reports it and keeps the journey in memory while the page stays open. Do not enter real personal information. Sharing the HTML does not transfer records saved in another browser.

The recipient can download demo/orbita.html directly from the repository.

## Checks performed

JavaScript syntax was checked, along with the absence of duplicate identifiers and of external resources required by the interface. The walkthrough was run in a test DOM environment: navigation, changing indicators and periods, invalid inputs, going back while keeping data, saving, restoring, draft, summary and reset. Blocked or corrupted storage and text with HTML tags (not executed) were also checked.

The automated axe-core check on the initial DOM found no violations in the rules run; color contrast was excluded because it requires rendering. Later, to record the proposal video, the mockup was walked through in Chromium and views of the journey were reviewed. No full keyboard/screen reader test or contrast audit was done. These results are not equivalent to full accessibility conformance or clinical validation. The video was generated in the working session and is not included in this upload of text files.

The English translation of the mockup's interface (15/11/2026) was checked by opening it in headless Chrome and walking through its views; that check is described in the commit that introduced it.
