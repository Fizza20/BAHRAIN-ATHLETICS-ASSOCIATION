/**
 * DEMO CONTENT. Everything in this file is placeholder data for the prototype.
 * Rows are written with is_demo = 1 and shown with a DEMO badge in the UI.
 * Names are illustrative and do not refer to real athletes.
 */

export const demoAthletes = [
  { slug: "demo-yusuf-al-mannai", firstName: "Yusuf", lastName: "Al-Mannai", gender: "men", category: "senior", discipline: "400m-hurdles", club: "Riffa Athletics Club", birthYear: 2000 },
  { slug: "demo-maryam-al-sayed", firstName: "Maryam", lastName: "Al-Sayed", gender: "women", category: "senior", discipline: "100m-hurdles", club: "Muharraq Club", birthYear: 2001 },
  { slug: "demo-hamad-jasim", firstName: "Hamad", lastName: "Jasim", gender: "men", category: "senior", discipline: "javelin", club: "Isa Town Club", birthYear: 1998 },
  { slug: "demo-noor-abdulla", firstName: "Noor", lastName: "Abdulla", gender: "women", category: "u20", discipline: "800m", club: "Manama Club", birthYear: 2007 },
  { slug: "demo-salman-al-hashimi", firstName: "Salman", lastName: "Al-Hashimi", gender: "men", category: "senior", discipline: "shot-put", club: "Riffa Athletics Club", birthYear: 1997 },
  { slug: "demo-fatima-al-zayani", firstName: "Fatima", lastName: "Al-Zayani", gender: "women", category: "senior", discipline: "long-jump", club: "Muharraq Club", birthYear: 1999 },
  { slug: "demo-khalid-buali", firstName: "Khalid", lastName: "Buali", gender: "men", category: "u20", discipline: "1500m", club: "Sitra Club", birthYear: 2007 },
  { slug: "demo-huda-mohamed", firstName: "Huda", lastName: "Mohamed", gender: "women", category: "u18", discipline: "high-jump", club: "Isa Town Club", birthYear: 2009 },
  { slug: "demo-abbas-ebrahim", firstName: "Abbas", lastName: "Ebrahim", gender: "men", category: "senior", discipline: "triple-jump", club: "Manama Club", birthYear: 1996 },
  { slug: "demo-reem-al-khalifa", firstName: "Reem", lastName: "Al-Khalifa", gender: "women", category: "senior", discipline: "discus", club: "Riffa Athletics Club", birthYear: 1998 },
  { slug: "demo-mohamed-al-doseri", firstName: "Mohamed", lastName: "Al-Doseri", gender: "men", category: "senior", discipline: "marathon", club: "Bahrain Road Runners", birthYear: 1993, status: "active" },
  { slug: "demo-sara-hasan", firstName: "Sara", lastName: "Hasan", gender: "women", category: "u20", discipline: "400m", club: "Sitra Club", birthYear: 2007 },
  { slug: "demo-ali-al-aali", firstName: "Ali", lastName: "Al-Aali", gender: "men", category: "u18", discipline: "110m-hurdles", club: "Muharraq Club", birthYear: 2009 },
  { slug: "demo-jassim-al-qassab", firstName: "Jassim", lastName: "Al-Qassab", gender: "men", category: "senior", discipline: "decathlon", club: "Riffa Athletics Club", birthYear: 1995, status: "retired" },
] as const;

export const demoCompetitions = [
  { slug: "demo-baa-national-championships-2026", name: "BAA National Championships 2026", shortName: "Nationals 2026", level: "national", city: "Riffa", country: "Bahrain", venue: "National athletics stadium (TBC)", startDate: "2026-11-19", endDate: "2026-11-21", status: "upcoming", image: "stadium", description: "The national championships bring together Bahrain's clubs across all senior and youth categories." },
  { slug: "demo-baa-national-championships-2025", name: "BAA National Championships 2025", shortName: "Nationals 2025", level: "national", city: "Riffa", country: "Bahrain", venue: "National athletics stadium (TBC)", startDate: "2025-11-20", endDate: "2025-11-22", status: "completed", image: "emptyTrack", description: "Last season's national championships across senior and youth categories." },
  { slug: "demo-bahrain-open-meeting-2026", name: "Bahrain Open Meeting 2026", shortName: "Bahrain Open", level: "meeting", city: "Isa Town", country: "Bahrain", startDate: "2026-03-14", endDate: "2026-03-14", status: "completed", image: "trackRunner", description: "Early-season open meeting for national team selection marks." },
  { slug: "demo-winter-throws-series-2026", name: "Winter Throws Series", shortName: "Throws Series", level: "national", city: "Isa Town", country: "Bahrain", startDate: "2026-12-05", endDate: "2026-12-05", status: "upcoming", image: "javelinSky", description: "A one-day series for shot put, discus, javelin and hammer athletes." },
] as const;

