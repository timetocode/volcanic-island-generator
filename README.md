Volcanic Island Generator
=========================
A procedural terrain generator for use in games.

![alt tag](http://media.tumblr.com/af28f8b8cc90f43666840150ae3a6c87/tumblr_inline_n9vw25LVWI1r61t4c.png)

More pictures of the output: http://timetocode.tumblr.com/post/93970694121/volcanic-map-generation-step-by-step

Open index.html to run the generator (requires app.js as well). Only tested in chrome so far.

The code is clientside javascript, but it is written in a node.js style and built with watchify. https://github.com/substack/watchify

app.js is built with
```
watchify main.js -o app.js
```

There are a collection of renderer calls at the bottom of main.js that can be uncommented, and correspond to the each of the pictures from blog post.

