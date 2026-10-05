/**
 * Placeholder athletics photography (Unsplash licence, hotlinked from images.unsplash.com,
 * which Unsplash's API guidelines ask for). None of these photographs show BAA athletes:
 * they are art-direction placeholders until BAA supplies official photography through
 * the admin media library.
 */
export type Photo = { src: string; alt: string; credit: string; position?: string };

const u = (id: string) => `https://images.unsplash.com/${id}`;

export const photos = {
  blocks: { src: u("photo-1526676317768-d9b14f15615a"), alt: "Sprinter driving out of the starting blocks on a red track", credit: "Nicolas Hoizey / Unsplash" },
  sprintStart: { src: u("photo-1698671823406-035c77ff6fcd"), alt: "Runner starting a sprint on a red track", credit: "Braden Collum / Unsplash" },
  trackField: { src: u("photo-1461896836934-ffe607ba8211"), alt: "Athletes racing on a running track", credit: "Braden Collum / Unsplash" },
  raceStart: { src: u("photo-1763639700615-225fe7fdffff"), alt: "Male runner starting a race on a track", credit: "Peter Robbins / Unsplash" },
  trackRunner: { src: u("photo-1755877956621-5fac2eae4ebb"), alt: "Runner on a red track with white lane lines", credit: "Zhivko Minkov / Unsplash" },
  race: { src: u("photo-1696536823512-79d724454616"), alt: "Runner competing in a track race", credit: "Chris / Unsplash" },
  sunrise: { src: u("photo-1758922769578-68c5ba000d87"), alt: "Runner on a track at sunrise", credit: "Jorge Alberto Vega Barrera / Unsplash" },
  legs: { src: u("photo-1766970096346-937852c7d350"), alt: "Runner's legs in motion on a track", credit: "Felix Yu / Unsplash" },
  fieldRunner: { src: u("photo-1547941126-3d5322b218b0"), alt: "Person running on a track", credit: "Jakob Owens / Unsplash" },
  lanes: { src: u("photo-1474546652694-a33dd8161d66"), alt: "Red running track with numbered lanes", credit: "Austris Augusts / Unsplash" },
  laneLines: { src: u("photo-1549896869-ca27eeffe4fb"), alt: "Red running track lane markings", credit: "Lysander Yuen / Unsplash" },
  trackCurve: { src: u("photo-1617602378661-9da776b6a807"), alt: "Red and white track curve", credit: "Miłosz Sakowski / Unsplash" },
  stadiumSeats: { src: u("photo-1765261473063-ec862e10ba58"), alt: "Stadium seating above a running track", credit: "Takahiro Nishizono / Unsplash" },
  stadium: { src: u("photo-1765261371855-967aef597a9b"), alt: "Athletics stadium with running track and field", credit: "Takahiro Nishizono / Unsplash" },
  stadiumView: { src: u("photo-1710993115031-682d1a3c6529"), alt: "View of a track from the stands", credit: "Peter Robbins / Unsplash" },
  emptyTrack: { src: u("photo-1761386392976-cdb487cd4724"), alt: "Empty running track with stadium seating", credit: "Noe Fornells / Unsplash" },
  longJump: { src: u("photo-1772475625553-038d9d7e600c"), alt: "Athlete mid-jump during a long jump competition", credit: "Peter Zhan / Unsplash" },
  hurdles: { src: u("photo-1774748863093-f6935b7f49f8"), alt: "Female athlete clearing a hurdle", credit: "Nicholas Wilson / Unsplash" },
  menRunning: { src: u("photo-1538146888063-3ecf5e002d7c"), alt: "Men racing on a track", credit: "Jonathan Chng / Unsplash" },
  javelin: { src: u("photo-1780642207268-44f94bccf510"), alt: "Athlete throwing a javelin at sunset", credit: "Andri Aeschlimann / Unsplash" },
  javelinSky: { src: u("photo-1780319679838-c705a32fc756"), alt: "Athlete holding a javelin against a clear sky", credit: "Bohdan Hyrovych / Unsplash" },
  heritageHurdle: { src: u("photo-1579156618568-a641377ae974"), alt: "Archive photograph of a hurdler", credit: "Austrian National Library / Unsplash" },
  heritageJump: { src: u("photo-1579156618590-01d6ca62403d"), alt: "Archive photograph of a high jumper watched by a crowd", credit: "Austrian National Library / Unsplash" },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

/** Picks an atmospheric photo for a discipline group (used when an athlete has no portrait). */
export function photoForGroup(group?: string | null): Photo {
  switch (group) {
    case "sprints":
      return photos.sprintStart;
    case "hurdles":
      return photos.hurdles;
    case "jumps":
      return photos.longJump;
    case "throws":
      return photos.javelin;
    case "middle-distance":
      return photos.legs;
    case "long-distance":
    case "road":
      return photos.sunrise;
    default:
      return photos.trackField;
  }
}

export function isUnsplash(src: string) {
  return src.startsWith("https://images.unsplash.com/");
}

export function findPhoto(src?: string | null): Photo | undefined {
  if (!src) return undefined;
  return Object.values(photos).find((p) => p.src === src);
}
