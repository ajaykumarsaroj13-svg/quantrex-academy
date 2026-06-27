import urllib.request
import os
from gtts import gTTS

os.makedirs('public/characters/audio/correct', exist_ok=True)
os.makedirs('public/characters/audio/wrong', exist_ok=True)
os.makedirs('public/characters/images', exist_ok=True)

correct_data = [
    {
        "name": "Lord Rama",
        "text": "वत्स! तुम्हारा उत्तर सर्वथा सत्य एवं उचित है। विजय तुम्हारी निश्चित है।",
        "img": "https://images.openai.com/static-rsc-4/8VUfDKfdBGh3tPelbCEF1JrJ1W7_p-PchhP0IAMCYkgqDpkfRMGHbwWJQPj-rWitoWVgmTQfkesyeke0moXdOA1TC1IhZHo0Le1JvfS3yjhHl14FVkCI-LRGbSYz3qTa6bK_7qTJ256CzI8fDSP1tHOXKjfoRVEGp5bGYL9PropE4kmPuAQ9_Wts5BehTrLs?purpose=fullsize"
    },
    {
        "name": "Hanuman",
        "text": "अति उत्तम! तुम्हारी बुद्धि और परिश्रम तुम्हें महान बनाएंगे।",
        "img": "https://images.openai.com/static-rsc-4/pDtQlSiB8Gy7CTfpr6zGHLXSJNZWq6bq5T3khUCefqFI5SllBJ6tvno48rM-nAlgQ3_vv4Qz5eAFKpRIruBusU6APC9qHqOMrDMRtH8v3nWtZNgQDSxMRdnmPxog_8Aw2aDqGaF0j1JJKBgIZpYVkaxozoRgdCvS5qLqZVHpHBE_e-5HzYena1WNGNKpNVzb?purpose=fullsize"
    },
    {
        "name": "Krishna",
        "text": "साधु! यही एकाग्रता तुम्हें लक्ष्य तक पहुँचाएगी।",
        "img": "https://images.openai.com/static-rsc-4/BAFSkj0kSZAk6vMbew9zM5OkOF91Cpm2XHqgPUPHs5YAnrdgKg0rzqZ-2CpscSLhAdN3Cd6RpWfmMIfg53TCsk500nfnqqPi_ypn89LsvD4ITm8Q-sJeTuid2p0ply9vteuV6Eb-Y2zh3EdXsRW9FT3or6iErjzkZbsIzqF6OUOu1rgbuN4kmBFcMxR9rx58?purpose=fullsize"
    },
    {
        "name": "Guru",
        "text": "शिष्य, तुम्हारा उत्तर ज्ञान के मार्ग को प्रकाशित करता है।",
        "img": "https://images.openai.com/static-rsc-4/EFOnvUbc8jJBlJnYFWTC4Eq9YZMf-z1cW7xIQAUl3xUQW_dpOkT9lxfIPJ-mtw1G5CbyNspayDWeq2kmgrLcySDjokWzDN9MjrxuoKbDyL5M0GRMcKoGDOUhr4Mj2v4k5YGxWqo9xMQLgRXZrJa7vP11tBilM20mWkNI5QujlZT-STDDtB3ovfw93Yb1LNOd?purpose=fullsize"
    },
    {
        "name": "Topper",
        "text": "वत्स! तुम ज्ञानयुद्ध में विजयी पथ पर अग्रसर हो।",
        "img": ""
    }
]

wrong_data = [
    {
        "name": "Ravana",
        "text": "वत्स, यह उत्तर उचित नहीं। पुनः विचार करो।",
        "img": "https://images.openai.com/static-rsc-4/iSF2JNOdyFVARdxuDo40RbOGQFy9Ke_w8ZmWyu7y2N5WOPF1HibJHr2tWlJ4qH99XB-zeGM0m4rOBOASv16hFigcYFpm5SRMJrciI-JYrTLIL6yoB69OC9nkBQRkji3VG_Ezr3RgE0Wzd9Jzas7hObgUh5BCA3x4-rvWZPEXTlovS5LtHcsGc3NPMinyBq3N?purpose=fullsize"
    },
    {
        "name": "Kamsa",
        "text": "अज्ञान का त्याग करो, पुनः प्रयास ही विजय का मार्ग है।",
        "img": "https://images.openai.com/static-rsc-4/G8F7PXwdbA2-HTSWeqjkPWHcTsExB34DSF1ib2IMAIyajtDpOVrXyFGvp2gFrp6_ktSqrvtmmnS4-r3NriLmh_eNeiUVyoWDpq_hv6b-7ZMx_kDtXdYdf7BUQZs8PChl-Uye6DVoVK5vGCEkTR6Ptx5ne32FyPbON8R_clK7LoBpNqHiaGXqgzYUeqqvXKvs?purpose=fullsize"
    },
    {
        "name": "Guru Warning",
        "text": "त्रुटि होना स्वाभाविक है, परंतु उससे सीखना अनिवार्य है।",
        "img": "https://images.openai.com/static-rsc-4/Bg-6Adhkrwh3I6o-WS1Sf26nEApoUqRmnR-I7v6NHJybGgaEJXpP54_Q1BRTu6qnveIPO_LTuh1yVRCf7mHK6HnTyCoxFcJx7JAzyVjDM2od9AYVNxbDoqRg_7n2MZ4ezVTQGjsSkXjEdygzw0NsGwuH0S5sEPLtUOdKTrKjpSo0ywuxQ4auLfHeldWwmX5y?purpose=fullsize"
    },
    {
        "name": "Mahabharata",
        "text": "युद्धभूमि में भूल क्षम्य है, किंतु पुनः वही भूल नहीं।",
        "img": "https://images.openai.com/static-rsc-4/YdXr7YHXWWrAkUr3tl9VwegVZ1ymTlsTD7LB0JuWXyVQg-tW8mmUXTQLljAI0flXy-jjX2WgUJhFgSCXTunAb11YrmeO94YaqhBymFiHrIEDDpzniIOpOyZMJzx_CmHCsFNwQLW65zvoZK1Pc0U3BZOX-23C8JEOkuIbcZAd50ns4Fe3NcZZx5X8v1M-cZuA?purpose=fullsize"
    }
]

def process_data(data, category):
    for i, item in enumerate(data):
        name = item['name'].replace(' ', '_').lower()
        
        # Download image
        if item['img']:
            try:
                urllib.request.urlretrieve(item['img'], f"public/characters/images/{category}_{name}.png")
                print(f"Downloaded image for {name}")
            except Exception as e:
                print(f"Failed to download image for {name}: {e}")
        
        # Generate audio
        try:
            tts = gTTS(item['text'], lang='hi')
            tts.save(f"public/characters/audio/{category}/{name}.mp3")
            print(f"Generated audio for {name}")
        except Exception as e:
            print(f"Failed to generate audio for {name}: {e}")

print("Processing correct data...")
process_data(correct_data, 'correct')

print("Processing wrong data...")
process_data(wrong_data, 'wrong')

print("Done!")
