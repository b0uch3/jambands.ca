# Jambands.ca

A simple static landing page for the Jambands.ca community.

Preview: https://b0uch3.github.io/jambands.ca/

The artist names in the page background are sized according to preliminary counts of Soundboard posts mentioning each name. The current five-band pilot covers Nero, The Slip, Burt Neilson Band, Grand Theft Bus, and Hiway Freeker. These are phrase matches, not verified artist references; ambiguous names need review before treating the counts as final.

The raw forum backup and post text are processed locally and are not stored in this public repository. The site remains at its GitHub Pages preview address until the custom domain is deliberately switched.

## Remembering BradM

`bradm.html` is a memorial to Brad McFarlane (BradM), based on the three-page community tribute thread from November 2017 through September 2019. It uses his archived forum avatar, recalls his taping and generosity in paraphrase, and links to a nero show selected by a member in that thread. Archive.org metadata identifies BradM as the uploader of that recording; it lists the taper as unknown, so the page does not attribute that particular tape to him.

`bradm-thread.html` links to the three original saved PDF pages under `archive/bradm-thread/`. These preserve the forum discussion, including posts through September 2019, after the Invision site goes offline. The files are copies of the three pages supplied by the site owner; they do not include account credentials or the raw database backup.

## Community stats

`community.html` reads a local snapshot from `data/top-members.json`. It does not contact the old forum. The first 48 visible entries from each of the September 26, 2026 saved [content](https://jambands.ca/topmembers/?filter=member_posts) and [reputation](https://jambands.ca/topmembers/?filter=pp_reputation_points) pages are preserved with rank, member ID, display name, metric, and original profile URL. The page displays the top ten in each category. Its custom avatars are local files in `assets/members/`; the site displays an initial where the forum used a generated letter avatar. Later leaderboard pages and the other dropdown categories were not part of these saved pages. The raw saved HTML, with account-specific data, is not committed.
