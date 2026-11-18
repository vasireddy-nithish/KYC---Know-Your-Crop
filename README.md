# Fieldnote frontend demo

A five-page multi-page HTML/CSS/JavaScript prototype.

## Run
Extract the ZIP and open `index.html` in a browser. For a better local development workflow, open the folder in VS Code and use Live Server.

## Pages
- Home: `index.html`
- Crop advisor: `recommendation.html`
- Field insights: `insights.html`
- Market watch: `market.html`
- Our approach: `approach.html`

## Important
This is a frontend prototype only. The crop form interaction is simulated; it does not call the trained `.pkl` model. Weather and market cards are placeholders, not live data. Images and fonts load from the internet.

Next: create a FastAPI backend that loads the verified model and exposes `/predict`, then replace the demo interaction in `js/main.js` with a Fetch API request.
