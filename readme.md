# VibeClip

A web application to create and share "vibeclips" — short mixes combining movie trailers and music samples.

---

## Installation

### Backend

1. Navigate to the root of the repository.
2. Run the following commands:

```bash
npm install
npm start
````

This will install all necessary dependencies and start the backend server.

---

### Frontend

* The frontend is a static collection of HTML, JavaScript, and CSS files located in `frontend/public`.
* Simply serve these files with any static file server or open the `index.html` in your browser.

---

### DB

* The DB keeps track of basic user information (id, username) 
* It also keeps track of the generated VibeClips, associating each with the user who created them. 


---

### Backend

* All routes-session protected!
  
---

## Technologies Used

* **Express**
* **express-session**
* **Mongoose**
* And other supporting packages for a complex backend system.

---

## Features

* Integrates with **TMDb API** for movie trailers.
* Integrates with **Apple Music API** for music samples.

---

## How It Works

* Pick a movie trailer and a 30-second sample of a music track.
* Combine both to create a "vibeclip".
* Post your vibeclips on your profile.
* Browse and interact with vibeclips created by other users.

--- 

Enjoy creating your perfect vibe!

