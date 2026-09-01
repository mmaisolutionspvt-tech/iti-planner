const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/flights_demo.json','utf8'));

// Add Delhi to Bangkok
data.push({
  route_id: 'DEL-BKK',
  from: 'Delhi',
  to: 'Bangkok',
  flights: [
    {
      flight_id: 'AI-332', airline: 'Air India', logo: 'https://logo.clearbit.com/airindia.in',
      rating: 4.0, on_time_pct: 82,
      dep_time: '13:50', arr_time: '19:35', duration: '4h 15m', stops: 0,
      aircraft: 'A320neo', layout: '3-3', legroom: '31\"',
      baggage: '7kg cabin + 20kg check-in',
      wifi: true, meal: 'Complimentary Meal', pilot_exp_hrs: 9500,
      price_inr: 12500, refundable: true, tag: 'Recommended'
    },
    {
      flight_id: '6E-77', airline: 'IndiGo', logo: 'https://logo.clearbit.com/goindigo.in',
      rating: 3.9, on_time_pct: 88,
      dep_time: '05:00', arr_time: '10:40', duration: '4h 10m', stops: 0,
      aircraft: 'A321neo', layout: '3-3', legroom: '29\"',
      baggage: '7kg cabin + 20kg check-in',
      wifi: false, meal: 'Buy on Board', pilot_exp_hrs: 8000,
      price_inr: 10500, refundable: false, tag: 'Cheapest'
    },
    {
      flight_id: 'TG-316', airline: 'Thai Airways', logo: 'https://logo.clearbit.com/thaiairways.com',
      rating: 4.5, on_time_pct: 90,
      dep_time: '23:30', arr_time: '05:25', duration: '4h 25m', stops: 0,
      aircraft: 'B777-300ER', layout: '3-4-3', legroom: '32\"',
      baggage: '7kg cabin + 30kg check-in',
      wifi: true, meal: 'Premium Meal', pilot_exp_hrs: 12000,
      price_inr: 15500, refundable: true, tag: 'Fastest'
    },
    {
      flight_id: 'SG-8080', airline: 'SpiceJet', logo: 'https://logo.clearbit.com/spicejet.com',
      rating: 3.5, on_time_pct: 70,
      dep_time: '08:00', arr_time: '16:00', duration: '6h 30m', stops: 1,
      aircraft: 'B737-800', layout: '3-3', legroom: '28\"',
      baggage: '7kg cabin + 15kg check-in',
      wifi: false, meal: 'Buy on Board', pilot_exp_hrs: 6000,
      price_inr: 9500, refundable: false, tag: 'Cheapest'
    },
    {
      flight_id: 'MH-173', airline: 'Malaysia Airlines', logo: 'https://logo.clearbit.com/malaysiaairlines.com',
      rating: 4.2, on_time_pct: 85,
      dep_time: '13:00', arr_time: '23:00', duration: '8h 30m', stops: 2,
      aircraft: 'B737-800', layout: '3-3', legroom: '30\"',
      baggage: '7kg cabin + 30kg check-in',
      wifi: true, meal: 'Complimentary Meal', pilot_exp_hrs: 10000,
      price_inr: 14000, refundable: true, tag: 'Recommended'
    }
  ]
});

// Update the first flight for DEL-BOM to have 1 stop, and second to have 2 stops so filters work
data[0].flights[0].stops = 1;
data[0].flights[1].stops = 2;

fs.writeFileSync('src/data/flights_demo.json', JSON.stringify(data, null, 2), 'utf8');
console.log('Added DEL-BKK route and dummy stops!');
