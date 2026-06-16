const fs = require("fs");
const path = require("path");
const { handleLanding } = require("../phases/landing");
const { handlegate } = require("../phases/gatedock");
const { handleTaxiwayIn, handleTaxiwayOut } = require("../phases/taxiway");
const { handleTakeoff } = require("../phases/takeOff");

async function handleFlight(flight, socket,flightDB) {
  const landingInfo =await handleLanding(flight, socket);
  const taxiwayIn=await handleTaxiwayIn(flight,socket);
  const gateInfo=await handlegate(flight,socket);
  const taxiwayout=await handleTaxiwayOut(flight,socket);
  const departure=await handleTakeoff(flight,socket);

  const touchdownTime = new Date(landingInfo.touchdown);
  const departureTime = new Date(departure.departureTime);
  const totalTurnaroundTime = ((departureTime - touchdownTime) / 1000).toFixed(2).toString();
  const flightRecord = {
    flightId: flight.flightId,
    airline: flight.airline,
    priority: flight.priority,
    scheduledLanding: flight.scheduledLanding,
    ...landingInfo,
    ...taxiwayIn,
    ...gateInfo,
    ...taxiwayout,
    ...departure,
    totalTurnaroundTime
  };

  flightDB.push(flightRecord);
}
async function simulateFlights(queue, socket,flightDB) {
    const priorityMap = { "high": 1, "normal": 2, "low": 3 };
    const sortedQueue = [...queue].sort((a, b) => {
      if (a.priority !== b.priority) {
        return priorityMap[a.priority] - priorityMap[b.priority];
      }
      return new Date(a.scheduledLanding) - new Date(b.scheduledLanding);
    });
      
    const flightPromises = sortedQueue.map(flight => handleFlight(flight, socket, flightDB));
    await Promise.all(flightPromises);
}
function saveSummary(flightDB) {
  const summaryFile = path.join(__dirname, "../data/summary.json");
  let summaries = [];

  if (fs.existsSync(summaryFile)) {
    summaries = JSON.parse(fs.readFileSync(summaryFile, "utf-8"));
  }
  const maxId = summaries.length > 0 ? Math.max(...summaries.map(s => s.summaryId)) : 0;
  const summaryId = maxId + 1;
  summaries.push({ summaryId, flights: flightDB });

  fs.writeFileSync(summaryFile, JSON.stringify(summaries, null, 2));

  console.log(`Summary ${summaryId} saved to summary.json`);
}

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Frontend connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Frontend disconnected:", socket.id);
    });
  });
};
module.exports.simulateFlights = simulateFlights;
module.exports.saveSummary = saveSummary;