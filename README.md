# CYBERDEK // ATLAS

A searchable, client-side directory for lawful open-source research, infrastructure, mapping, media, and security references.

## Design principles

- Static, fast, and accessible: no tracker, account, or server database.
- Sources are shown as external references, never as endorsements.
- Favorites stay only in the visitor browser via `localStorage`.
- Potentially harmful links are preserved in a local review queue and excluded from the deployed catalog.

## Archive provenance

The starting inventory is the CC0-licensed public mirror at https://github.com/osint4all/osint4all.github.io, which identifies https://start.me/p/L1rEYQ/osint4all as its original Start.me source.

## Local build

```sh
npm run build:catalog
npx serve public
```
