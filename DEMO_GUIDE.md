# 🚨 TERRAOPS - IDIOT-PROOF DEMO GUIDE 🚨

Read this carefully. If you follow this exactly, the demo will work perfectly and the judges will be blown away. No technical jargon, just what to click.

---

## 🛠 1. HOW TO START EVERYTHING (The Backend & Frontend)

1. Open a terminal (PowerShell or Command Prompt).
2. Go to the project folder: `cd d:\SIH`
3. Run this **one command** to start the entire database, backend, and frontend:
   `docker compose up -d`
4. **Wait 30 seconds** for it to boot up.

---

## 🌐 2. HOW TO OPEN THE WEBSITE

* Open your browser and go to: **`http://localhost:5173`**
* You are now looking at the TerraOps Dashboard.

---

## 🤖 3. HOW TO START THE TELEGRAM BOT TUNNEL

The Telegram Bot needs a tunnel to talk to your laptop.
1. Open a **new** terminal.
2. Run this command and **LEAVE IT OPEN**:
   `npx localtunnel --port 8000 --subdomain clear-sides-drive`
3. If it says `your url is: https://clear-sides-drive.loca.lt`, you are good to go!

---

## 🎬 4. THE EXACT DEMO FLOW (What to show the judges)

Do this in exact order:

**STEP 1: The Citizen Portal (Show Empathy)**
* Click **"Citizen G2C Portal"** in the sidebar.
* Switch the language dropdown to **Hindi** or **Telugu**.
* *Tell the judges:* "We built this for rural farmers to check their land records in their native language."

**STEP 2: The Data Pipeline (The USP)**
* Click **"Data Ingestion"** in the sidebar.
* Click **"Load Demo Dataset"**.
* Click **"Run Auto-Mapping"**, then **"Apply Normalization"**, then **"Run Data Quality Engine"**.
* *Tell the judges:* "Government data is always dirty. Our pipeline automatically ingests raw satellite polygons and messy municipal Excel files, fixes the errors, and commits a perfectly clean dataset."
* Click **"Commit to Canonical DB"**.

**STEP 3: The Ghost Properties (The Conflict Engine)**
* Click **"Active Workspace"** in the sidebar.
* Point to a **RED polygon** on the map.
* *Tell the judges:* "Our spatial engine overlaps physical satellite data with tax records. It found a building here that physically exists but has no owner. It's an **UNREGISTERED_ENTITY**. We just found tax leakage."

**STEP 4: The Telegram Bot (The Climax)**
* Pull out your phone (or open Telegram Web on the laptop).
* Send `/cases` to your TerraOps bot.
* Send your **Location (GPS pin)** to the bot.
* Send a **Photo** of a building to the bot.
* *Tell the judges:* "Instead of a dashboard, we dispatch field surveyors automatically via Telegram. They go to the coordinates, take a photo, and register the ghost property. We close the loop."

---

## 🛑 EMERGENCY TROUBLESHOOTING
* **Website not loading?** Run `docker compose restart frontend`
* **Bot not responding?** Restart the `npx localtunnel` command.
* **Map not loading?** Make sure you have an internet connection for the satellite tiles.
