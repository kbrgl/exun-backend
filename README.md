Works in conjunction with Exun app, but you can run this repo independently.

# Setup
1. Clone repo and create a file in repo root called `.env`.
  ```
  PORT=3000
  DATABASE_URL=<database URL>
  ```
2. Install MySQL. The application expects the following setup:
  * Username: `root`
  * Password: `<EMPTY>`
  * Host: `127.0.0.1`
  * Database: `exun2018`
3. `yarn install && yarn start`
