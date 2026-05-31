# 🚀 Quantrex Academy Deployment Guide (Hosting Guide)

यह गाइड आपको **Quantrex Academy** वेबसाइट को पूरी तरह से **मुफ़्त (100% Free)** होस्ट और डिप्लॉय करने में मदद करेगी। अब हमने पूरे आर्किटेक्चर को सिम्पलीफाई कर दिया है ताकि **Frontend और Backend दोनों एक साथ Vercel पर होस्ट हो सकें**। इससे आपको Render पर अलग से होस्टिंग सेटअप करने की कोई ज़रूरत नहीं है!

---

## 📋 Pre-requisites (ज़रूरी चीज़ें)
1. **GitHub Account**: आपका सारा कोड GitHub रिपॉजिटरी में होना चाहिए।
2. **MongoDB Atlas Account**: फ्री क्लाउड डेटाबेस के लिए।
3. **Vercel Account**: वेबसाइट को लाइव होस्ट करने के लिए।

---

## 🛠️ Step 1: MongoDB Atlas Setup (फ्री डेटाबेस)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) पर जाएं और फ्री अकाउंट बनाएं।
2. एक नया **Shared Cluster (M0 Free)** बनाएं।
3. **Database Access** टैब में जाकर एक नया यूजर बनाएं (Username & Password याद रखें)।
4. **Network Access** टैब में जाकर **Allow Access from Anywhere** (`0.0.0.0/0`) ऐड करें (ताकि Vercel कनेक्ट हो सके)।
5. **Database/Clusters** पर जाएं, **Connect** पर क्लिक करें, और **Drivers / Node.js** कनेक्शन स्ट्रिंग को कॉपी करें। 
   - कनेक्शन स्ट्रिंग कुछ इस तरह दिखेगी:
     `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/quantrex?retryWrites=true&w=majority`
   - `<password>` को अपने बनाए गए डेटाबेस यूजर के पासवर्ड से बदलें।

---

## 🎨 Step 2: Push Code to GitHub (कोड को गिटहब पर डालें)

1. अपने प्रोजेक्ट को गिटहब पर अपलोड करें:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Vercel Serverless Ready"
   # GitHub पर नई Repository बनाकर उसे रिमोट लिंक करें
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

---

## ⚙️ Step 3: Unified Deployment on Vercel (Vercel पर डिप्लॉयमेंट)

हमने प्रोजेक्ट को इस तरह कॉन्फ़िगर किया है कि Vercel के अंदर `api` फोल्डर सर्वरलेस फंक्शंस (Express) की तरह काम करता है।

1. [Vercel](https://vercel.com/) पर जाएं और लॉगिन करें।
2. **Add New...** -> **Project** पर क्लिक करें।
3. गिटहब रिपॉजिटरी को इम्पोर्ट करें।
4. निम्नलिखित सेटिंग्स कॉन्फ़िगर करें:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables** (ज़रूरी सेटिंग्स) सेक्शन में निम्न वेरिएबल जोड़ें:
   - `MONGODB_URI` = `your_mongodb_atlas_connection_string` (Step 1 वाली स्ट्रिंग)
   - `JWT_SECRET` = `any_strong_random_secret_string` (जैसे: `quantrex_sec_123!@#`)
6. **Deploy** पर क्लिक करें।
7. डिप्लॉयमेंट कंप्लीट होने पर आपको Vercel की तरफ से एक फ्री डोमेन मिलेगा (जैसे `https://frontend-phi-lyart-50.vercel.app`), जिसमें फ्री **SSL Certificate (HTTPS)** पहले से एक्टिव होगा।

---

## 🔒 Step 4: Verification

1. Vercel द्वारा दिए गए डोमेन पर जाएं।
2. लॉगिन, साइनअप और स्टूडेंट पैनल चेक करें।
3. एडमिन पैनल (`admin@quantrex.com` / `admin123`) में जाकर नया टेस्ट बनाकर या कोई कोर्स परमिशन बदल कर डेटाबेस अपडेट्स को वेरिफाई करें।
4. यदि आप अपना कस्टम डोमेन कनेक्ट करना चाहते हैं (जैसे `www.quantrexacademy.com`), तो Vercel Dashboard में **Settings -> Domains** पर जाकर आसानी से अपना डोमेन जोड़ सकते हैं और DNS सेटिंग्स अपडेट कर सकते हैं। यह भी बिल्कुल फ्री है (केवल डोमेन खरीदने का चार्ज लगेगा, SSL और होस्टिंग फ्री रहेगी)।

---

🎉 **बधाई हो! आपकी Quantrex Academy वेबसाइट अब लाइव और पूरी तरह से फ्री में चलने के लिए तैयार है!**
