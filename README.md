# Medicine Reminder App

A mobile-friendly **web application** for daily tablet reminders — works in **Google Chrome** on phone or computer with **push-style notifications**.

## Features

- Splash screen → Login → Dashboard
- Add tablets with custom reminder times
- Checkbox to mark each dose as taken
- Doctor visit tracker (monthly, 7th–15th)
- **Chrome notifications** even when the tab is in the background (via service worker)
- Installable as a web app (PWA)

## Run locally

```powershell
cd "c:\Users\ELCOT\Desktop\medicine remainder"
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" run dev
```

Open **http://localhost:5173** in Chrome.

> If `npm` is not recognized, add `C:\Program Files\nodejs\` to your system PATH, or use the full path above.

## Setup notifications for your mom (Chrome)

1. Open the app in **Google Chrome** (phone or computer)
2. On the home screen, tap the green **Enable** banner — or go to **Settings**
3. Turn on **Medicine Reminders** and tap **Allow** when Chrome asks
4. Tap **Send test notification** to confirm it works
5. Add tablets with times on the **Add** screen

### For best results on phone

- Use **Chrome** (not other browsers)
- Menu (⋮) → **Install app** or **Add to Home screen**
- Allow notifications when prompted
- Keep Chrome allowed in phone **Settings → Apps → Chrome → Notifications**

### If notifications don't appear

- Check Chrome site settings: tap lock icon → **Notifications → Allow**
- Make sure reminder times are set when adding tablets
- Tap **Send test notification** in Settings to verify

## How reminders work

- The app checks every minute for scheduled tablet times
- A **service worker** runs in the background so Chrome can alert even when the tab is minimized
- Tapping a notification opens the app dashboard
- Mark tablets as taken on the home screen so you won't get repeat alerts for that dose

## Tech

- React + Vite + PWA (service worker)
- LocalStorage + IndexedDB for offline data
- Web Notifications API
