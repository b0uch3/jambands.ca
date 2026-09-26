# Jambands.ca

A simple static landing page for the Jambands.ca community.

Preview: https://b0uch3.github.io/jambands.ca/

The artist names in the page background are sized according to preliminary counts of Soundboard posts mentioning each name. The current five-band pilot covers Nero, The Slip, Burt Neilson Band, Grand Theft Bus, and Hiway Freeker. These are phrase matches, not verified artist references; ambiguous names need review before treating the counts as final.

The raw forum backup and post text are processed locally and are not stored in this public repository. The site remains at its GitHub Pages preview address until the custom domain is deliberately switched.

## Community stats

`community.html` reads a local snapshot from `data/top-members.json`. It does not contact the old forum. The top ten values in the snapshot were transcribed from the September 2026 leaderboards for [content](https://jambands.ca/topmembers/?filter=member_posts) and [reputation](https://jambands.ca/topmembers/?filter=pp_reputation_points). They need one final check against a preserved page or database export. Avatar images and member IDs are still outstanding; the page uses visible initials until images can be archived under `assets/members/` and their relative paths added to the JSON. Do not hotlink the retiring Invision host.
