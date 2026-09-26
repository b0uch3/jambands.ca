# Jambands.ca

A simple static landing page for the Jambands.ca community.

Preview: https://b0uch3.github.io/jambands.ca/

The artist names in the page background are sized according to preliminary counts of Soundboard posts mentioning each name. The current five-band pilot covers Nero, The Slip, Burt Neilson Band, Grand Theft Bus, and Hiway Freeker. These are phrase matches, not verified artist references; ambiguous names need review before treating the counts as final.

The raw forum backup and post text are processed locally and are not stored in this public repository. The site remains at its GitHub Pages preview address until the custom domain is deliberately switched.

## Community stats

`community.html` reads a local snapshot from `data/top-members.json`. It does not contact the old forum. The first 48 visible entries from each of the September 26, 2026 saved [content](https://jambands.ca/topmembers/?filter=member_posts) and [reputation](https://jambands.ca/topmembers/?filter=pp_reputation_points) pages are preserved with rank, member ID, display name, metric, and original profile URL. The page displays the top ten in each category. Its custom avatars are local files in `assets/members/`; the site displays an initial where the forum used a generated letter avatar. Later leaderboard pages and the other dropdown categories were not part of these saved pages. The raw saved HTML, with account-specific data, is not committed.