export const demoEvents = [
  { slug: "demo-national-championships-2026", title: "BAA National Championships 2026", type: "championship", competition: "demo-baa-national-championships-2026", startAt: "2026-11-19T16:00:00+03:00", endAt: "2026-11-21T22:00:00+03:00", location: "National athletics stadium (TBC)", city: "Riffa", country: "Bahrain", status: "upcoming", description: "Three days of national title races across senior, U20 and U18 categories." },
  { slug: "demo-schools-cross-country-2026", title: "Schools Cross Country Festival", type: "community", startAt: "2026-10-24T07:00:00+03:00", endAt: "2026-10-24T11:00:00+03:00", location: "Riffa (venue TBC)", city: "Riffa", country: "Bahrain", status: "upcoming", description: "A development event introducing school pupils to cross-country running." },
  { slug: "demo-coaching-course-level-1", title: "World Athletics Coaching Course, Level 1", type: "national", startAt: "2026-10-12T09:00:00+03:00", endAt: "2026-10-16T14:00:00+03:00", location: "BAA headquarters, Riffa", city: "Riffa", country: "Bahrain", status: "upcoming", description: "Entry-level coaching education for club coaches and PE teachers." },
  { slug: "demo-winter-throws-series", title: "Winter Throws Series", type: "national", competition: "demo-winter-throws-series-2026", startAt: "2026-12-05T15:00:00+03:00", endAt: "2026-12-05T20:00:00+03:00", location: "Isa Town (venue TBC)", city: "Isa Town", country: "Bahrain", status: "upcoming", description: "Shot put, discus, javelin and hammer for senior and youth athletes." },
  { slug: "demo-national-road-10k", title: "National Road 10K", type: "national", startAt: "2027-01-16T06:30:00+03:00", endAt: "2027-01-16T09:30:00+03:00", location: "Bahrain Bay (route TBC)", city: "Manama", country: "Bahrain", status: "upcoming", description: "Road race for national ranking points and mass participation." },
] as const;

/** Demo result lines: [athleteSlug, competitionSlug, disciplineSlug, position, mark, date] */
export const demoResults: [string, string, string, number, string, string][] = [
  ["demo-yusuf-al-mannai", "demo-baa-national-championships-2025", "400m-hurdles", 1, "50.84", "2025-11-21"],
  ["demo-yusuf-al-mannai", "demo-bahrain-open-meeting-2026", "400m-hurdles", 1, "50.41", "2026-03-14"],
  ["demo-maryam-al-sayed", "demo-baa-national-championships-2025", "100m-hurdles", 1, "13.62", "2025-11-21"],
  ["demo-maryam-al-sayed", "demo-bahrain-open-meeting-2026", "100m-hurdles", 2, "13.71", "2026-03-14"],
  ["demo-hamad-jasim", "demo-baa-national-championships-2025", "javelin", 1, "71.25", "2025-11-22"],
  ["demo-hamad-jasim", "demo-bahrain-open-meeting-2026", "javelin", 1, "73.08", "2026-03-14"],
  ["demo-noor-abdulla", "demo-baa-national-championships-2025", "800m", 1, "2:08.44", "2025-11-22"],
  ["demo-noor-abdulla", "demo-bahrain-open-meeting-2026", "800m", 1, "2:06.90", "2026-03-14"],
  ["demo-salman-al-hashimi", "demo-baa-national-championships-2025", "shot-put", 1, "17.92", "2025-11-20"],
  ["demo-salman-al-hashimi", "demo-bahrain-open-meeting-2026", "shot-put", 2, "17.40", "2026-03-14"],
  ["demo-fatima-al-zayani", "demo-baa-national-championships-2025", "long-jump", 1, "6.12", "2025-11-20"],
  ["demo-fatima-al-zayani", "demo-bahrain-open-meeting-2026", "long-jump", 1, "6.24", "2026-03-14"],
  ["demo-khalid-buali", "demo-baa-national-championships-2025", "1500m", 2, "3:51.20", "2025-11-21"],
  ["demo-khalid-buali", "demo-bahrain-open-meeting-2026", "1500m", 1, "3:48.77", "2026-03-14"],
  ["demo-huda-mohamed", "demo-baa-national-championships-2025", "high-jump", 1, "1.71", "2025-11-21"],
  ["demo-abbas-ebrahim", "demo-baa-national-championships-2025", "triple-jump", 1, "15.88", "2025-11-22"],
  ["demo-abbas-ebrahim", "demo-bahrain-open-meeting-2026", "triple-jump", 3, "15.61", "2026-03-14"],
  ["demo-reem-al-khalifa", "demo-baa-national-championships-2025", "discus", 1, "48.30", "2025-11-20"],
  ["demo-sara-hasan", "demo-baa-national-championships-2025", "400m", 2, "55.81", "2025-11-21"],
  ["demo-sara-hasan", "demo-bahrain-open-meeting-2026", "400m", 1, "55.12", "2026-03-14"],
  ["demo-ali-al-aali", "demo-baa-national-championships-2025", "110m-hurdles", 1, "14.38", "2025-11-21"],
  ["demo-ali-al-aali", "demo-bahrain-open-meeting-2026", "110m-hurdles", 2, "14.51", "2026-03-14"],
  ["demo-khalid-buali", "demo-baa-national-championships-2025", "800m", 3, "1:52.66", "2025-11-22"],
  ["demo-noor-abdulla", "demo-baa-national-championships-2025", "1500m", 1, "4:27.31", "2025-11-21"],
];

