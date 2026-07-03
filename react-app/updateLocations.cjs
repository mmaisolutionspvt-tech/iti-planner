const fs = require('fs');
const path = require('path');
const file = 'src/data/locations.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const newLocations = [
  {
    "location_id": "rome", "name": "Rome", "country": "Italy", "state": "Lazio", "lat": 41.9028, "lng": 12.4964,
    "cover_image": "/files/Rome.jpg", "avg_rating": 4.6, "total_reviews": 850, "heat_score": 0.95,
    "review_data": { "good": "Unmatched ancient history. Major landmarks like the Colosseum and Vatican Museums consistently average 4.5 to 4.7 stars. The street food and restaurant culture are top-tier.", "bad": "It is a massive, noisy, and chaotic metropolis. Reviewers frequently complain about heavy traffic, pickpockets near transit hubs, and long lines at ticketing counters." }
  },
  {
    "location_id": "florence", "name": "Florence", "country": "Italy", "state": "Tuscany", "lat": 43.7696, "lng": 11.2558,
    "cover_image": "/files/Florence.jpg", "avg_rating": 4.8, "total_reviews": 620, "heat_score": 0.9,
    "review_data": { "good": "Highly walkable and visually stunning. Key highlights like the Cathedral of Santa Maria del Fiore hold a 4.6-star rating, while specific guided experiences frequently fetch a perfect 5.0 stars from thousands of reviews.", "bad": "Massive museum crowds and high wait times for popular dining spots like All'Antico Vinaio. It can feel overly packed with study-abroad students and tour groups in the summer." }
  },
  {
    "location_id": "venice", "name": "Venice", "country": "Italy", "state": "Veneto", "lat": 45.4408, "lng": 12.3155,
    "cover_image": "/files/Venice.jpg", "avg_rating": 4.4, "total_reviews": 730, "heat_score": 0.88,
    "review_data": { "good": "Entirely unique atmosphere with a high concentration of excellent reviews for the scenic lagoon lifestyle and iconic islands like Burano.", "bad": "Receives highly polarized reviews. 'Terrible' or 'Average' marks stem from severe overcrowding, steep pricing (e.g., €5 for a basic coffee), the tourist tax, and the smell of the canals during hot, dry spells." }
  },
  {
    "location_id": "amalfi", "name": "Amalfi Coast", "country": "Italy", "state": "Campania", "lat": 40.6333, "lng": 14.6029,
    "cover_image": "/files/Amalfi_Coast.jpg", "avg_rating": 4.5, "total_reviews": 510, "heat_score": 0.92,
    "review_data": { "good": "Breathtaking, highly photogenic scenery. World-class outdoor attractions like the Sentiero Degli Dei (Path of the Gods) hike carry an incredible 4.8-star score across thousands of reviews.", "bad": "Logistical challenges. Reviewers call out heavily crowded, expensive ferries and stressful driving conditions on narrow cliff roads. Budget travelers frequently label the area as overpriced." }
  },
  {
    "location_id": "dolomites", "name": "The Dolomites", "country": "Italy", "state": "Trentino", "lat": 46.4333, "lng": 11.8500,
    "cover_image": "/files/Dolomites.jpg", "avg_rating": 4.9, "total_reviews": 320, "heat_score": 0.85,
    "review_data": { "good": "Near-perfect marks across the board. Nature lovers rate the majestic trails, alpine lakes, and clean mountain air exceptionally high. It has fewer crowds compared to Italy's coastal hot spots.", "bad": "Extremely weather-dependent. Heavy rain or unexpected mountain fog can completely ruin visibility and cancel hiking or skiing plans." }
  },
  {
    "location_id": "radhanagar", "name": "Radhanagar Beach", "country": "India", "state": "Andaman & Nicobar", "lat": 11.9833, "lng": 92.9500,
    "cover_image": "/files/Radhanagar_beach.jpg", "avg_rating": 4.8, "total_reviews": 2800, "heat_score": 0.96,
    "review_data": { "good": "Widely considered the crown jewel of the islands. Visitors rave about the flawless, pristine sand, exceptionally clean water, and spacious shoreline. It is highly praised for safe swimming and peaceful sunset views.", "bad": "Limited shaded areas and can get crowded during peak season." }
  },
  {
    "location_id": "elephant_beach", "name": "Elephant Beach", "country": "India", "state": "Andaman & Nicobar", "lat": 12.0000, "lng": 92.9500,
    "cover_image": "/files/Elephant_beach.jpg", "avg_rating": 4.5, "total_reviews": 1700, "heat_score": 0.89,
    "review_data": { "good": "A favorite for adventure seekers. Reviewers love the active marine life and coral clarity, making it excellent for snorkeling.", "bad": "Some note it can get crowded during peak hours when tourist boats arrive." }
  },
  {
    "location_id": "cellular_jail", "name": "Cellular Jail", "country": "India", "state": "Andaman & Nicobar", "lat": 11.6738, "lng": 92.7475,
    "cover_image": "/files/Cellular_jail.jpg", "avg_rating": 4.5, "total_reviews": 3100, "heat_score": 0.88,
    "review_data": { "good": "A deeply moving and educational historic site. Travelers highly recommend hiring a local guide to fully appreciate the history. The evening light and sound show is widely praised.", "bad": "Booking tickets in advance is advised as it gets sold out quickly." }
  },
  {
    "location_id": "ross_island", "name": "Ross Island", "country": "India", "state": "Andaman & Nicobar", "lat": 11.6766, "lng": 92.7630,
    "cover_image": "/files/Ross_Island.jpg", "avg_rating": 4.5, "total_reviews": 1200, "heat_score": 0.82,
    "review_data": { "good": "Highly rated for its unique atmosphere. Visitors enjoy walking through the structure ruins being overtaken by nature and interacting with the friendly, roaming deer.", "bad": "Limited facilities on the island." }
  },
  {
    "location_id": "chidiya_tapu", "name": "Chidiya Tapu", "country": "India", "state": "Andaman & Nicobar", "lat": 11.5500, "lng": 92.7000,
    "cover_image": "/files/Chidiya_Tapu.jpg", "avg_rating": 4.0, "total_reviews": 850, "heat_score": 0.75,
    "review_data": { "good": "Celebrated for its quiet, serene environment and excellent photography opportunities at sunset.", "bad": "A few reviewers mention that the road conditions leading to the spot can be bumpy, but the final view is worth the drive." }
  },
  {
    "location_id": "zermatt", "name": "Zermatt & Matterhorn", "country": "Switzerland", "state": "Valais", "lat": 46.0207, "lng": 7.7491,
    "cover_image": "/files/Matterhorn.jpg", "avg_rating": 4.9, "total_reviews": 1100, "heat_score": 0.98,
    "review_data": { "good": "Unmatched alpine drama. The car-free village of Zermatt keeps the air incredibly crisp and the atmosphere peaceful. The views of the towering Matterhorn from the town or via the Gornergrat Railway are a bucket-list spectacle that rarely disappoints.", "bad": "It is exceptionally expensive, even by Swiss standards. Because it requires a train to get in, it takes a bit more effort to reach." }
  },
  {
    "location_id": "lauterbrunnen", "name": "Lauterbrunnen", "country": "Switzerland", "state": "Bern", "lat": 46.5935, "lng": 7.9091,
    "cover_image": "/files/Lauterbrunnen.jpg", "avg_rating": 4.8, "total_reviews": 980, "heat_score": 0.96,
    "review_data": { "good": "Visually stunning and looks exactly like a real-life fairytale. Standing in a sheer-cliff valley with massive waterfalls like Staubbach plunging right next to the village is unforgettable. It serves as a fantastic base to head up to car-free towns like Wengen and Mürren.", "bad": "'Instagram fame' has made the main village street incredibly crowded during peak summer hours. It can sometimes feel more like a crowded photo-shoot location than a sleepy mountain village." }
  },
  {
    "location_id": "lucerne", "name": "Lucerne", "country": "Switzerland", "state": "Lucerne", "lat": 47.0502, "lng": 8.3093,
    "cover_image": "/files/Lucerne.jpg", "avg_rating": 4.7, "total_reviews": 1200, "heat_score": 0.92,
    "review_data": { "good": "The ultimate 'all-in-one' Swiss city. It perfectly blends a medieval Old Town with a gorgeous lakefront, historic covered bridges, and immediate access to massive mountains like Mount Pilatus and Rigi. It is highly walkable and easy to navigate.", "bad": "It is a major stop for large tour buses, meaning areas like the Chapel Bridge and the Lion Monument get heavily congested by mid-day." }
  },
  {
    "location_id": "jungfraujoch", "name": "Jungfraujoch", "country": "Switzerland", "state": "Bern", "lat": 46.5475, "lng": 7.9853,
    "cover_image": "/files/Jungfraujoch.jpg", "avg_rating": 4.4, "total_reviews": 1500, "heat_score": 0.90,
    "review_data": { "good": "An engineering marvel. Reaching 3,454 metres high via a train built inside a mountain is jaw-dropping. The Sphinx Observatory offers unreal views of the Aletsch Glacier, and standing in year-round snow is magical.", "bad": "A massive hit to your wallet. A round-trip ticket can cost upwards of CHF 200+ per person, which many travelers find overpriced if the weather is cloudy and blocks the view. It can also feel overly commercialised at the top." }
  },
  {
    "location_id": "interlaken", "name": "Interlaken", "country": "Switzerland", "state": "Bern", "lat": 46.6863, "lng": 7.8632,
    "cover_image": "/files/Interlaken.jpg", "avg_rating": 4.1, "total_reviews": 1800, "heat_score": 0.88,
    "review_data": { "good": "Unbeatable transit convenience. Interlaken sits perfectly between two stunning lakes (Thun and Brienz) and functions as the transportation heartbeat of the region. If you want to skydive, paraglide, kayak, or catch a train to any nearby valley, this is the easiest place to sleep.", "bad": "It lacks the authentic 'fairytale alpine charm' of the other destinations. The town itself is relatively flat, modern, and heavily commercialized with watch shops, hotels, and tourist-trap restaurants." }
  },
  {
    "location_id": "szgm", "name": "Sheikh Zayed Grand Mosque", "country": "United Arab Emirates", "state": "Abu Dhabi", "lat": 24.4128, "lng": 54.4750,
    "cover_image": "/files/Sheikh_Zayed_Grand_mosque.jpg", "avg_rating": 5.0, "total_reviews": 3200, "heat_score": 0.98,
    "review_data": { "good": "This is a flawless architectural marvel. From the flawless white Macedonian marble to the world's largest hand-knotted carpet, it feels less like a tourist trap and more like a sublime cultural sanctuary. Even better, entry is completely free.", "bad": "Strict dress code rules. Women must cover their heads and wear loose, ankle-length clothing. Men must cover their shoulders and knees. If you do not dress appropriately, you will be directed to change before entry." }
  },
  {
    "location_id": "burj_khalifa", "name": "Burj Khalifa", "country": "United Arab Emirates", "state": "Dubai", "lat": 25.1972, "lng": 55.2744,
    "cover_image": "/files/Burj_Khalifa.jpg", "avg_rating": 5.0, "total_reviews": 5500, "heat_score": 0.99,
    "review_data": { "good": "Standing on top of the world's tallest building is a bucket-list experience that lives up to the hype. The super-speed elevator journey to the 124th and 125th floors feels like going into orbit.", "bad": "Peak ticket prices can be expensive, and standard queues to get back down the elevators can take upwards of 45 minutes during busy sunset hours." }
  },
  {
    "location_id": "dubai_mall", "name": "The Dubai Mall", "country": "United Arab Emirates", "state": "Dubai", "lat": 25.1973, "lng": 55.2796,
    "cover_image": "/files/Dubai_mall.jpg", "avg_rating": 4.0, "total_reviews": 4200, "heat_score": 0.90,
    "review_data": { "good": "Calling it a 'mall' is an understatement. It is a massive indoor entertainment ecosystem. You can watch the outdoor Dubai Fountain show, look at sharks through the massive glass panel of the Dubai Aquarium, and ice-skate—all without purchasing a single retail item.", "bad": "It is physically exhausting. Navigating the sheer square footage means walking several kilometers just to find an exit or a taxi stand." }
  },
  {
    "location_id": "ferrari_world", "name": "Ferrari World", "country": "United Arab Emirates", "state": "Abu Dhabi", "lat": 24.4837, "lng": 54.6070,
    "cover_image": "/files/Ferrari_world.jpg", "avg_rating": 4.0, "total_reviews": 1800, "heat_score": 0.85,
    "review_data": { "good": "For thrill-seekers and car enthusiasts, this is paradise. Riding the Formula Rossa—which launches you from 0 to 240 km/h in 4.9 seconds—is worth the admission fee alone.", "bad": "If you are not a fan of extreme roller coasters or simulation rides, the entertainment value drops significantly for the price." }
  },
  {
    "location_id": "palm_jumeirah", "name": "Palm Jumeirah", "country": "United Arab Emirates", "state": "Dubai", "lat": 25.1124, "lng": 55.1390,
    "cover_image": "/files/Palm_Jumeirah.jpg", "avg_rating": 3.0, "total_reviews": 2100, "heat_score": 0.80,
    "review_data": { "good": "As an engineering marvel, it is spectacular. It boasts incredible luxury hotels, trendy beach clubs, and manicured boardwalks.", "bad": "The palm-tree shape that makes it famous is completely invisible when you are standing on it. At ground level, it feels like a standard upscale coastal highway. Traffic entering and exiting the single spine road during peak hours can also result in gridlock." }
  },
  {
    "location_id": "bali", "name": "Bali", "country": "Indonesia", "state": "Bali", "lat": -8.3405, "lng": 115.0920,
    "cover_image": "/files/Bali.jpg", "avg_rating": 4.5, "total_reviews": 3800, "heat_score": 0.97,
    "review_data": { "good": "Incredible variety of culture, food, and landscapes. You can surf in Canggu, visit temples in Ubud, and hike volcanoes all in one week. Excellent tourism infrastructure.", "bad": "Severe traffic congestion in southern areas. Highly commercialised and overcrowded during peak seasons (July–August)." }
  },
  {
    "location_id": "borobudur", "name": "Borobudur", "country": "Indonesia", "state": "Central Java", "lat": -7.6079, "lng": 110.2038,
    "cover_image": "/files/Borobudur.jpg", "avg_rating": 4.5, "total_reviews": 2200, "heat_score": 0.90,
    "review_data": { "good": "Unmatched cultural and historical depth. The temple architecture is breathtaking, and the nearby city of Yogyakarta offers authentic Javanese arts, street food, and hospitality.", "bad": "Strict regulations now limit climbing to the top structure of the temple to preserve the stones. It requires booking a specific guided slot well in advance." }
  },
  {
    "location_id": "komodo", "name": "Komodo National Park", "country": "Indonesia", "state": "East Nusa Tenggara", "lat": -8.5394, "lng": 119.4509,
    "cover_image": "/files/Komodo_national_park.jpg", "avg_rating": 4.8, "total_reviews": 1400, "heat_score": 0.93,
    "review_data": { "good": "Seeing prehistoric Komodo dragons up close is unforgettable. The dramatic, dry-grass hills meeting turquoise waters and pink sand beaches create an otherworldly landscape.", "bad": "Becoming increasingly expensive due to rising park conservation fees. It is strictly accessible only by boat tours from Labuan Bajo." }
  },
  {
    "location_id": "raja_ampat", "name": "Raja Ampat", "country": "Indonesia", "state": "West Papua", "lat": -0.2323, "lng": 130.5152,
    "cover_image": "/files/Raja_Ampat.jpg", "avg_rating": 4.9, "total_reviews": 850, "heat_score": 0.95,
    "review_data": { "good": "Absolute paradise for divers and nature purists. The marine life is unmatched globally, and the iconic mushroom-shaped karst islands offer pristine, untouched beauty.", "bad": "Very difficult and expensive to reach, requiring multiple flights and long ferry rides. Accommodation is mostly limited to eco-lodges or liveaboard boats." }
  },
  {
    "location_id": "bromo", "name": "Mount Bromo", "country": "Indonesia", "state": "East Java", "lat": -7.9425, "lng": 112.9530,
    "cover_image": "/files/Mount_Bromo.jpg", "avg_rating": 4.2, "total_reviews": 1900, "heat_score": 0.88,
    "review_data": { "good": "The sunrise viewpoint overlooking the smoking caldera and the surrounding 'Sea of Sand' is one of the most cinematic views on Earth.", "bad": "The viewpoint gets incredibly crowded at 4:00 AM, smelling heavily of jeep exhaust fumes. The sulfur smell near the crater rim can also be overpowering." }
  },
  {
    "location_id": "paris", "name": "Paris", "country": "France", "state": "Île-de-France", "lat": 48.8566, "lng": 2.3522,
    "cover_image": "/files/Paris.jpg", "avg_rating": 5.0, "total_reviews": 8500, "heat_score": 0.98,
    "review_data": { "good": "World-class museums, iconic monuments, and legendary café culture.", "bad": "High costs, large tourist crowds, and occasional city grime." }
  },
  {
    "location_id": "lyon", "name": "Lyon", "country": "France", "state": "Auvergne-Rhône-Alpes", "lat": 45.7640, "lng": 4.8357,
    "cover_image": "/files/Lyon.jpg", "avg_rating": 5.0, "total_reviews": 2100, "heat_score": 0.91,
    "review_data": { "good": "Exceptional gastronomy, stunning Renaissance architecture, and fewer tourists than Paris.", "bad": "Nightlife can be quieter during the weekdays." }
  },
  {
    "location_id": "nice", "name": "Nice", "country": "France", "state": "Provence-Alpes-Côte d'Azur", "lat": 43.7102, "lng": 7.2620,
    "cover_image": "/files/Nice.jpg", "avg_rating": 4.0, "total_reviews": 3200, "heat_score": 0.89,
    "review_data": { "good": "Beautiful beaches, vibrant markets, and proximity to the French Riviera.", "bad": "Beaches are pebbly (not sandy) and summer prices spike heavily." }
  },
  {
    "location_id": "bordeaux", "name": "Bordeaux", "country": "France", "state": "Nouvelle-Aquitaine", "lat": 44.8378, "lng": -0.5792,
    "cover_image": "/files/Bordeaux.jpg", "avg_rating": 4.0, "total_reviews": 1800, "heat_score": 0.86,
    "review_data": { "good": "Elite wine tasting, highly walkable downtown, and beautiful 18th-century design.", "bad": "Public transport to actual vineyards can be tricky without a car." }
  },
  {
    "location_id": "marseille", "name": "Marseille", "country": "France", "state": "Provence-Alpes-Côte d'Azur", "lat": 43.2965, "lng": 5.3698,
    "cover_image": "/files/Marseille.jpg", "avg_rating": 3.0, "total_reviews": 1500, "heat_score": 0.80,
    "review_data": { "good": "Incredible sea views, rich maritime history, and access to Calanques National Park.", "bad": "Some neighborhoods feel rough and city traffic is notoriously chaotic." }
  },
  {
    "location_id": "istanbul", "name": "Istanbul", "country": "Turkey", "state": "Marmara", "lat": 41.0082, "lng": 28.9784,
    "cover_image": "/files/istanbul.jpg", "avg_rating": 5.0, "total_reviews": 6500, "heat_score": 0.99,
    "review_data": { "good": "Unmatched history, incredible food, and breathtaking Bosphorus views.", "bad": "Massive crowds and heavy traffic congestion." }
  },
  {
    "location_id": "antalya", "name": "Antalya", "country": "Turkey", "state": "Mediterranean", "lat": 36.8969, "lng": 30.7133,
    "cover_image": "/files/antalya.jpg", "avg_rating": 4.5, "total_reviews": 4200, "heat_score": 0.94,
    "review_data": { "good": "Beautiful beaches, luxury resorts, and stunning ancient ruins nearby.", "bad": "Can get packed and expensive during peak summer." }
  },
  {
    "location_id": "izmir", "name": "Izmir", "country": "Turkey", "state": "Aegean", "lat": 38.4192, "lng": 27.1287,
    "cover_image": "/files/Izmir.jpg", "avg_rating": 4.5, "total_reviews": 2800, "heat_score": 0.89,
    "review_data": { "good": "Beautiful Aegean coastline, relaxed pace, and close to Ephesus.", "bad": "Fewer major historic landmarks within the city center itself." }
  },
  {
    "location_id": "bursa", "name": "Bursa", "country": "Turkey", "state": "Marmara", "lat": 40.1828, "lng": 29.0667,
    "cover_image": "/files/Bursa.jpg", "avg_rating": 4.0, "total_reviews": 1600, "heat_score": 0.82,
    "review_data": { "good": "Amazing Ottoman architecture, famous silk markets, and great skiing.", "bad": "Quieter nightlife compared to coastal cities." }
  },
  {
    "location_id": "ankara", "name": "Ankara", "country": "Turkey", "state": "Central Anatolia", "lat": 39.9334, "lng": 32.8597,
    "cover_image": "/files/ankara.jpg", "avg_rating": 3.5, "total_reviews": 1900, "heat_score": 0.78,
    "review_data": { "good": "Fantastic museums, organized streets, and lower tourist prices.", "bad": "Lacks the coastal charm or deep ancient aesthetic of other cities." }
  }
];

const existingIds = new Set(data.map(d => d.location_id));
newLocations.forEach(loc => {
  if (!existingIds.has(loc.location_id)) {
    data.push(loc);
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('Locations updated successfully!');
