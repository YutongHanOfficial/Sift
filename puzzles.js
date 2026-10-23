/*
 * SIFT puzzle bank.
 * Each puzzle has 8 items. The player must find the 5 that rank highest by the
 * puzzle's metric (or lowest, when order is "asc") and put them in order.
 * items: [name, value used for ranking, label shown on reveal]
 * Values are rounded / approximate where sources differ; only the ranking matters.
 */
window.SIFT_PUZZLES = [
  {
    cat: 'Geography', title: 'Most populous countries', est: 'population (millions)', ask: 'Which 5 countries have the most people?', hi: 'Most people',
    items: [
      ['India', 1451, '1.45 billion'], ['China', 1419, '1.42 billion'], ['United States', 345, '345 million'],
      ['Indonesia', 283, '283 million'], ['Pakistan', 251, '251 million'], ['Nigeria', 233, '233 million'],
      ['Brazil', 212, '212 million'], ['Bangladesh', 174, '174 million']
    ],
    fact: 'India overtook China as the world’s most populous country in 2023.', src: 'UN World Population Prospects, 2024'
  },
  {
    cat: 'Geography', title: 'Longest rivers', est: 'length (km)', ask: 'Which 5 rivers are the longest?', hi: 'Longest',
    items: [
      ['Nile', 6650, '6,650 km'], ['Amazon', 6400, '6,400 km'], ['Yangtze', 6300, '6,300 km'],
      ['Mississippi–Missouri', 6275, '6,275 km'], ['Yenisei', 5539, '5,539 km'], ['Yellow River', 5464, '5,464 km'],
      ['Ob–Irtysh', 5410, '5,410 km'], ['Congo', 4700, '4,700 km']
    ],
    fact: 'Some researchers argue the Amazon is actually longer than the Nile — it depends where you say the source is.'
  },
  {
    cat: 'Geography', title: 'Tallest mountains', est: 'height (m)', ask: 'Which 5 peaks are the tallest?', hi: 'Tallest',
    items: [
      ['Everest', 8849, '8,849 m'], ['K2', 8611, '8,611 m'], ['Kangchenjunga', 8586, '8,586 m'],
      ['Lhotse', 8516, '8,516 m'], ['Makalu', 8485, '8,485 m'], ['Cho Oyu', 8188, '8,188 m'],
      ['Dhaulagiri', 8167, '8,167 m'], ['Manaslu', 8163, '8,163 m']
    ],
    fact: 'All 14 of Earth’s 8,000-metre peaks are in the Himalaya and Karakoram ranges.'
  },
  {
    cat: 'Geography', title: 'Largest countries', est: 'area (million km²)', ask: 'Which 5 countries cover the most area?', hi: 'Largest',
    items: [
      ['Russia', 17.10, '17.1 M km²'], ['Canada', 9.98, '9.98 M km²'], ['United States', 9.83, '9.83 M km²'],
      ['China', 9.60, '9.60 M km²'], ['Brazil', 8.52, '8.52 M km²'], ['Australia', 7.69, '7.69 M km²'],
      ['India', 3.29, '3.29 M km²'], ['Argentina', 2.78, '2.78 M km²']
    ],
    fact: 'Russia is larger than Pluto’s entire surface area (about 16.6 M km²).'
  },
  {
    cat: 'Space', title: 'Biggest planets', est: 'diameter (km)', ask: 'Which 5 planets have the largest diameter?', hi: 'Widest',
    items: [
      ['Jupiter', 139820, '139,820 km'], ['Saturn', 116460, '116,460 km'], ['Uranus', 50724, '50,724 km'],
      ['Neptune', 49244, '49,244 km'], ['Earth', 12742, '12,742 km'], ['Venus', 12104, '12,104 km'],
      ['Mars', 6779, '6,779 km'], ['Mercury', 4879, '4,879 km']
    ],
    fact: 'Earth edges out Venus by only about 640 km in diameter.'
  },
  {
    cat: 'Science', title: 'Highest atomic numbers', est: 'atomic number', ask: 'Which 5 elements have the highest atomic number?', hi: 'Most protons',
    items: [
      ['Uranium', 92, 'Z = 92'], ['Lead', 82, 'Z = 82'], ['Mercury', 80, 'Z = 80'], ['Gold', 79, 'Z = 79'],
      ['Platinum', 78, 'Z = 78'], ['Tin', 50, 'Z = 50'], ['Silver', 47, 'Z = 47'], ['Iron', 26, 'Z = 26']
    ],
    fact: 'Platinum, gold and mercury sit side by side on the periodic table: 78, 79, 80.'
  },
  {
    cat: 'Tech', title: 'Oldest breakthroughs', est: 'year', yr: true, ask: 'Which 5 came first?', hi: 'Earliest', order: 'asc', bar: false,
    items: [
      ['Printing press', 1440, 'c. 1440'], ['Telescope', 1608, '1608'], ['Steam engine', 1712, '1712 (Newcomen)'],
      ['Telephone', 1876, '1876'], ['Practical light bulb', 1879, '1879'], ['Powered airplane', 1903, '1903'],
      ['Electronic television', 1927, '1927'], ['Penicillin', 1928, '1928']
    ],
    fact: 'Penicillin was discovered by accident when mould contaminated Alexander Fleming’s petri dishes.'
  },
  {
    cat: 'Geography', title: 'Largest lakes', est: 'surface area (km²)', ask: 'Which 5 lakes have the largest surface area?', hi: 'Largest',
    items: [
      ['Caspian Sea', 371000, '371,000 km²'], ['Lake Superior', 82100, '82,100 km²'], ['Lake Victoria', 68870, '68,870 km²'],
      ['Lake Huron', 59600, '59,600 km²'], ['Lake Michigan', 58000, '58,000 km²'], ['Lake Tanganyika', 32600, '32,600 km²'],
      ['Lake Baikal', 31500, '31,500 km²'], ['Great Bear Lake', 31000, '31,000 km²']
    ],
    fact: 'Baikal is only 7th by area but holds more water than all five Great Lakes combined.'
  },
  {
    cat: 'Culture', title: 'Most spoken languages', est: 'total speakers (millions)', ask: 'Which 5 languages have the most total speakers?', hi: 'Most speakers',
    items: [
      ['English', 1500, '~1.5 billion'], ['Mandarin', 1180, '~1.2 billion'], ['Hindi', 610, '~610 million'],
      ['Spanish', 560, '~560 million'], ['Bengali', 280, '~280 million'], ['German', 135, '~135 million'],
      ['Japanese', 125, '~125 million'], ['Korean', 82, '~82 million']
    ],
    fact: 'Mandarin has the most native speakers; English wins only once second-language speakers are counted.', src: 'Ethnologue (approx.)'
  },
  {
    cat: 'Tech', title: 'Tallest buildings', est: 'height (m)', ask: 'Which 5 skyscrapers are the tallest?', hi: 'Tallest',
    items: [
      ['Burj Khalifa', 828, '828 m'], ['Merdeka 118', 679, '679 m'], ['Shanghai Tower', 632, '632 m'],
      ['Makkah Clock Tower', 601, '601 m'], ['Ping An Finance Centre', 599, '599 m'], ['Lotte World Tower', 555, '555 m'],
      ['One World Trade Center', 541, '541 m'], ['Guangzhou CTF Centre', 530, '530 m']
    ],
    fact: 'Merdeka 118 in Kuala Lumpur became the world’s second-tallest building in 2023.'
  },
  {
    cat: 'History', title: 'Oldest universities', est: 'year founded', yr: true, ask: 'Which 5 universities are the oldest?', hi: 'Oldest', order: 'asc', bar: false,
    items: [
      ['Bologna', 1088, '1088'], ['Oxford', 1096, 'c. 1096'], ['Paris', 1150, 'c. 1150'], ['Cambridge', 1209, '1209'],
      ['Salamanca', 1218, '1218'], ['Padua', 1222, '1222'], ['Naples', 1224, '1224'], ['Harvard', 1636, '1636']
    ],
    fact: 'Cambridge was founded by scholars who fled Oxford after a dispute with townspeople.'
  },
  {
    cat: 'Space', title: 'Largest moons', est: 'diameter (km)', ask: 'Which 5 moons have the largest diameter?', hi: 'Widest',
    items: [
      ['Ganymede', 5268, '5,268 km'], ['Titan', 5150, '5,150 km'], ['Callisto', 4821, '4,821 km'], ['Io', 3643, '3,643 km'],
      ['The Moon', 3475, '3,475 km'], ['Europa', 3122, '3,122 km'], ['Triton', 2707, '2,707 km'], ['Titania', 1578, '1,578 km']
    ],
    fact: 'Ganymede and Titan are both wider than the planet Mercury.'
  },
  {
    cat: 'History', title: 'Medieval to early modern', est: 'year', yr: true, ask: 'Which 5 happened first?', hi: 'Earliest', order: 'asc', bar: false,
    items: [
      ['Fall of Western Rome', 476, 'AD 476'], ['Magna Carta', 1215, '1215'], ['Black Death reaches Europe', 1347, '1347'],
      ['Columbus reaches Americas', 1492, '1492'], ['Luther’s 95 Theses', 1517, '1517'], ['Shakespeare is born', 1564, '1564'],
      ['Mayflower lands', 1620, '1620'], ['Newton’s Principia', 1687, '1687']
    ],
    fact: 'Only four copies of the original 1215 Magna Carta survive.'
  },
  {
    cat: 'History', title: 'The Cold War years', est: 'year', yr: true, ask: 'Which 5 happened most recently?', hi: 'Most recent', bar: false,
    items: [
      ['Hubble launched', 1990, '1990'], ['Berlin Wall falls', 1989, '1989'], ['Chernobyl disaster', 1986, '1986'],
      ['Watergate break-in', 1972, '1972'], ['Apollo 11 Moon landing', 1969, '1969'], ['JFK assassinated', 1963, '1963'],
      ['Cuban Missile Crisis', 1962, '1962'], ['Sputnik launched', 1957, '1957']
    ],
    fact: 'Hubble launched with a flawed mirror; astronauts fitted corrective optics in 1993.'
  },
  {
    cat: 'Science', title: 'Highest melting points', est: 'melting point (°C)', ask: 'Which 5 metals melt at the highest temperature?', hi: 'Hottest melt',
    items: [
      ['Tungsten', 3422, '3,422 °C'], ['Rhenium', 3186, '3,186 °C'], ['Osmium', 3033, '3,033 °C'],
      ['Tantalum', 3017, '3,017 °C'], ['Molybdenum', 2623, '2,623 °C'], ['Platinum', 1768, '1,768 °C'],
      ['Titanium', 1668, '1,668 °C'], ['Iron', 1538, '1,538 °C']
    ],
    fact: 'Tungsten has the highest melting point of any metal, which is why it was used for light bulb filaments.'
  },
  {
    cat: 'Space', title: 'Nearest stars', est: 'distance (light-years)', ask: 'Which 5 stars are closest to the Sun?', hi: 'Closest', order: 'asc', bar: false,
    items: [
      ['Proxima Centauri', 4.24, '4.24 ly'], ['Alpha Centauri A', 4.37, '4.37 ly'], ['Barnard’s Star', 5.96, '5.96 ly'],
      ['Wolf 359', 7.86, '7.86 ly'], ['Lalande 21185', 8.31, '8.31 ly'], ['Sirius', 8.6, '8.6 ly'],
      ['Epsilon Eridani', 10.5, '10.5 ly'], ['Procyon', 11.46, '11.46 ly']
    ],
    fact: 'Most of our nearest neighbours are dim red dwarfs, invisible to the naked eye.'
  },
  {
    cat: 'Space', title: 'Brightest night stars', ask: 'Which 5 stars look brightest from Earth?', hi: 'Brightest', order: 'asc', bar: false,
    items: [
      ['Sirius', -1.46, 'mag −1.46'], ['Canopus', -0.74, 'mag −0.74'], ['Alpha Centauri', -0.27, 'mag −0.27'],
      ['Arcturus', -0.05, 'mag −0.05'], ['Vega', 0.03, 'mag 0.03'], ['Capella', 0.08, 'mag 0.08'],
      ['Rigel', 0.13, 'mag 0.13'], ['Procyon', 0.34, 'mag 0.34']
    ],
    fact: 'On the magnitude scale, lower numbers are brighter — the brightest objects go negative.'
  },
  {
    cat: 'Geography', title: 'Largest deserts', est: 'area (million km²)', ask: 'Which 5 deserts are the largest?', hi: 'Largest',
    items: [
      ['Antarctic', 14.2, '14.2 M km²'], ['Arctic', 13.9, '13.9 M km²'], ['Sahara', 9.2, '9.2 M km²'],
      ['Arabian', 2.3, '2.3 M km²'], ['Gobi', 1.3, '1.3 M km²'], ['Kalahari', 0.9, '0.9 M km²'],
      ['Patagonian', 0.67, '0.67 M km²'], ['Great Victoria', 0.35, '0.35 M km²']
    ],
    fact: 'A desert is defined by low precipitation, not heat — so the polar regions count.'
  },
  {
    cat: 'Geography', title: 'Biggest economies', est: '2024 GDP (trillion $)', ask: 'Which 5 had the largest GDP in 2024?', hi: 'Largest GDP',
    items: [
      ['United States', 29.18, '$29.2 T'], ['China', 18.75, '$18.7 T'], ['Germany', 4.66, '$4.66 T'], ['Japan', 4.03, '$4.03 T'],
      ['India', 3.89, '$3.89 T'], ['United Kingdom', 3.64, '$3.64 T'], ['France', 3.16, '$3.16 T'], ['Italy', 2.37, '$2.37 T']
    ],
    fact: 'Nominal GDP in US dollars — rankings shift with exchange rates.', src: 'IMF, 2024'
  },
  {
    cat: 'Science', title: 'Elements in Earth’s crust', est: 'share of crust by mass (%)', ask: 'Which 5 elements are most abundant in Earth’s crust?', hi: 'Most abundant',
    items: [
      ['Oxygen', 46.1, '46.1%'], ['Silicon', 28.2, '28.2%'], ['Aluminium', 8.2, '8.2%'], ['Iron', 5.6, '5.6%'],
      ['Calcium', 4.1, '4.1%'], ['Sodium', 2.4, '2.4%'], ['Magnesium', 2.3, '2.3%'], ['Potassium', 2.1, '2.1%']
    ],
    fact: 'Nearly half the rock under your feet, by mass, is oxygen — locked up in minerals.'
  },
  {
    cat: 'Science', title: 'What’s in the air', ask: 'Which 5 gases make up the most of dry air?', hi: 'Most abundant', bar: false,
    items: [
      ['Nitrogen', 78.08, '78.08%'], ['Oxygen', 20.95, '20.95%'], ['Argon', 0.93, '0.93%'], ['Carbon dioxide', 0.042, '0.042%'],
      ['Neon', 0.0018, '0.0018%'], ['Helium', 0.00052, '0.00052%'], ['Methane', 0.00019, '0.00019%'], ['Krypton', 0.00011, '0.00011%']
    ],
    fact: 'There is over 20 times more argon in the air than carbon dioxide.'
  },
  {
    cat: 'History', title: 'Longest-reigning monarchs', est: 'length of reign (years)', ask: 'Which 5 English/British monarchs reigned longest?', hi: 'Longest reign',
    items: [
      ['Elizabeth II', 70.6, '70 years'], ['Victoria', 63.6, '63 years'], ['George III', 59.3, '59 years'], ['Henry III', 56.1, '56 years'],
      ['Edward III', 50.4, '50 years'], ['Elizabeth I', 44.3, '44 years'], ['Henry VIII', 37.8, '37 years'], ['Edward I', 34.6, '34 years']
    ],
    fact: 'Henry III became king at just nine years old, in 1216.'
  },
  {
    cat: 'Tech', title: 'Oldest programming languages', est: 'year first appeared', yr: true, ask: 'Which 5 languages appeared first?', hi: 'Earliest', order: 'asc', bar: false,
    items: [
      ['Fortran', 1957, '1957'], ['Lisp', 1958, '1958'], ['COBOL', 1959, '1959'], ['BASIC', 1964, '1964'],
      ['C', 1972, '1972'], ['C++', 1985, '1985'], ['Python', 1991, '1991'], ['Java', 1995, '1995']
    ],
    fact: 'COBOL still runs a large share of the world’s banking transactions.'
  },
  {
    cat: 'Tech', title: 'Oldest tech companies', est: 'year founded', yr: true, ask: 'Which 5 companies were founded first?', hi: 'Oldest', order: 'asc', bar: false,
    items: [
      ['Nintendo', 1889, '1889'], ['IBM', 1911, '1911'], ['Samsung', 1938, '1938'], ['Hewlett-Packard', 1939, '1939'],
      ['Sony', 1946, '1946'], ['Intel', 1968, '1968'], ['Microsoft', 1975, '1975'], ['Apple', 1976, '1976']
    ],
    fact: 'Nintendo started out making hanafuda playing cards in Kyoto.'
  },
  {
    cat: 'Sports', title: 'Grand Slam kings', est: 'Grand Slam singles titles', ask: 'Which 5 men won the most Grand Slam singles titles?', hi: 'Most titles',
    items: [
      ['Novak Djokovic', 24, '24'], ['Rafael Nadal', 22, '22'], ['Roger Federer', 20, '20'], ['Pete Sampras', 14, '14'],
      ['Roy Emerson', 12, '12'], ['Björn Borg', 11, '11'], ['Rod Laver', 11, '11'], ['Andre Agassi', 8, '8']
    ],
    fact: 'Nadal won 14 of his 22 majors at Roland-Garros.'
  },
  {
    cat: 'Science', title: 'Densest elements', est: 'density (g/cm³)', ask: 'Which 5 elements are the densest?', hi: 'Densest',
    items: [
      ['Osmium', 22.59, '22.59 g/cm³'], ['Iridium', 22.56, '22.56 g/cm³'], ['Platinum', 21.45, '21.45 g/cm³'],
      ['Rhenium', 21.02, '21.02 g/cm³'], ['Gold', 19.32, '19.32 g/cm³'], ['Tungsten', 19.25, '19.25 g/cm³'],
      ['Mercury', 13.53, '13.53 g/cm³'], ['Lead', 11.34, '11.34 g/cm³']
    ],
    fact: 'Gold and tungsten are so close in density that tungsten is used to make fake gold bars.'
  },
  {
    cat: 'Geography', title: 'Highest capitals', est: 'elevation (m)', ask: 'Which 5 capitals sit at the highest elevation?', hi: 'Highest',
    items: [
      ['La Paz', 3640, '3,640 m'], ['Quito', 2850, '2,850 m'], ['Bogotá', 2640, '2,640 m'], ['Addis Ababa', 2355, '2,355 m'],
      ['Mexico City', 2240, '2,240 m'], ['Nairobi', 1795, '1,795 m'], ['Kabul', 1790, '1,790 m'], ['Tehran', 1190, '1,190 m']
    ],
    fact: 'Water boils at roughly 87 °C in La Paz, which makes cooking pasta slower.'
  },
  {
    cat: 'Culture', title: 'Composers by birth', est: 'year born', yr: true, ask: 'Which 5 composers were born first?', hi: 'Earliest', order: 'asc', bar: false,
    items: [
      ['Monteverdi', 1567, '1567'], ['Vivaldi', 1678, '1678'], ['J. S. Bach', 1685, '1685'], ['Haydn', 1732, '1732'],
      ['Mozart', 1756, '1756'], ['Beethoven', 1770, '1770'], ['Chopin', 1810, '1810'], ['Wagner', 1813, '1813']
    ],
    fact: 'Beethoven studied briefly with Haydn in Vienna.'
  },
  {
    cat: 'Culture', title: 'Masterpieces through time', est: 'year made', yr: true, ask: 'Which 5 artworks were made first?', hi: 'Earliest', order: 'asc', bar: false,
    items: [
      ['The Birth of Venus', 1485, 'c. 1485'], ['Mona Lisa', 1503, 'begun 1503'], ['Sistine Chapel ceiling', 1508, '1508–1512'],
      ['The Night Watch', 1642, '1642'], ['Girl with a Pearl Earring', 1665, 'c. 1665'], ['The Starry Night', 1889, '1889'],
      ['The Scream', 1893, '1893'], ['Guernica', 1937, '1937']
    ],
    fact: 'Michelangelo painted the Sistine ceiling standing on scaffolding, not lying on his back.'
  },
  {
    cat: 'Culture', title: 'Classic novels', est: 'year published', yr: true, ask: 'Which 5 novels were published first?', hi: 'Earliest', order: 'asc', bar: false,
    items: [
      ['Don Quixote', 1605, '1605'], ['Robinson Crusoe', 1719, '1719'], ['Gulliver’s Travels', 1726, '1726'],
      ['Pride and Prejudice', 1813, '1813'], ['Frankenstein', 1818, '1818'], ['Moby-Dick', 1851, '1851'],
      ['War and Peace', 1869, '1869'], ['Dracula', 1897, '1897']
    ],
    fact: 'Mary Shelley started writing Frankenstein at 18, during a ghost-story contest with Lord Byron.'
  },
  {
    cat: 'Nature', title: 'Longest pregnancies', est: 'gestation (days)', ask: 'Which 5 animals have the longest gestation?', hi: 'Longest',
    items: [
      ['African elephant', 650, '~22 months'], ['Giraffe', 450, '~15 months'], ['Camel', 390, '~13 months'], ['Horse', 340, '~11 months'],
      ['Human', 280, '~9 months'], ['Lion', 110, '~3.5 months'], ['Cat', 65, '~9 weeks'], ['Dog', 63, '~9 weeks']
    ],
    fact: 'Elephant calves weigh around 100 kg at birth.'
  },
  {
    cat: 'Space', title: 'Most moons', est: 'number of known moons', ask: 'Which 5 worlds have the most known moons?', hi: 'Most moons',
    items: [
      ['Saturn', 274, '~274'], ['Jupiter', 97, '~97'], ['Uranus', 28, '~28'], ['Neptune', 16, '16'], ['Pluto', 5, '5'],
      ['Mars', 2, '2'], ['Haumea', 2, '2'], ['Earth', 1, '1']
    ],
    fact: 'Most of Saturn’s moons are tiny captured rocks only a few kilometres across.', src: 'Counts keep growing with new discoveries'
  },
  {
    cat: 'Science', title: 'Mohs hardness', est: 'Mohs hardness', ask: 'Which 5 minerals are the hardest?', hi: 'Hardest',
    items: [
      ['Diamond', 10, 'Mohs 10'], ['Corundum', 9, 'Mohs 9'], ['Topaz', 8, 'Mohs 8'], ['Quartz', 7, 'Mohs 7'],
      ['Orthoclase', 6, 'Mohs 6'], ['Apatite', 5, 'Mohs 5'], ['Fluorite', 4, 'Mohs 4'], ['Calcite', 3, 'Mohs 3']
    ],
    fact: 'Rubies and sapphires are both corundum — they differ only by trace impurities.'
  },
  {
    cat: 'Science', title: 'Most acidic', ask: 'Which 5 have the lowest pH?', hi: 'Most acidic', order: 'asc', bar: false,
    items: [
      ['Battery acid', 0.8, 'pH ~0.8'], ['Stomach acid', 1.5, 'pH ~1.5'], ['Lemon juice', 2.3, 'pH ~2.3'], ['Black coffee', 5.0, 'pH ~5'],
      ['Milk', 6.7, 'pH ~6.7'], ['Blood', 7.4, 'pH ~7.4'], ['Baking soda solution', 8.3, 'pH ~8.3'], ['Bleach', 12.5, 'pH ~12.5']
    ],
    fact: 'Each step on the pH scale is a tenfold change in acidity.'
  },
  {
    cat: 'Sports', title: 'First Olympic hosts', est: 'year first hosted', yr: true, ask: 'Which 5 cities first hosted the Summer Games earliest?', hi: 'Earliest', order: 'asc', bar: false,
    items: [
      ['Athens', 1896, '1896'], ['Paris', 1900, '1900'], ['St. Louis', 1904, '1904'], ['London', 1908, '1908'],
      ['Stockholm', 1912, '1912'], ['Antwerp', 1920, '1920'], ['Amsterdam', 1928, '1928'], ['Los Angeles', 1932, '1932']
    ],
    fact: 'The 1900 Paris Games stretched over five months as part of the World’s Fair.'
  },
  {
    cat: 'Geography', title: 'Most populous US states', est: '2020 population (millions)', ask: 'Which 5 states had the most people in the 2020 census?', hi: 'Most people',
    items: [
      ['California', 39.5, '39.5 million'], ['Texas', 29.1, '29.1 million'], ['Florida', 21.5, '21.5 million'], ['New York', 20.2, '20.2 million'],
      ['Pennsylvania', 13.0, '13.0 million'], ['Illinois', 12.8, '12.8 million'], ['Ohio', 11.8, '11.8 million'], ['Georgia', 10.7, '10.7 million']
    ],
    fact: 'California has more residents than all of Canada.', src: 'US Census 2020'
  },
  {
    cat: 'Tech', title: 'Famous structures', est: 'height (m)', ask: 'Which 5 structures are the tallest?', hi: 'Tallest',
    items: [
      ['CN Tower', 553, '553 m'], ['Empire State Building', 443, '443 m (to tip)'], ['Eiffel Tower', 330, '330 m'],
      ['Golden Gate Bridge towers', 227, '227 m'], ['Space Needle', 184, '184 m'], ['Great Pyramid of Giza', 139, '139 m'],
      ['Big Ben (Elizabeth Tower)', 96, '96 m'], ['Statue of Liberty', 93, '93 m (with pedestal)']
    ],
    fact: 'The Great Pyramid was the tallest human-made structure for nearly 4,000 years.'
  },
  {
    cat: 'History', title: 'Ancient wonders', est: 'year built (negative = BC)', yr: true, ask: 'Which 5 were built first?', hi: 'Oldest', order: 'asc', bar: false,
    items: [
      ['Göbekli Tepe', -9500, 'c. 9500 BC'], ['Stonehenge', -3000, 'c. 3000 BC'], ['Great Pyramid', -2560, 'c. 2560 BC'],
      ['Parthenon', -447, '447 BC'], ['Colosseum', 80, 'AD 80'], ['Angkor Wat', 1150, 'c. 1150'],
      ['Machu Picchu', 1450, 'c. 1450'], ['Taj Mahal', 1653, '1653']
    ],
    fact: 'Göbekli Tepe predates the invention of writing, pottery and the wheel.'
  },
  {
    cat: 'Nature', title: 'Chromosome counts', est: 'number of chromosomes', ask: 'Which 5 have the most chromosomes?', hi: 'Most chromosomes',
    items: [
      ['Dog', 78, '78'], ['Horse', 64, '64'], ['Cow', 60, '60'], ['Chimpanzee', 48, '48'], ['Human', 46, '46'],
      ['Cat', 38, '38'], ['Pig', 38, '38'], ['Fruit fly', 8, '8']
    ],
    fact: 'Chromosome count says nothing about complexity — some ferns have over 1,000.'
  },
  {
    cat: 'Space', title: 'Longest days', ask: 'Which 5 planets take longest to spin once?', hi: 'Slowest spin',
    bar: false,
    items: [
      ['Venus', 5832, '243 days'], ['Mercury', 1408, '58.6 days'], ['Mars', 24.62, '24 h 37 m'], ['Earth', 23.93, '23 h 56 m'],
      ['Uranus', 17.24, '17 h 14 m'], ['Neptune', 16.11, '16 h 7 m'], ['Saturn', 10.56, '10 h 33 m'], ['Jupiter', 9.93, '9 h 56 m']
    ],
    fact: 'A day on Venus is longer than its year (225 Earth days).'
  },
  {
    cat: 'Geography', title: 'Largest islands', est: 'area (km²)', ask: 'Which 5 islands are the largest?', hi: 'Largest',
    items: [
      ['Greenland', 2130800, '2,130,800 km²'], ['New Guinea', 785753, '785,753 km²'], ['Borneo', 743330, '743,330 km²'],
      ['Madagascar', 587041, '587,041 km²'], ['Baffin Island', 507451, '507,451 km²'], ['Sumatra', 443066, '443,066 km²'],
      ['Honshu', 227960, '227,960 km²'], ['Great Britain', 209331, '209,331 km²']
    ],
    fact: 'Borneo is shared by three countries: Indonesia, Malaysia and Brunei.'
  },
  {
    cat: 'History', title: 'Votes for women', est: 'year granted', yr: true, ask: 'Which 5 countries granted nationwide women’s suffrage first?', hi: 'Earliest', order: 'asc', bar: false,
    items: [
      ['New Zealand', 1893, '1893'], ['Australia', 1902, '1902'], ['Finland', 1906, '1906'], ['Norway', 1913, '1913'],
      ['Denmark', 1915, '1915'], ['United States', 1920, '1920'], ['France', 1944, '1944'], ['Switzerland', 1971, '1971']
    ],
    fact: 'Finland was the first country to let women both vote and stand for parliament.'
  },
  {
    cat: 'Science', title: 'Scientists by birth', est: 'year born', yr: true, ask: 'Which 5 scientists were born first?', hi: 'Earliest', order: 'asc', bar: false,
    items: [
      ['Copernicus', 1473, '1473'], ['Galileo', 1564, '1564'], ['Kepler', 1571, '1571'], ['Descartes', 1596, '1596'],
      ['Newton', 1643, '1643'], ['Leibniz', 1646, '1646'], ['Euler', 1707, '1707'], ['Darwin', 1809, '1809']
    ],
    fact: 'Newton and Leibniz invented calculus independently and feuded over credit for decades.'
  },
  {
    cat: 'Science', title: 'The spectrum', ask: 'Which 5 have the longest wavelength?', hi: 'Longest wave', bar: false,
    items: [
      ['Radio waves', 1, '1 mm – 100+ km'], ['Microwaves', 0.01, '1 mm – 1 m'], ['Infrared', 1e-5, '700 nm – 1 mm'],
      ['Red light', 7e-7, '~700 nm'], ['Violet light', 4e-7, '~400 nm'], ['Ultraviolet', 1e-7, '10 – 400 nm'],
      ['X-rays', 1e-10, '0.01 – 10 nm'], ['Gamma rays', 1e-12, '< 0.01 nm']
    ],
    fact: 'Shorter wavelength means more energy per photon — which is why UV burns and radio doesn’t.'
  },
  {
    cat: 'Culture', title: 'Alphabet sizes', est: 'number of letters', ask: 'Which 5 alphabets have the most letters?', hi: 'Most letters',
    items: [
      ['Khmer', 74, '74'], ['Armenian', 38, '38'], ['Russian', 33, '33'], ['Arabic', 28, '28'], ['English', 26, '26'],
      ['Greek', 24, '24'], ['Hebrew', 22, '22'], ['Hawaiian', 13, '13']
    ],
    fact: 'Khmer holds the Guinness record for the largest alphabet.'
  },
  {
    cat: 'Sports', title: 'NBA dynasties', est: 'NBA championships', ask: 'Which 5 franchises have won the most NBA titles?', hi: 'Most titles',
    items: [
      ['Boston Celtics', 18, '18'], ['Los Angeles Lakers', 17, '17'], ['Golden State Warriors', 7, '7'], ['Chicago Bulls', 6, '6'],
      ['San Antonio Spurs', 5, '5'], ['Philadelphia 76ers', 3, '3'], ['Detroit Pistons', 3, '3'], ['Miami Heat', 3, '3']
    ],
    fact: 'The Celtics won 11 titles in 13 seasons between 1957 and 1969.'
  },
  {
    cat: 'Culture', title: 'Count the strings', est: 'number of strings', ask: 'Which 5 instruments have the most strings?', hi: 'Most strings',
    items: [
      ['Concert harp', 47, '47'], ['Sitar', 20, '~18–21'], ['12-string guitar', 12, '12'], ['Mandolin', 8, '8'],
      ['Guitar', 6, '6'], ['Banjo', 5, '5 (typical)'], ['Violin', 4, '4'], ['Ukulele', 4, '4']
    ],
    fact: 'Many of a sitar’s strings are never plucked — they vibrate in sympathy.'
  },
  {
    cat: 'Food', title: 'Chili heat', est: 'Scoville heat units', ask: 'Which 5 peppers are the hottest?', hi: 'Hottest',
    bar: false,
    items: [
      ['Pepper X', 2693000, '~2.69 M SHU'], ['Carolina Reaper', 2200000, '~2.2 M SHU'], ['Ghost pepper', 1041427, '~1 M SHU'],
      ['Habanero', 350000, '~350,000 SHU'], ['Cayenne', 50000, '~50,000 SHU'], ['Serrano', 23000, '~23,000 SHU'],
      ['Jalapeño', 8000, '~8,000 SHU'], ['Bell pepper', 0, '0 SHU']
    ],
    fact: 'Pepper X took the hottest-chili world record from the Carolina Reaper in 2023.'
  },
  {
    cat: 'Tech', title: 'First metros', est: 'year opened', yr: true, ask: 'Which 5 cities opened an underground railway first?', hi: 'Earliest', order: 'asc', bar: false,
    items: [
      ['London', 1863, '1863'], ['Budapest', 1896, '1896'], ['Paris', 1900, '1900'], ['Berlin', 1902, '1902'],
      ['New York', 1904, '1904'], ['Buenos Aires', 1913, '1913'], ['Tokyo', 1927, '1927'], ['Moscow', 1935, '1935']
    ],
    fact: 'London’s first underground trains were pulled by steam locomotives.'
  },
  {
    cat: 'Space', title: 'Space firsts', est: 'launch year', yr: true, ask: 'Which 5 missions launched first?', hi: 'Earliest', order: 'asc', bar: false,
    items: [
      ['Sputnik 1', 1957, '1957'], ['Vostok 1', 1961, '1961'], ['Apollo 11', 1969, '1969'], ['Pioneer 10', 1972, '1972'],
      ['Viking 1', 1975, '1975'], ['Voyager 1', 1977, '1977'], ['Hubble', 1990, '1990'], ['James Webb', 2021, '2021']
    ],
    fact: 'Voyager 1, launched in 1977, is the most distant human-made object.'
  }
];
