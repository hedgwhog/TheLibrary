# Agenda

A terminal-style agenda with a to do list and a bucket list. Single PHP app, data in one SQLite file.

## Run it

Needs PHP 8.1+ with SQLite (`sudo apt install php-cli php-sqlite3`).

**Locally**
```
php setup.php (create your account)
php -S localhost:8080
```

**On a server**
```
sudo chown -R www-data:www-data /var/www/agenda/data
cd /var/www/agenda && sudo -u www-data php setup.php
```
Use HTTPS. Set your timezone in `lib.php`. Apache is covered by the included `.htaccess`; on nginx, deny `data/`, `lib.php` and `setup.php`.

## Commands

Type `help` in the terminal on the application for details. Anything that saves asks `(y/n)` first.

```
agenda
  a  add       add a plan                       add Gym tue 19:00-20:00 [S]
  s  show      show everything about a plan     show 12
  e  edit      the whole plan in the prompt     edit 12   (or only a part: edit 12 11:00-12:00)
     copy      copy a plan to another day       copy 12 fri
     tick      tick a checklist note            tick 12 2
     rm        remove a plan                    rm 12
     skip      skip one date of a series        skip 12 21-11
     move      move one date of a series        move 12 21-11 22-11 10:00-11:00
     stop      end a repeating series           stop 12

view
  v  view      d, 3, w or m                     view w
     today     jump to today
  n  next      go forward
  p  prev      go back
  g  goto      jump to a day, week or month     goto week 48

categories
  c add        new category                     cat add Work W dashed
  c ls         list categories
  c edit       name, tag or border              cat edit W
  c rm         remove a category                cat rm W

to do
  t            open the to do list
  t add        add a to do with a deadline      todo add Pay rent 01-12 every month
  t edit       the whole to do in the prompt    todo edit 3
  t tick       tick a checklist note            todo tick 3 1
  t done       finish (removes it)              todo done 3
  t plan       book time in the agenda          todo plan 3 fri 14:00-16:00

bucket list
  b            open the bucket list
  b add        add an item (permanent!)         bucket add Learn to sail
  b done       mark completed (final)           bucket done 2
  b fail       mark failed (final)              bucket fail 3

other
  f  find      search everything                find dentist
     stats     hours per category, as a chart   stats month
  u  undo      take back your last change
  h  help      list, or help <command>          help add
     theme     dark, light or auto              theme dark
     clear     clear the output
     logout    log out
```

### Writing a plan

```
add Work tue 08:30-16:45 [W] @Office travel 40 return 25 -- [ ] laptop -- - badge -- 1. mail
add Holiday 20-12 03-01 all day
add Birthday Sam 05-03 all day every year
```

- `travel 40` and `return 25`: minutes there and back, shown above and below the plan with the time to leave and get home.
- every `--` starts a new note. `- text` is a bullet, `1. text` a numbered line, `[ ] text` a checklist (click the `[ ]` to tick it).
- `all day`: no time; with two dates it covers every day in between. Shown under the day headers.
- `edit 12` (or double-click a plan) puts the whole plan in the prompt. What you remove from that line is removed.
- one line in the agenda is 5 minutes; clicking an empty spot starts an `add` at that time.