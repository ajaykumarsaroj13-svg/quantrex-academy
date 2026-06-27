const token = "vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief";

const toppers = [
  { id: "t1", name: "Arkadeep Jana", rank: "99.85 %ile", score: "JEE Main 2026", year: "2026", photo: "/images/toppers/arkadeep_new2.png?v=new8", testimonial: "Best platform for JEE preparation.", isPoster: true },
  { id: "t2", name: "Yash Pant", rank: "99.2 %ile", score: "JEE Main 2026", year: "2026", photo: "/images/toppers/yash_new2.png?v=new8", testimonial: "The detailed analytics helped me find my weak spots.", isPoster: true },
  { id: "t3", name: "Topper 3", rank: "AIR", score: "JEE Advanced", year: "2026", photo: "/images/toppers/top_1.png?v=new8", testimonial: "", isPoster: true },
  { id: "t4", name: "Topper 4", rank: "AIR", score: "JEE Advanced", year: "2026", photo: "/images/toppers/top_2.png?v=new8", testimonial: "", isPoster: true },
  { id: "t5", name: "Topper 5", rank: "AIR", score: "JEE Advanced", year: "2026", photo: "/images/toppers/top_3.png?v=new8", testimonial: "", isPoster: true }
];

async function upload() {
  try {
    const filename = `db/toppersData.json`;
    const response = await fetch(`https://blob.vercel-storage.com/${filename}`, {
      method: 'PUT',
      headers: {
        'authorization': `Bearer ${token}`,
        'x-api-version': '7',
        'x-add-random-suffix': '0',
      },
      body: JSON.stringify(toppers)
    });
    
    if (!response.ok) throw new Error(`Blob upload failed: ${response.statusText}`);
    const blob = await response.json();
    console.log('Successfully uploaded toppersData to:', blob.url);
  } catch (error) {
    console.error('Error uploading:', error);
  }
}

upload();
