import "lodash.combinations";
import _ from "lodash";
// import { Pool, setGlobalDispatcher, ProxyAgent } from "undici";
import got from "got";
import { LocalStorage } from "node-localstorage";
import HttpStatus from "http-status";

const HTTP_TOO_MANY_REQUESTS = 429;

const localStorage = new LocalStorage("./storage", 200 * 1024 * 1024);
const { state, business } = loadData();

try {
  setup();
  await main();
} finally {
  saveData();
}

async function main() {
  state.execCount = (state.execCount || 0) + 1;
  // setGlobalDispatcher()

  const client = new Pool(`https://firststop.sos.nd.gov`);
  // console.log({
  //   prefixes: state.prefixes.,
  //   lastPrefixIndex: state.lastPrefixIndex,
  // });

  for (const [prefixIndex, prefix] of state.prefixes.entries()) {
    if (state.lastPrefixIndex && state.lastPrefixIndex > prefixIndex) {
      continue;
    }

    console.log(`Searching names starting with ${prefix}...`);

    const { statusCode, headers, trailers, body } = await client.request({
      path: "/api/Records/businesssearch",
      method: "POST",
      headers: {
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:93.0) Gecko/20100101 Firefox/93.0",
        accept: "*/*",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        SEARCH_VALUE: prefix,
        STARTS_WITH_YN: true,
        ACTIVE_ONLY_YN: true,
      }),
    });
    const data = await body.json();
    if (data?.rows) {
      const rows = Object.values(data.rows);
      business.push(...rows);
      console.log(`Done! Got ${rows.length} new business.`);
    } else {
      console.log("Ooops... we got no data in this request");
      console.log("--> Request data:", { statusCode, headers });

      state.toRetry.push(prefixIndex);

      if (statusCode === HttpStatus.TOO_MANY_REQUESTS) {
        const sleepDuration = +headers["retry-after"] || 3;
        console.log(
          `Too many requests! Gonna sleep for ${sleepDuration} secondzZz...`
        );
        await sleep(sleepDuration * 1000);
      }
    }

    state.lastPrefixIndex = prefixIndex;
  }

  // console.log("headers", headers);
  // console.log("data", { rows });
  // console.log("trailers", trailers);
}

function setup() {
  process.on("SIGTERM", onSignal);
  process.on("SIGINT", onSignal);
}

function saveData() {
  localStorage.setItem("state.json", JSON.stringify(state));
  localStorage.setItem("business.json", JSON.stringify(business));
}

function loadData() {
  const savedState = localStorage.getItem("state.json");
  const savedBusiness = localStorage.getItem("business.json");
  const state = {
    toRetry: [],
    ...(savedState ? JSON.parse(savedState) : false),
  };
  const business = [];

  if (savedBusiness) {
    business.push(...JSON.parse(savedBusiness));
  }

  if (!state.prefixes) {
    state.prefixes = _("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
      .combinations(2)
      .map((v) => _.join(v, ""))
      .sort((nameA, nameB) => nameA.localeCompare(nameB))
      .push(..._.range(0, 10).map((v) => `${v}`))
      .value();
  }

  return { state, business };
}

function onSignal(signal) {
  console.warn(`received signal ${signal}, shutting down`);
  saveData();
  shutdown();
}

async function shutdown() {
  process.exit(0);
}

function sleep(timeMS) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMS);
  });
}
