exports.handler = async function(event, context) {
  const NUM_SENSORS = 6;
  const results = {};

  try {
    for (let i = 1; i <= NUM_SENSORS; i++) {
      const sensorEnv = process.env[`SENSOR_${i}`];
      if (!sensorEnv) continue;

      const [deviceId, sku] = sensorEnv.split(",");

      const response = await fetch("https://openapi.api.govee.com/router/api/v1/device/state", {
        method: "POST",
        headers: {
          "Govee-API-Key": process.env.GOVEE_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requestId: `req_${i}`,
          payload: { device: deviceId, sku: sku }
        })
      });

      const data = await response.json();

      let temp = null;
      let humidity = null;

      if (data.payload && data.payload.capabilities) {
        data.payload.capabilities.forEach(cap => {
          if (cap.instance === "sensorTemperature") temp = cap.state.value;
          if (cap.instance === "sensorHumidity") humidity = cap.state.value;
        });
      }

      results[`SENSOR_${i}`] = { temperature: temp, humidity: humidity };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(results)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
