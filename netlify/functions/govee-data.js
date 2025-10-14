exports.handler = async function(event, context) {
  const API_KEY = process.env.GOVEE_API_KEY;
  const DEVICE_ID = "EB:BC:C7:90:81:46:28:6E";
  const SKU = "H5110";

  try {
    const response = await fetch("https://openapi.api.govee.com/router/api/v1/device/state", {
      method: "POST",
      headers: {
        "Govee-API-Key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requestId: "001",
        payload: {
          device: DEVICE_ID,
          sku: SKU
        }
      })
    });

    const data = await response.json();

    let temp = "N/A";
    let humidity = "N/A";

    if (data.payload && data.payload.capabilities) {
      data.payload.capabilities.forEach(cap => {
        if (cap.instance === "sensorTemperature") temp = cap.state.value;
        if (cap.instance === "sensorHumidity") humidity = cap.state.value;
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ temperature: temp, humidity: humidity })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
