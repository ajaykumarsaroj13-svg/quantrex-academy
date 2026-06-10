import fs from 'fs';
import * as cheerio from 'cheerio'; // I'll use regex if cheerio is not there

const html = fs.readFileSync('room_home.html', 'utf8');
const match = html.match(/<script type="application\/json" data-nuxt-data="nuxt-app" data-ssr="[^"]*" id="__NUXT_DATA__">([\s\S]*?)<\/script>/);

if (match) {
    fs.writeFileSync('nuxt_payload.json', match[1]);
    console.log('Saved nuxt payload (length: ' + match[1].length + ')');
} else {
    console.log('NUXT_DATA not found in HTML.');
}