export const demoNews = [
  { slug: "demo-national-championships-entries-open", title: "Entries open for the 2026 National Championships", excerpt: "Clubs can now register athletes for November's national championships in Riffa.", category: "federation", image: "stadium", publishedAt: "2026-10-01", competition: "demo-baa-national-championships-2026", body: "Entries are now open for the BAA National Championships 2026, scheduled for 19 to 21 November.\n\nClubs should submit entries through the competitions office before the closing date. The technical manual and event timetable are available in the documents library.\n\nThis article is demo content for the prototype." },
  { slug: "demo-coaching-pathway-launch", title: "A new pathway for club coaches", excerpt: "BAA's coach education programme starts with a Level 1 course in October.", category: "development", image: "fieldRunner", publishedAt: "2026-09-28", body: "The Association is launching a structured coach education pathway, starting with a World Athletics Level 1 course at BAA headquarters.\n\nThe course is aimed at club coaches and PE teachers who want to strengthen the grassroots base of Bahraini athletics.\n\nThis article is demo content for the prototype." },
] as const;

export const demoDocuments = [
  { title: "BAA Statutes", category: "governance", description: "The constitution governing the Association's structure and elections.", publishedAt: "2024-01-15" },
  { title: "Annual Report 2025", category: "reports", description: "Activities, results and finances for the 2025 season.", publishedAt: "2026-03-01" },
  { title: "National Championships 2026, Technical Manual", category: "competition", description: "Timetable, entry standards and regulations.", publishedAt: "2026-09-30" },
  { title: "Athlete Registration Form", category: "forms", description: "Register a new athlete with a member club.", publishedAt: "2026-01-10" },
  { title: "Safeguarding Policy", category: "governance", description: "How BAA protects young athletes and vulnerable adults.", publishedAt: "2025-06-01" },
  { title: "Selection Policy, International Championships", category: "competition", description: "Criteria for selection to national teams.", publishedAt: "2026-02-01" },
] as const;

export const demoCommittees = [
  { name: "Women Committee", chair: "Ruqaya Alghasra", remit: "Growing participation and leadership opportunities for women and girls in athletics." },
  { name: "Media and Development Committee", chair: "Mohamed Almahmeed", remit: "Communications, digital channels and athlete development programmes." },
  { name: "Anti-Doping Committee", chair: "Mohamed Yusuf Salman", remit: "Education and coordination with B-NADO and the Athletics Integrity Unit." },
  { name: "Referees and Competitions", chair: "Mohamed Ali Ahmed", remit: "Technical officials, competition calendar and event delivery." },
  { name: "Investment and Marketing Committee", chair: "Mohamed Ali Ahmadi", remit: "Partnerships, sponsorship and commercial programmes." },
] as const;
