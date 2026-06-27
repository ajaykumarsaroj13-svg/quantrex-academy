const BLOB_TOKEN = "vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief";

async function fixNdaSyllabus() {
  try {
    const url = `https://9fpwnwwgz32ufqdo.public.blob.vercel-storage.com/db/syllabusData.json?t=${Date.now()}`;
    const res = await fetch(url);
    let syllabus = await res.json();
    
    let changed = false;
    if (syllabus.nda && syllabus.nda.subjects) {
      const subs = syllabus.nda.subjects;
      const subjectsToClean = ["english", "science", "general-studies"];
      
      for (const sub of subjectsToClean) {
        if (subs[sub] && subs[sub].chapters) {
          const originalLen = subs[sub].chapters.length;
          subs[sub].chapters = subs[sub].chapters.filter(ch => ch.title !== "Sets and Relations");
          if (subs[sub].chapters.length !== originalLen) {
            console.log(`Removed Sets and Relations from ${sub}`);
            changed = true;
          }
        }
      }
    }
    
    if (changed) {
      const jsonStr = JSON.stringify(syllabus);
      const filename = `db/syllabusData.json`;
      
      const putRes = await fetch(`https://blob.vercel-storage.com/${filename}`, {
        method: 'PUT',
        headers: {
          'authorization': `Bearer ${BLOB_TOKEN}`,
          'x-api-version': '7',
          'x-add-random-suffix': '0',
        },
        body: jsonStr
      });
      console.log("Successfully fixed syllabus.");
    } else {
      console.log("No changes needed or found.");
    }
  } catch (err) {
    console.error(err);
  }
}

fixNdaSyllabus();
