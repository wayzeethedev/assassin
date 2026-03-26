export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Use POST", { status: 405 });
    }

    const body = await request.json(); // get JSON from frontend
    const { code, player } = body;

    // Call MongoDB Data API
    const response = await fetch(
      "https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1/action/insertOne",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": env.MONGO_API_KEY
        },
        body: JSON.stringify({
          dataSource: "Cluster0",          // your cluster name
          database: "yourDB",              // your DB name
          collection: "codes",             // your collection name
          document: { code, player }       // the data to insert
        })
      }
    );

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  }
};