async function printNdaSyllabus() {
  try {
    const url = `https://9fpwnwwgz32ufqdo.public.blob.vercel-storage.com/db/syllabusData.json?t=${Date.now()}`;
    const res = await fetch(url);
    let syllabus = await res.json();
    
    console.log(JSON.stringify(syllabus.nda.subjects.english, null, 2));
  } catch (err) {
    console.error(err);
  }
}

printNdaSyllabus();
