# VideoAb

## What is VideoAb?

So, a while ago, I decided I was going to make a simple little app to AB Test YouTube thumbnails. I started working on that, and it turns out that's relatively simple to do with the YouTube APIs. And then I decided I was going to actually make it pretty and release it somewhere for people to use. I even had a name: VideoAb, and a little triangle with abs as a logo! 

The thing is, polishing something enough that a general audience can use it is a lot of work. It took a while, and eventually news came out that YouTube was piloting their own AB testing tool that is way more powerful owing to its direct integration with the platform. I stopped working on VideoAb, because it was now redundant.

Recently, I realized there were still some things I wanted to polish about the project. There might be some additional changes from time to time, but no promises.

Having said that, the code in this repository is released without any warranty or guarantees. By the time you're looking at this, Google might have changed how their APIs work and it might be totally nonfunctional. If/when that happens, I can't promise that I'm going to take the time to fix it.

## How to use

VideoAb is a web app, programmed with running on a server in mind. If you want to use this code as is on your computer, there are a few steps you'll need to go through to make it work.

1. Get a Google API key and Client ID authorized to use the YouTube Data API v3. To get the most up-to-date information for how to do that, refer to [Google's "Getting Started" Page For the API.](https://developers.google.com/youtube/v3/getting-started)
2. Put the API key (and nothing else) in a file named `apikey.txt` and the Client ID (and nothing else) in a file named `clientid.txt` in the `app` directory. You could also embed them directly in the Javascript and not use the text files.
3. Run a local HTTP server. The easiest way to do this for most people is probably to install Python 3 and run the command `python -m http.server` in the VideoAb directory, but any local HTTP server you have lying around should work.

Good luck!