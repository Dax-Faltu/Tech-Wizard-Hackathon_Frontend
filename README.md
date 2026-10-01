# Timetable Grove

A Smart Classroom & Timetable Scheduler built for the GrowWithGit college hackathon.
Give it subjects, faculty, rooms and blocked hours, and it generates a clash-free weekly timetable.
The look is a forest campus theme inspired by CHARUSAT.

## The challenge

> Given subjects, faculty, rooms, time slots and constraints, generate a clash-free weekly timetable.

Theme: Smart Education. Core skills: algorithms and constraint solving.

## Features

- **Constraint solver:** a backtracking algorithm that places every class with no teacher, room or batch double-booked.
- **Faculty availability:** block any slot a teacher cannot take, and the solver respects it.
- **Lab blocks:** lab subjects are placed as 2-hour blocks in lab rooms and never straddle the lunch break.
- **Fair spreading:** at most one session of a subject per batch per day, and at most 4 teaching hours per teacher per day. Days with the lightest load are tried first.
- **Three views:** the same week by batch, by teacher, or by room.
- **Manual editing with a clash radar:** click a lecture, then a free slot or another lecture, to move or swap it. Every clash is listed and highlighted in red.
- **Plain-language failure messages:** if the inputs cannot work (for example, a teacher needs more hours than they are free), it says why.
- **Who is free?:** pick a day and period to find free teachers and rooms for substitutions.
- **Insights:** faculty load, room use and day balance bars.
- **Live "now" marker** and a next-up line for the current view.
- **CSV export** and automatic saving of your inputs in the browser.

## Run it

No build step and no install.

1. Keep `index.html`, `style.css` and `script.js` in the same folder.
2. Open `index.html` in a browser.

Optional local server: `python -m http.server 8000`, then open http://localhost:8000.

The page loads two fonts (Young Serif and Figtree) from Google Fonts. Offline, it falls back to system fonts.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and content |
| `style.css` | Forest theme, layout, light and dark modes |
| `script.js` | Solver, clash checker, views, editing, export |

## How the solver works

1. **Build sessions:** each batch and subject becomes one session per weekly hour. Lab subjects become 2-hour blocks.
2. **Order them:** lab blocks first, then sessions of the most heavily loaded teachers, since they are the hardest to place.
3. **Place with backtracking:** for each session it tries days (lightest batch load first), start periods and rooms. A placement is allowed only if the batch, teacher and room are all free, the teacher is not blocked, and the daily limits hold.
4. **Undo on dead ends:** if a later session cannot be placed, it removes the last placement and tries the next option.
5. **Stop safely:** the search gives up after 300,000 placements and tells you so.

Each press of **Grow timetable** changes the random seed, so you get a different valid timetable.

## Customise

All in `script.js`:

- `DEF`: the default subjects, faculty, rooms, batches and blocked slots.
- `D`, `PT`, `PL`: the days and the period start and end times. If you change the number of periods, also update the lab start options (`[0,1,3,4]`) and the lunch row position (`p===3`) in the solver and `paint()`.
- `fd[f+'|'+d]+s.len>4`: the maximum teaching hours per teacher per day.
- `300000`: the search limit.

## Limits

- Everything runs in the browser, and data is saved in `localStorage` only.
- The week is fixed at Monday to Friday with 6 periods and a lunch break after the third.
- Lab blocks cannot be dragged by hand. Grow the timetable again to move them.
- Manual moves keep the original room, so a move can create a room clash. The clash radar will flag it.

## Ideas for next steps

- A Flask or Node backend with a saved-timetable API, as the challenge suggests.
- Room capacity and batch size constraints.
- Teacher preferences as soft constraints (for example, avoid the last period).
- Print-ready PDF export.

## Tech

Plain HTML, CSS and JavaScript. No frameworks or dependencies.
