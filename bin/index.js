#!/usr/bin/env node

import https from "https";

// Fetches the username argument from the command line
const username = process.argv[2];

if (!username) {
  console.log("Please provide a username for GitHub");
  process.exit(1);
}

async function getRecentActivities(username) {
  const options = {
    // Info for username's github (e.g. host, path, method...)
    hostname: "api.github.com",
    path: `/users/${username}/events`,
    method: "GET",
    headers: {
      "User-Agent": "node.js", // GitHub requires a User-Agent header
    },
  };

  https.get(options, (res) => {
    let data = "";

    // Listens for 'data' events and accumulates the received data chunks into the 'data' variable
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const events = JSON.parse(data);

        if (res.statusCode === 404) {
          console.error(`User ${username} not found.`);
        } else if (events.length === 0) {
          console.log(`No recent activity found for user: ${username}`);
        } else {
          console.log("Output:");
          events.forEach((event) => {
            // For each event, checks it's type and print relevant info
            switch (event.type) {
              case "PushEvent":
                console.log(
                  `Pushed ${event.payload.commits.length} commits to ${event.repo.name}`
                );
                break;
              case "IssuesEvent":
                console.log(`Opened a new issue in ${event.repo.name}`);
                break;
              case "WatchEvent":
                console.log(`Starred ${event.repo.name}`);
                break;
              default:
                console.log(`Performed ${event.type} on ${event.repo.name}`);
                break;
            }
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
  });
}

getRecentActivities(username);
