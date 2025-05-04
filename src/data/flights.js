const airlinePrefixes = ["TG", "SQ", "AF", "DL", "EK", "QF", "CX", "BA", "LH", "AA", "AC", "NH", "TK", "KL"];
const countries = [
  "Thailand", "Singapore", "France", "USA", "UAE", "Australia", "Hong Kong",
  "UK", "Germany", "Japan", "Korea", "Brazil", "Canada", "Turkey", "Netherlands"
];

export const generateFlights = () => {
  const flights = [];

  for (let i = 0; i < 350; i++) { // 🚀 More than 300 flights
    const callsign = `${airlinePrefixes[Math.floor(Math.random() * airlinePrefixes.length)]}${Math.floor(100 + Math.random() * 900)}`;
    const originCountry = countries[Math.floor(Math.random() * countries.length)];

    const lat = -85 + Math.random() * 170;   // avoid poles
    const lng = -180 + Math.random() * 360;  // full global range
    const heading = Math.random() * 360;
    const altitude = 9000 + Math.random() * 5000; // 9000–14000m
    const speed = 600 + Math.random() * 300;      // km/h

    flights.push({
      id: i,
      callsign,
      originCountry,
      heading,
      speed,
      position: [lng, lat, altitude]
    });
  }

  return flights;
};
