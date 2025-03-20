🍔 GEORGE EATS! Setup Guide
Follow these steps to get GEORGE EATS! up and running:

🚀 Installation Steps

1. Copy and paste the handle_food() function into main.py
2. Add the following code with the rest of the routes - Youre smart, you will find it.
   "app.router.add_get('/letseat', self.handle_food)"
  This handles the post request from the Web UI.
3. In main.py add the line "IMPORT aiohttp" - disguise already imports "web" but references are hard coded so just do it again and bring in the full package.
4. Move the following files into the static folder (replace everything in static):
    index.html
    script.js
    style.css
5. Start the server (main.py) using the instructions provided by disguise.

Enjoy!
