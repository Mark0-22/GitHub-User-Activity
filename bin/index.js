#!/usr/bin/env node

import https from "https";

// Fetches the username argument from the command line
const username = process.argv[2];

if (!username) {
  console.log("Please provide a username for GitHub");
  process.exit(1);
}

const eventKeyMap = {
  PushEvent: event => console.log(`PushEvent occured on repository ${event.repository}`),
  default: event => console.log(`${event.type} occured`)
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
          const eventMap = events.reduce((prazanObjekat, event) => {
            if (!prazanObjekat[event.type]) {
              prazanObjekat[event.type] = [event]
            } else {
              prazanObjekat[event.type].push(event)
            }
            return prazanObjekat;
          }, {});


          Object.keys(eventMap).forEach(key => {
            const callback = eventKeyMap[key] | eventKeyMap.default;

            const eventArray = eventMap[key];

            eventArray.forEach(event => callback(event));
          })
        }
      } catch (err) {
        console.log(err);
      }
    });
  });
}

getRecentActivities(username);
