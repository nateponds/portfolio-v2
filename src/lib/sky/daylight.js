const RAD = Math.PI / 180;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };

// Low-precision Julian-day solar coordinates; altitude also handles polar days.
export function solarAltitude(date, latitude, longitude) {
  const days = date.getTime()/86400000 - 10957.5;
  const mean = RAD*(357.5291+.98560028*days);
  const longitudeSun = mean + RAD*(1.9148*Math.sin(mean)+.02*Math.sin(2*mean)+.0003*Math.sin(3*mean)+102.9372+180);
  const obliquity = RAD*23.4397;
  const declination = Math.asin(Math.sin(longitudeSun)*Math.sin(obliquity));
  const rightAscension = Math.atan2(Math.sin(longitudeSun)*Math.cos(obliquity),Math.cos(longitudeSun));
  const hourAngle = RAD*(280.16+360.9856235*days+longitude)-rightAscension;
  return Math.asin(Math.sin(latitude*RAD)*Math.sin(declination)+Math.cos(latitude*RAD)*Math.cos(declination)*Math.cos(hourAngle))/RAD;
}

export function skyState(date, location = null) {
  const hour = date.getHours()+date.getMinutes()/60+date.getSeconds()/3600;
  const altitude = location ? solarAltitude(date,location.latitude,location.longitude) : 50*Math.sin((hour-6)*Math.PI/12);
  const nextAltitude = location ? solarAltitude(new Date(date.getTime()+60000),location.latitude,location.longitude) : 50*Math.sin((hour+1/60-6)*Math.PI/12);
  // Warm peak near sunset, fading out within twelve minutes on either side.
  const degreesPerMinute = Math.max(.04,Math.abs(nextAltitude-altitude));
  const minutesFromSunset = Math.abs(altitude+.833)/degreesPerMinute;
  const golden = nextAltitude < altitude ? 1-smooth(3,12,minutesFromSunset) : 0;
  const daylight = smooth(-8,5,altitude);
  return { daylight, golden, altitude, mode: golden>.25 ? 'sunset' : daylight>.5 ? 'day' : 'night' };
}

export async function approximateLocation() {
  const key = 'sky-location-v1';
  try {
    const cached = JSON.parse(sessionStorage.getItem(key));
    if(cached && Date.now()-cached.time<21600000 && valid(cached)) return cached;
  } catch { /* Storage is optional, including in private browsing. */ }
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(),3500);
  try {
    // IP-only lookup; no navigator.geolocation or precise GPS.
    // API contract: https://ipapi.co/api/#location-of-clients-ip
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer',
    });
    if(!response.ok) return null;
    const data = await response.json();
    if(data.error || !valid(data)) return null;
    const location = { latitude: Math.round(data.latitude), longitude: Math.round(data.longitude), time: Date.now() };
    try { sessionStorage.setItem(key,JSON.stringify(location)); } catch { /* No persistence required. */ }
    return location;
  } catch { return null; }
  finally { clearTimeout(timeout); }
}

function valid(value) {
  return Number.isFinite(value.latitude) && Math.abs(value.latitude)<=90 && Number.isFinite(value.longitude) && Math.abs(value.longitude)<=180;
}
