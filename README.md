# Flow Trading Client

This is a quick and dirty demonstration of an application that talks to the
API. Accordingly, anybody can impersonate anybody, or act as an admin. However,
we restrict the signing of the JWT tokens to the server-side so that we can at
least demonstrate "normal" usage of API calls. For now, we also make no attempt
to be pretty. As this project matures, and we use it as a scaffold for
potential market applications, we can revisit the styling and layout.

**This project is under development and not presently suitable for adaptation into production environments.**

This application is built using [SvelteKit](https://kit.svelte.dev/) and opted into the new Svelte5 rune functionality. Styling is with [Tailwind CSS](https://tailwindcss.com/) and database functionality with [SQLite](https://www.sqlite.org/) + [drizzle](https://orm.drizzle.team/). A very complete set of API data schemas is implemented in [Valibot](https://valibot.dev/).

## Getting Started

Ensure you have `npm` available in your system path.

1. [Setup and run](https://github.com/forward-market-design/flow-trading-service) a flow trading server.
2. Complete [First Time Setup](#first-time-setup) below if necessary.
3. Execute `npm run dev` to launch the frontend.
4. Optional, but recommended: import the sample dataset inside the web app.

This project uses a SQLite database to store "known" accounts (to make impersonating them easier). Eventually we will make use of this database to store high-level representations of bid preferences and implement logic to "compile" them to low-level bid representations compatible with the API language, i.e. prototype "trade-to-target" languages in this application.

## First Time Setup

```bash
# Install the project dependencies
npm install

# Setup the .env file -- inspect it to view some options
cp .env.example ./.env
```
